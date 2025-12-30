/**
 * Card Event Projector
 * 
 * Projects card_reviewed events to:
 * - CardScheduleView: users/{uid}/libraries/{libraryId}/views/card_schedule/{cardId}
 * - CardPerformanceView: users/{uid}/libraries/{libraryId}/views/card_perf/{cardId}
 * 
 * Implements idempotency via last_applied cursor comparison.
 */

import { Firestore } from "@google-cloud/firestore";
import { UserEvent } from "./eventProjector";
import { CardReviewedPayloadSchema } from "../validation/schemas";
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

/**
 * Checks if event should be applied based on last_applied cursor
 * Returns true if event should be applied (newer or same event_id)
 */
function shouldApplyEvent(
  viewLastApplied: { received_at: string; event_id: string } | undefined,
  event: UserEvent
): boolean {
  if (!viewLastApplied) {
    return true; // No previous event, apply this one
  }

  // Compare by received_at timestamp
  const viewTimestamp = new Date(viewLastApplied.received_at).getTime();
  const eventTimestamp = new Date(event.received_at).getTime();

  if (eventTimestamp > viewTimestamp) {
    return true; // Event is newer
  }

  if (eventTimestamp === viewTimestamp && event.event_id !== viewLastApplied.event_id) {
    // Same timestamp but different event_id - apply (handles edge case)
    return true;
  }

  if (event.event_id === viewLastApplied.event_id) {
    return false; // Same event - idempotent skip
  }

  // Event is older - should not apply (out of order)
  return false;
}

/**
 * Projects card_reviewed event to CardScheduleView
 * 
 * Note: This is a simplified implementation. In production, you would:
 * - Apply FSRS algorithm to calculate new stability/difficulty
 * - Update due date based on grade
 * - Handle state transitions (new -> learning -> review -> mastered)
 */
async function projectToCardScheduleView(
  firestore: Firestore,
  event: UserEvent,
  payload: CardReviewedPayload,
  cardId: string
): Promise<{ updated: boolean; idempotent: boolean }> {
  const viewPath = getCardScheduleViewPath(event.user_id, event.library_id, cardId);
  const viewRef = firestore.doc(viewPath);

  // Read current view
  const viewDoc = await viewRef.get();
  const currentView = viewDoc.exists ? viewDoc.data() : undefined;

  // Check idempotency
  const shouldApply = shouldApplyEvent(currentView?.last_applied, event);
  if (!shouldApply) {
    return { updated: false, idempotent: true };
  }

  // Calculate new schedule state (simplified - in production use FSRS)
  const currentStability = currentView?.stability || 1.0;
  const currentDifficulty = currentView?.difficulty || 5.0;
  const currentState = currentView?.state || 0; // 0=new, 1=learning, 2=review, 3=mastered

  // Simplified FSRS update (grade-based stability adjustment)
  const gradeMultipliers: Record<string, number> = {
    again: 0.5,
    hard: 0.8,
    good: 1.2,
    easy: 1.5,
  };
  const multiplier = gradeMultipliers[payload.grade] || 1.0;
  const newStability = Math.max(0.1, currentStability * multiplier);
  const newDifficulty = Math.max(0.1, Math.min(10.0, currentDifficulty + (payload.grade === "again" ? 0.1 : -0.05)));

  // Calculate next due date (simplified - in production use FSRS)
  const daysUntilDue = Math.max(1, Math.floor(newStability));
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + daysUntilDue);

  // Update state based on stability (simplified logic)
  let newState = currentState;
  if (currentState === 0 && payload.grade !== "again") {
    newState = 1; // new -> learning
  } else if (currentState === 1 && newStability > 7 && payload.grade !== "again") {
    newState = 2; // learning -> review
  } else if (currentState === 2 && newStability > 90 && payload.grade !== "again") {
    newState = 3; // review -> mastered
  } else if (payload.grade === "again" && currentState > 0) {
    newState = Math.max(1, currentState - 1); // Lapse
  }

  // Build updated view
  const updatedView = {
    type: "card_schedule_view",
    card_id: cardId,
    library_id: event.library_id,
    user_id: event.user_id,
    state: newState,
    due_at: nextDueDate.toISOString(),
    stability: newStability,
    difficulty: newDifficulty,
    interval_days: daysUntilDue,
    last_reviewed_at: event.occurred_at,
    last_grade: payload.grade,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };

  await viewRef.set(updatedView, { merge: false });

  return { updated: true, idempotent: false };
}

/**
 * Projects card_reviewed event to CardPerformanceView
 * 
 * Updates performance metrics based on the review.
 */
