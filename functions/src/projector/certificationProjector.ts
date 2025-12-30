/**
 * Certification Event Projector
 * 
 * Projects mastery_certification_completed events to:
 * - ConceptCertificationView: users/{uid}/libraries/{libraryId}/views/concept_certification/{conceptId}
 * 
 * Tracks certification status and may affect card scheduling (suppression, acceleration).
 */

import { Firestore } from "@google-cloud/firestore";
import { UserEvent } from "./eventProjector";
import { MasteryCertificationCompletedPayloadSchema } from "../validation/schemas";
import { z } from "zod";

type MasteryCertificationCompletedPayload = z.infer<typeof MasteryCertificationCompletedPayloadSchema>;

export interface CertificationProjectionResult {
  success: boolean;
  eventId: string;
  conceptId: string;
  viewUpdated: boolean;
  idempotent: boolean;
  error?: string;
}

/**
 * Gets the view path for ConceptCertificationView
 */
function getConceptCertificationViewPath(userId: string, libraryId: string, conceptId: string): string {
  return `users/${userId}/libraries/${libraryId}/views/concept_certification/${conceptId}`;
}

/**
 * Checks if event should be applied based on last_applied cursor
 */
function shouldApplyEvent(
  viewLastApplied: { received_at: string; event_id: string } | undefined,
  event: UserEvent
): boolean {
  if (!viewLastApplied) return true;
  const viewTimestamp = new Date(viewLastApplied.received_at).getTime();
  const eventTimestamp = new Date(event.received_at).getTime();
  if (eventTimestamp > viewTimestamp) return true;
  if (eventTimestamp === viewTimestamp && event.event_id !== viewLastApplied.event_id) return true;
  if (event.event_id === viewLastApplied.event_id) return false;
  return false;
}

/**
 * Projects a mastery_certification_completed event to ConceptCertificationView
 */
export async function projectMasteryCertificationCompletedEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<CertificationProjectionResult> {
  try {
    const payloadValidation = MasteryCertificationCompletedPayloadSchema.safeParse(event.payload);
    if (!payloadValidation.success) {
      return {
        success: false,
        eventId: event.event_id,
        conceptId: event.entity.id,
        viewUpdated: false,
        idempotent: false,
        error: `Invalid payload: ${payloadValidation.error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    const payload = payloadValidation.data;
    const conceptId = event.entity.id;

    if (event.entity.kind !== "concept") {
      return {
        success: false,
        eventId: event.event_id,
        conceptId: conceptId,
        viewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "concept", got "${event.entity.kind}"`,
      };
    }

    const viewPath = getConceptCertificationViewPath(event.user_id, event.library_id, conceptId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? viewDoc.data() : undefined;

    const shouldApply = shouldApplyEvent(currentView?.last_applied, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        conceptId: conceptId,
        viewUpdated: false,
        idempotent: true,
      };
    }

    // Calculate accuracy from certification results
    const accuracy = payload.questions_answered > 0
      ? payload.correct_count / payload.questions_answered
      : 0;

    // Build updated view
    const updatedView = {
      type: "concept_certification_view",
      concept_id: conceptId,
      library_id: event.library_id,
      user_id: event.user_id,
      certification_result: payload.certification_result,
      certification_date: event.occurred_at,
      questions_answered: payload.questions_answered,
      correct_count: payload.correct_count,
      accuracy: accuracy,
      reasoning_quality: payload.reasoning_quality,
      // Track certification history
      certification_history: [
        ...(currentView?.certification_history || []),
        {
          certification_result: payload.certification_result,
          date: event.occurred_at,
          questions_answered: payload.questions_answered,
          correct_count: payload.correct_count,
          reasoning_quality: payload.reasoning_quality,
        },
      ],
      last_applied: {
        received_at: event.received_at,
        event_id: event.event_id,
      },
      updated_at: new Date().toISOString(),
    };

    await viewRef.set(updatedView, { merge: false });

    // TODO: If certification is "full", may need to:
    // 1. Suppress related cards (update CardScheduleView to mark as suppressed)
    // 2. Accelerate related cards (if partial certification)
    // This would require additional Firestore operations or separate triggers

    return {
      success: true,
      eventId: event.event_id,
      conceptId: conceptId,
      viewUpdated: true,
      idempotent: false,
    };
  } catch (error) {
    return {
      success: false,
      eventId: event.event_id,
      conceptId: event.entity.id,
      viewUpdated: false,
      idempotent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

