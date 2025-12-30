/**
 * Card Event Projector
 * 
 * Projects card_reviewed events to:
 * - CardScheduleView: users/{uid}/libraries/{libraryId}/views/card_schedule/{cardId}
 * - CardPerformanceView: users/{uid}/libraries/{libraryId}/views/card_perf/{cardId}
 * 
 * Implements idempotency via last_applied cursor comparison.
 * Uses pure reducer functions for business logic.
 */

import { Firestore } from "@google-cloud/firestore";
import { UserEvent } from "./eventProjector";
import { CardReviewedPayloadSchema } from "../validation/schemas";
import {
  reduceCardSchedule,
  reduceCardPerformance,
  shouldApplyCardEvent,
} from "./reducers/cardReducers";
import { z } from "zod";

type CardReviewedPayload = z.infer<typeof CardReviewedPayloadSchema>;

export interface CardProjectionResult {
  success: boolean;
  eventId: string;
  cardId: string;
  scheduleViewUpdated: boolean;
  performanceViewUpdated: boolean;
  idempotent: boolean;
  error?: string;
}

/**
 * Gets the view path for CardScheduleView
 */
function getCardScheduleViewPath(userId: string, libraryId: string, cardId: string): string {
  return `users/${userId}/libraries/${libraryId}/views/card_schedule/${cardId}`;
}

/**
 * Gets the view path for CardPerformanceView
 */
function getCardPerformanceViewPath(userId: string, libraryId: string, cardId: string): string {
  return `users/${userId}/libraries/${libraryId}/views/card_perf/${cardId}`;
}

// Idempotency check is now handled by shouldApplyCardEvent from reducers

// Removed - now using reduceCardSchedule from reducers

// Removed - now using reduceCardPerformance from reducers

/**
 * Projects a card_reviewed event to both schedule and performance views
 * Uses a transaction to ensure atomicity
 */
export async function projectCardReviewedEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<CardProjectionResult> {
  try {
    // Validate payload
    const payloadValidation = CardReviewedPayloadSchema.safeParse(event.payload);
    if (!payloadValidation.success) {
      return {
        success: false,
        eventId: event.event_id,
        cardId: event.entity.id,
        scheduleViewUpdated: false,
        performanceViewUpdated: false,
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
        scheduleViewUpdated: false,
        performanceViewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "card", got "${event.entity.kind}"`,
      };
    }

    // Use transaction to ensure both views are updated atomically
    const result = await firestore.runTransaction(async (transaction) => {
      const scheduleViewPath = getCardScheduleViewPath(event.user_id, event.library_id, cardId);
      const performanceViewPath = getCardPerformanceViewPath(event.user_id, event.library_id, cardId);

      const scheduleViewRef = firestore.doc(scheduleViewPath);
      const performanceViewRef = firestore.doc(performanceViewPath);

      // Read both views in transaction
      const [scheduleViewDoc, performanceViewDoc] = await Promise.all([
        transaction.get(scheduleViewRef),
        transaction.get(performanceViewRef),
      ]);

      const scheduleView = scheduleViewDoc.exists ? scheduleViewDoc.data() : undefined;
      const performanceView = performanceViewDoc.exists ? performanceViewDoc.data() : undefined;

      // Check idempotency for both views using pure reducer functions
      const shouldApplySchedule = shouldApplyCardEvent(scheduleView, event);
      const shouldApplyPerformance = shouldApplyCardEvent(performanceView, event);

      // If both are idempotent, skip
      if (!shouldApplySchedule && !shouldApplyPerformance) {
        return {
          scheduleUpdated: false,
          performanceUpdated: false,
          idempotent: true,
        };
      }

      // Calculate updates using pure reducers
      const scheduleUpdate = shouldApplySchedule
        ? reduceCardSchedule(scheduleView, event)
        : null;
      const performanceUpdate = shouldApplyPerformance
        ? reduceCardPerformance(performanceView, event)
        : null;

      // Apply updates in transaction
      if (scheduleUpdate) {
        transaction.set(scheduleViewRef, scheduleUpdate, { merge: false });
      }
      if (performanceUpdate) {
        transaction.set(performanceViewRef, performanceUpdate, { merge: false });
      }

      return {
        scheduleUpdated: shouldApplySchedule,
        performanceUpdated: shouldApplyPerformance,
        idempotent: false,
      };
    });

    return {
      success: true,
      eventId: event.event_id,
      cardId: cardId,
      scheduleViewUpdated: result.scheduleUpdated,
      performanceViewUpdated: result.performanceUpdated,
      idempotent: result.idempotent,
    };
  } catch (error) {
    return {
      success: false,
      eventId: event.event_id,
      cardId: event.entity.id,
      scheduleViewUpdated: false,
      performanceViewUpdated: false,
      idempotent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Removed - now using pure reducers: reduceCardSchedule and reduceCardPerformance

