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
import {
  reduceConceptCertification,
  shouldApplyCertificationEvent,
  ConceptCertificationView,
} from "./reducers/certificationReducers";

import { getConceptCertificationViewPath } from "../viewPaths";
import { applyCertificationScheduleEffects } from "./applyCertificationScheduleEffects";

export interface CertificationProjectionResult {
  success: boolean;
  eventId: string;
  conceptId: string;
  viewUpdated: boolean;
  schedulesUpdated: number;
  idempotent: boolean;
  error?: string;
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
        schedulesUpdated: 0,
        idempotent: false,
        error: `Invalid payload: ${payloadValidation.error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    if (event.entity.kind !== "concept") {
      return {
        success: false,
        eventId: event.event_id,
        conceptId: event.entity.id,
        viewUpdated: false,
        schedulesUpdated: 0,
        idempotent: false,
        error: `Expected entity.kind to be "concept", got "${event.entity.kind}"`,
      };
    }

    const conceptId = event.entity.id;
    const viewPath = getConceptCertificationViewPath(event.user_id, event.library_id, conceptId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? (viewDoc.data() as ConceptCertificationView) : undefined;

    const shouldApply = shouldApplyCertificationEvent(currentView, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        conceptId: conceptId,
        viewUpdated: false,
        schedulesUpdated: 0,
        idempotent: true,
      };
    }

    const updatedView = reduceConceptCertification(currentView, event);
    await viewRef.set(updatedView, { merge: false });

    const schedulesUpdated = await applyCertificationScheduleEffects(
      firestore,
      event,
      conceptId,
      payloadValidation.data.certification_result
    );

    return {
      success: true,
      eventId: event.event_id,
      conceptId: conceptId,
      viewUpdated: true,
      schedulesUpdated,
      idempotent: false,
    };
  } catch (error) {
    return {
      success: false,
      eventId: event.event_id,
      conceptId: event.entity.id,
      viewUpdated: false,
      schedulesUpdated: 0,
      idempotent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

