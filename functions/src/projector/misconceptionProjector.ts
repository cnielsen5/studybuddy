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
import {
  reduceMisconceptionEdge,
  shouldApplyMisconceptionEvent,
  MisconceptionEdgeView,
} from "./reducers/misconceptionReducers";

const MisconceptionProbeResultPayloadSchema = z.object({
  confirmed: z.boolean(),
  explanation_quality: z.enum(["good", "weak"]).optional(),
  seconds_spent: z.number().nonnegative(),
});

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

    if (event.entity.kind !== "misconception_edge") {
      return {
        success: false,
        eventId: event.event_id,
        misconceptionId: event.entity.id,
        viewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "misconception_edge", got "${event.entity.kind}"`,
      };
    }

    const misconceptionId = event.entity.id;
    const viewPath = getMisconceptionEdgeViewPath(event.user_id, event.library_id, misconceptionId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? (viewDoc.data() as MisconceptionEdgeView) : undefined;

    const shouldApply = shouldApplyMisconceptionEvent(currentView, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        misconceptionId: misconceptionId,
        viewUpdated: false,
        idempotent: true,
      };
    }

    const updatedView = reduceMisconceptionEdge(currentView, event);
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