async function projectToCardPerformanceView(
  firestore: Firestore,
  event: UserEvent,
  payload: CardReviewedPayload,
  cardId: string
): Promise<{ updated: boolean; idempotent: boolean }> {
  const viewPath = getCardPerformanceViewPath(event.user_id, event.library_id, cardId);
  const viewRef = firestore.doc(viewPath);

  // Read current view
  const viewDoc = await viewRef.get();
  const currentView = viewDoc.exists ? viewDoc.data() : undefined;

  // Check idempotency
  const shouldApply = shouldApplyEvent(currentView?.last_applied, event);
  if (!shouldApply) {
    return { updated: false, idempotent: true };
  }

  // Calculate new performance metrics
  const currentTotalReviews = currentView?.total_reviews || 0;
  const currentCorrectReviews = currentView?.correct_reviews || 0;
  const currentAvgSeconds = currentView?.avg_seconds || 0;
  const currentStreak = currentView?.streak || 0;
  const currentMaxStreak = currentView?.max_streak || 0;

  // Update counts
  const newTotalReviews = currentTotalReviews + 1;
  const isCorrect = payload.grade !== "again";
  const newCorrectReviews = isCorrect ? currentCorrectReviews + 1 : currentCorrectReviews;

  // Update accuracy rate
  const newAccuracyRate = newCorrectReviews / newTotalReviews;

  // Update average seconds (exponential moving average)
  const alpha = 0.2; // Weight for new value
  const newAvgSeconds = currentAvgSeconds * (1 - alpha) + payload.seconds_spent * alpha;

  // Update streak
  let newStreak = isCorrect ? currentStreak + 1 : 0;
  const newMaxStreak = Math.max(currentMaxStreak, newStreak);

  // Build updated view
  const updatedView = {
    type: "card_performance_view",
    card_id: cardId,
    library_id: event.library_id,
    user_id: event.user_id,
    total_reviews: newTotalReviews,
    correct_reviews: newCorrectReviews,
    accuracy_rate: newAccuracyRate,
    avg_seconds: newAvgSeconds,
    streak: newStreak,
    max_streak: newMaxStreak,
    last_reviewed_at: event.occurred_at,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };

  await viewRef.set(updatedView, { merge: false });

  return { updated: true, idempotent: false };
}

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

      // Check idempotency for both views
      const shouldApplySchedule = shouldApplyEvent(scheduleView?.last_applied, event);
      const shouldApplyPerformance = shouldApplyEvent(performanceView?.last_applied, event);

      // If both are idempotent, skip
      if (!shouldApplySchedule && !shouldApplyPerformance) {
        return {
          scheduleUpdated: false,
          performanceUpdated: false,
          idempotent: true,
        };
      }

      // Calculate updates (same logic as non-transactional version)
      const scheduleUpdate = shouldApplySchedule
        ? calculateScheduleViewUpdate(scheduleView, event, payload)
        : null;
      const performanceUpdate = shouldApplyPerformance
        ? calculatePerformanceViewUpdate(performanceView, event, payload)
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

/**
 * Calculates the updated CardScheduleView (helper for transaction)
 */
function calculateScheduleViewUpdate(
  currentView: any,
  event: UserEvent,
  payload: CardReviewedPayload
): any {
  const cardId = event.entity.id;
  const currentStability = currentView?.stability || 1.0;
  const currentDifficulty = currentView?.difficulty || 5.0;
  const currentState = currentView?.state || 0;

  const gradeMultipliers: Record<string, number> = {
    again: 0.5,
    hard: 0.8,
    good: 1.2,
    easy: 1.5,
  };
  const multiplier = gradeMultipliers[payload.grade] || 1.0;
  const newStability = Math.max(0.1, currentStability * multiplier);
  const newDifficulty = Math.max(0.1, Math.min(10.0, currentDifficulty + (payload.grade === "again" ? 0.1 : -0.05)));

  const daysUntilDue = Math.max(1, Math.floor(newStability));
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + daysUntilDue);

  let newState = currentState;
  if (currentState === 0 && payload.grade !== "again") {
    newState = 1;
  } else if (currentState === 1 && newStability > 7 && payload.grade !== "again") {
    newState = 2;
  } else if (currentState === 2 && newStability > 90 && payload.grade !== "again") {
    newState = 3;
  } else if (payload.grade === "again" && currentState > 0) {
    newState = Math.max(1, currentState - 1);
  }

  return {
    type: "card_schedule_view",
    card_id: cardId,
    library_id: event.library_id,
    user_id: event.user_id,
    state: newState,
    due_at: nextDueDate.toISOString(),
    stability: newStability,
    difficulty: newDifficulty,
    interval_days: daysUntilDue,
    last_reviewed_at: event.occurred_at,
    last_grade: payload.grade,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

/**
 * Calculates the updated CardPerformanceView (helper for transaction)
 */
function calculatePerformanceViewUpdate(
  currentView: any,
  event: UserEvent,
  payload: CardReviewedPayload
): any {
  const cardId = event.entity.id;
  const currentTotalReviews = currentView?.total_reviews || 0;
  const currentCorrectReviews = currentView?.correct_reviews || 0;
  const currentAvgSeconds = currentView?.avg_seconds || 0;
  const currentStreak = currentView?.streak || 0;
  const currentMaxStreak = currentView?.max_streak || 0;

  const newTotalReviews = currentTotalReviews + 1;
  const isCorrect = payload.grade !== "again";
  const newCorrectReviews = isCorrect ? currentCorrectReviews + 1 : currentCorrectReviews;
  const newAccuracyRate = newCorrectReviews / newTotalReviews;

  const alpha = 0.2;
  const newAvgSeconds = currentAvgSeconds * (1 - alpha) + payload.seconds_spent * alpha;

  let newStreak = isCorrect ? currentStreak + 1 : 0;
  const newMaxStreak = Math.max(currentMaxStreak, newStreak);

  return {
    type: "card_performance_view",
    card_id: cardId,
    library_id: event.library_id,
    user_id: event.user_id,
    total_reviews: newTotalReviews,
    correct_reviews: newCorrectReviews,
    accuracy_rate: newAccuracyRate,
    avg_seconds: newAvgSeconds,
    streak: newStreak,
    max_streak: newMaxStreak,
    last_reviewed_at: event.occurred_at,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

