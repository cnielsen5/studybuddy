/**
 * Misconception Event Projector
 * 
 * Projects misconception_probe_result events to:
 * - MisconceptionEdgeView: users/{uid}/libraries/{libraryId}/views/misconception_edge/{misconceptionId}
 * 
 * Updates misconception strength and evidence based on probe results.
 */

import { Firestore } from "@google-cloud/firestore";
import { UserEvent } from "./eventProjector";
import { z } from "zod";

const MisconceptionProbeResultPayloadSchema = z.object({
  confirmed: z.boolean(),
  explanation_quality: z.enum(["good", "weak"]).optional(),
  seconds_spent: z.number().nonnegative(),
});

type MisconceptionProbeResultPayload = z.infer<typeof MisconceptionProbeResultPayloadSchema>;

export interface MisconceptionProjectionResult {
  success: boolean;
  eventId: string;
  misconceptionId: string;
  viewUpdated: boolean;
  idempotent: boolean;
  error?: string;
}

function getMisconceptionEdgeViewPath(userId: string, libraryId: string, misconceptionId: string): string {
  return `users/${userId}/libraries/${libraryId}/views/misconception_edge/${misconceptionId}`;
}

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

function calculateMisconceptionViewUpdate(
  currentView: any,
  event: UserEvent,
  payload: MisconceptionProbeResultPayload
): any {
  const misconceptionId = event.entity.id;
  const currentStrength = currentView?.strength || 0.5;
  const currentEvidence = currentView?.evidence || {
    relationship_failures: 0,
    high_confidence_errors: 0,
    probe_confirmations: 0,
  };

  // Update strength based on confirmation
  let newStrength = currentStrength;
  if (payload.confirmed) {
    // Increase strength when confirmed
    newStrength = Math.min(1.0, currentStrength + 0.1);
  } else {
    // Decrease strength when not confirmed
    newStrength = Math.max(0.0, currentStrength - 0.05);
  }

  // Update evidence
  const newEvidence = {
    relationship_failures: currentEvidence.relationship_failures || 0,
    high_confidence_errors: currentEvidence.high_confidence_errors || 0,
    probe_confirmations: (currentEvidence.probe_confirmations || 0) + (payload.confirmed ? 1 : 0),
  };

  // Update status based on strength
  let newStatus = currentView?.status || "active";
  if (newStrength < 0.2) {
    newStatus = "resolved";
  } else if (newStrength > 0.8) {
    newStatus = "strong";
  } else {
    newStatus = "active";
  }

  return {
    type: "misconception_edge_view",
    misconception_id: misconceptionId,
    library_id: event.library_id,
    user_id: event.user_id,
    concept_a_id: currentView?.concept_a_id || "",
    concept_b_id: currentView?.concept_b_id || "",
    direction: currentView?.direction || {},
    misconception_type: currentView?.misconception_type || "unknown",
    strength: newStrength,
    status: newStatus,
    first_observed_at: currentView?.first_observed_at || event.occurred_at,
    last_observed_at: event.occurred_at,
    evidence: newEvidence,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

export async function projectMisconceptionProbeResultEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<MisconceptionProjectionResult> {
  try {
    const payloadValidation = MisconceptionProbeResultPayloadSchema.safeParse(event.payload);
    if (!payloadValidation.success) {
      return {
        success: false,
        eventId: event.event_id,
        misconceptionId: event.entity.id,
        viewUpdated: false,
        idempotent: false,
        error: `Invalid payload: ${payloadValidation.error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    const payload = payloadValidation.data;
    const misconceptionId = event.entity.id;

    if (event.entity.kind !== "misconception_edge") {
      return {
        success: false,
        eventId: event.event_id,
        misconceptionId: misconceptionId,
        viewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "misconception_edge", got "${event.entity.kind}"`,
      };
    }

    const viewPath = getMisconceptionEdgeViewPath(event.user_id, event.library_id, misconceptionId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? viewDoc.data() : undefined;

    const shouldApply = shouldApplyEvent(currentView?.last_applied, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        misconceptionId: misconceptionId,
        viewUpdated: false,
        idempotent: true,
      };
    }

    const updatedView = calculateMisconceptionViewUpdate(currentView, event, payload);
    await viewRef.set(updatedView, { merge: false });

    return {
      success: true,
      eventId: event.event_id,
      misconceptionId: misconceptionId,
      viewUpdated: true,
      idempotent: false,
    };
  } catch (error) {
    return {
      success: false,
      eventId: event.event_id,
      misconceptionId: event.entity.id,
      viewUpdated: false,
      idempotent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

