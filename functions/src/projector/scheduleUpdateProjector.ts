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
import {
  reduceAccelerationApplied,
  reduceLapseApplied,
  shouldApplyScheduleUpdateEvent,
} from "./reducers/scheduleUpdateReducers";
import { CardScheduleView } from "./reducers/cardReducers";

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

    if (event.entity.kind !== "card") {
      return {
        success: false,
        eventId: event.event_id,
        cardId: event.entity.id,
        viewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "card", got "${event.entity.kind}"`,
      };
    }

    const cardId = event.entity.id;
    const viewPath = getCardScheduleViewPath(event.user_id, event.library_id, cardId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? (viewDoc.data() as CardScheduleView) : undefined;

    const shouldApply = shouldApplyScheduleUpdateEvent(currentView, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        cardId: cardId,
        viewUpdated: false,
        idempotent: true,
      };
    }

    const updatedView = reduceAccelerationApplied(currentView, event);
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

    if (event.entity.kind !== "card") {
      return {
        success: false,
        eventId: event.event_id,
        cardId: event.entity.id,
        viewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "card", got "${event.entity.kind}"`,
      };
    }

    const cardId = event.entity.id;
    const viewPath = getCardScheduleViewPath(event.user_id, event.library_id, cardId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? (viewDoc.data() as CardScheduleView) : undefined;

    const shouldApply = shouldApplyScheduleUpdateEvent(currentView, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        cardId: cardId,
        viewUpdated: false,
        idempotent: true,
      };
    }

    const updatedView = reduceLapseApplied(currentView, event);
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

