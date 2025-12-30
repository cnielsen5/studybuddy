/**
 * Schedule Update Projector
 * 
 * Projects acceleration_applied and lapse_applied events to:
 * - CardScheduleView: users/{uid}/libraries/{libraryId}/views/card_schedule/{cardId}
 * 
 * These events explicitly update card scheduling state (stability, due date)
 * without requiring a card_reviewed event.
 */

import { Firestore } from "@google-cloud/firestore";
import { UserEvent } from "./eventProjector";
import { z } from "zod";

const AccelerationAppliedPayloadSchema = z.object({
  original_stability: z.number().positive(),
  new_stability: z.number().positive(),
  next_due_days: z.number().nonnegative(),
  trigger: z.string(),
});

const LapseAppliedPayloadSchema = z.object({
  original_stability: z.number().positive(),
  new_stability: z.number().positive(),
  effective_penalty: z.number().min(0).max(1),
  trigger: z.string(),
});

type AccelerationAppliedPayload = z.infer<typeof AccelerationAppliedPayloadSchema>;
type LapseAppliedPayload = z.infer<typeof LapseAppliedPayloadSchema>;

export interface ScheduleUpdateProjectionResult {
  success: boolean;
  eventId: string;
  cardId: string;
  viewUpdated: boolean;
  idempotent: boolean;
  error?: string;
}

function getCardScheduleViewPath(userId: string, libraryId: string, cardId: string): string {
  return `users/${userId}/libraries/${libraryId}/views/card_schedule/${cardId}`;
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

export async function projectAccelerationAppliedEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<ScheduleUpdateProjectionResult> {
  try {
    const payloadValidation = AccelerationAppliedPayloadSchema.safeParse(event.payload);
    if (!payloadValidation.success) {
      return {
        success: false,
        eventId: event.event_id,
        cardId: event.entity.id,
        viewUpdated: false,
        idempotent: false,
        error: `Invalid payload: ${payloadValidation.error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    const payload = payloadValidation.data;
    const cardId = event.entity.id;

    if (event.entity.kind !== "card") {
      return {
        success: false,
        eventId: event.event_id,
        cardId: cardId,
        viewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "card", got "${event.entity.kind}"`,
      };
    }

    const viewPath = getCardScheduleViewPath(event.user_id, event.library_id, cardId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? viewDoc.data() : undefined;

    const shouldApply = shouldApplyEvent(currentView?.last_applied, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        cardId: cardId,
        viewUpdated: false,
        idempotent: true,
      };
    }

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + payload.next_due_days);

    const updatedView = {
      type: "card_schedule_view",
      card_id: cardId,
      library_id: event.library_id,
      user_id: event.user_id,
      state: currentView?.state || 2, // review state
      due_at: nextDueDate.toISOString(),
      stability: payload.new_stability,
      difficulty: currentView?.difficulty || 5.0,
      interval_days: payload.next_due_days,
      last_reviewed_at: currentView?.last_reviewed_at || event.occurred_at,
      last_grade: currentView?.last_grade || "good",
      last_applied: {
        received_at: event.received_at,
        event_id: event.event_id,
      },
      updated_at: new Date().toISOString(),
    };

    await viewRef.set(updatedView, { merge: false });

    return {
      success: true,
      eventId: event.event_id,
      cardId: cardId,
      viewUpdated: true,
      idempotent: false,
    };
  } catch (error) {
    return {
      success: false,
      eventId: event.event_id,
      cardId: event.entity.id,
      viewUpdated: false,
      idempotent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function projectLapseAppliedEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<ScheduleUpdateProjectionResult> {
  try {
    const payloadValidation = LapseAppliedPayloadSchema.safeParse(event.payload);
    if (!payloadValidation.success) {
      return {
        success: false,
        eventId: event.event_id,
        cardId: event.entity.id,
        viewUpdated: false,
        idempotent: false,
        error: `Invalid payload: ${payloadValidation.error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    const payload = payloadValidation.data;
    const cardId = event.entity.id;

    if (event.entity.kind !== "card") {
      return {
        success: false,
        eventId: event.event_id,
        cardId: cardId,
        viewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "card", got "${event.entity.kind}"`,
      };
    }

    const viewPath = getCardScheduleViewPath(event.user_id, event.library_id, cardId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? viewDoc.data() : undefined;

    const shouldApply = shouldApplyEvent(currentView?.last_applied, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        cardId: cardId,
        viewUpdated: false,
        idempotent: true,
      };
    }

    // Calculate new due date based on reduced stability
    const daysUntilDue = Math.max(1, Math.floor(payload.new_stability));
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + daysUntilDue);

    // Lapse typically moves card back to learning state
    const newState = Math.max(1, (currentView?.state || 2) - 1);

    const updatedView = {
      type: "card_schedule_view",
      card_id: cardId,
      library_id: event.library_id,
      user_id: event.user_id,
      state: newState,
      due_at: nextDueDate.toISOString(),
      stability: payload.new_stability,
      difficulty: Math.min(10.0, (currentView?.difficulty || 5.0) + 0.1), // Increase difficulty on lapse
      interval_days: daysUntilDue,
      last_reviewed_at: currentView?.last_reviewed_at || event.occurred_at,
      last_grade: "again",
      last_applied: {
        received_at: event.received_at,
        event_id: event.event_id,
      },
      updated_at: new Date().toISOString(),
    };

    await viewRef.set(updatedView, { merge: false });

    return {
      success: true,
      eventId: event.event_id,
      cardId: cardId,
      viewUpdated: true,
      idempotent: false,
    };
  } catch (error) {
    return {
      success: false,
      eventId: event.event_id,
      cardId: event.entity.id,
      viewUpdated: false,
      idempotent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

