/**
 * Card View Reducers
 * 
 * Pure functions that compute the next view state from the previous state and an event.
 * These reducers are:
 * - Pure (no side effects)
 * - Deterministic (same input = same output)
 * - Idempotent (applying same event twice = no change)
 * - Monotonic (constraints hold: no negative values, etc.)
 */

import { UserEvent } from "../eventProjector";
import { CardReviewedPayloadSchema } from "../../validation/schemas";
import { z } from "zod";

type CardReviewedPayload = z.infer<typeof CardReviewedPayloadSchema>;

export interface CardScheduleView {
  type: "card_schedule_view";
  card_id: string;
  library_id: string;
  user_id: string;
  state: number; // 0=new, 1=learning, 2=review, 3=mastered
  due_at: string;
  stability: number;
  difficulty: number;
  interval_days: number;
  last_reviewed_at: string;
  last_grade: "again" | "hard" | "good" | "easy";
  last_applied: {
    received_at: string;
    event_id: string;
  };
  updated_at: string;
}

export interface CardPerformanceView {
  type: "card_performance_view";
  card_id: string;
  library_id: string;
  user_id: string;
  total_reviews: number;
  correct_reviews: number;
  accuracy_rate: number;
  avg_seconds: number;
  streak: number;
  max_streak: number;
  last_reviewed_at: string;
  last_applied: {
    received_at: string;
    event_id: string;
  };
  updated_at: string;
}

/**
 * Reduces a card_reviewed event to update CardScheduleView
 * 
 * @param prev - Previous view state (undefined for new cards)
 * @param event - The card_reviewed event
 * @returns New view state
 */
export function reduceCardSchedule(
  prev: CardScheduleView | undefined,
  event: UserEvent
): CardScheduleView {
  const payload = CardReviewedPayloadSchema.parse(event.payload);
  const cardId = event.entity.id;

  // Initialize defaults if no previous state
  const currentStability = prev?.stability || 1.0;
  const currentDifficulty = prev?.difficulty || 5.0;
  const currentState = prev?.state || 0;

  // FSRS-like grade multipliers
  const gradeMultipliers: Record<string, number> = {
    again: 0.5,
    hard: 0.8,
    good: 1.2,
    easy: 1.5,
  };
  const multiplier = gradeMultipliers[payload.grade] || 1.0;
  
  // Calculate new stability (monotonic: always >= 0.1)
  const newStability = Math.max(0.1, currentStability * multiplier);
  
  // Calculate new difficulty (monotonic: bounded between 0.1 and 10.0)
  const newDifficulty = Math.max(0.1, Math.min(10.0, currentDifficulty + (payload.grade === "again" ? 0.1 : -0.05)));

  // Calculate next due date (monotonic: at least 1 day)
  const daysUntilDue = Math.max(1, Math.floor(newStability));
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + daysUntilDue);

  // State transitions (monotonic: state can only increase or reset on lapse)
  let newState = currentState;
  if (currentState === 0 && payload.grade !== "again") {
    newState = 1; // new -> learning
  } else if (currentState === 1 && newStability > 7 && payload.grade !== "again") {
    newState = 2; // learning -> review
  } else if (currentState === 2 && newStability > 90 && payload.grade !== "again") {
    newState = 3; // review -> mastered
  } else if (payload.grade === "again" && currentState > 0) {
    newState = Math.max(1, currentState - 1); // Lapse: move back but not to new
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
 * Reduces a card_reviewed event to update CardPerformanceView
 * 
 * @param prev - Previous view state (undefined for new cards)
 * @param event - The card_reviewed event
 * @returns New view state
 */
export function reduceCardPerformance(
  prev: CardPerformanceView | undefined,
  event: UserEvent
): CardPerformanceView {
  const payload = CardReviewedPayloadSchema.parse(event.payload);
  const cardId = event.entity.id;

  // Initialize defaults
  const currentTotalReviews = prev?.total_reviews || 0;
  const currentCorrectReviews = prev?.correct_reviews || 0;
  const currentAvgSeconds = prev?.avg_seconds || 0;
  const currentStreak = prev?.streak || 0;
  const currentMaxStreak = prev?.max_streak || 0;

  // Update counts (monotonic: always increase)
  const newTotalReviews = currentTotalReviews + 1;
  const isCorrect = payload.grade !== "again";
  const newCorrectReviews = isCorrect ? currentCorrectReviews + 1 : currentCorrectReviews;

  // Update accuracy rate (monotonic: bounded between 0 and 1)
  const newAccuracyRate = Math.max(0, Math.min(1, newCorrectReviews / newTotalReviews));

  // Update average seconds (exponential moving average, monotonic: always >= 0)
  const alpha = 0.2;
  const newAvgSeconds = Math.max(0, currentAvgSeconds * (1 - alpha) + payload.seconds_spent * alpha);

  // Update streak (monotonic: reset to 0 on incorrect, increment on correct)
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

/**
 * Checks if an event should be applied based on idempotency
 * 
 * @param prev - Previous view state
 * @param event - The event to check
 * @returns true if event should be applied, false if idempotent skip
 */
export function shouldApplyCardEvent(
  prev: CardScheduleView | CardPerformanceView | undefined,
  event: UserEvent
): boolean {
  if (!prev) return true;
  
  const viewTimestamp = new Date(prev.last_applied.received_at).getTime();
  const eventTimestamp = new Date(event.received_at).getTime();
  
  if (eventTimestamp > viewTimestamp) return true;
  if (eventTimestamp === viewTimestamp && event.event_id !== prev.last_applied.event_id) return true;
  if (event.event_id === prev.last_applied.event_id) return false; // Idempotent skip
  return false; // Out of order
}

