/**
 * Relationship View Reducers
 * 
 * Pure functions for relationship card view updates.
 */

import { UserEvent } from "../eventProjector";
import { z } from "zod";

const RelationshipReviewedPayloadSchema = z.object({
  concept_a_id: z.string(),
  concept_b_id: z.string(),
  direction: z.object({
    from: z.string(),
    to: z.string(),
  }),
  correct: z.boolean(),
  high_confidence: z.boolean(),
  seconds_spent: z.number().nonnegative(),
});

type RelationshipReviewedPayload = z.infer<typeof RelationshipReviewedPayloadSchema>;

export interface RelationshipScheduleView {
  type: "relationship_schedule_view";
  relationship_card_id: string;
  library_id: string;
  user_id: string;
  state: number;
  due_at: string;
  stability: number;
  difficulty: number;
  interval_days: number;
  last_reviewed_at: string;
  last_correct: boolean;
  last_applied: {
    received_at: string;
    event_id: string;
  };
  updated_at: string;
}

export interface RelationshipPerformanceView {
  type: "relationship_performance_view";
  relationship_card_id: string;
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

export function reduceRelationshipSchedule(
  prev: RelationshipScheduleView | undefined,
  event: UserEvent
): RelationshipScheduleView {
  const payload = RelationshipReviewedPayloadSchema.parse(event.payload);
  const relationshipCardId = event.entity.id;

  // Convert correct/high_confidence to grade-like value
  let grade: "again" | "hard" | "good" | "easy";
  if (!payload.correct) {
    grade = "again";
  } else if (payload.high_confidence) {
    grade = "easy";
  } else {
    grade = "good";
  }

  const currentStability = prev?.stability || 1.0;
  const currentDifficulty = prev?.difficulty || 5.0;
  const currentState = prev?.state || 0;

  const gradeMultipliers: Record<string, number> = {
    again: 0.5,
    hard: 0.8,
    good: 1.2,
    easy: 1.5,
  };
  const multiplier = gradeMultipliers[grade] || 1.0;
  const newStability = Math.max(0.1, currentStability * multiplier);
  const newDifficulty = Math.max(0.1, Math.min(10.0, currentDifficulty + (grade === "again" ? 0.1 : -0.05)));

  const daysUntilDue = Math.max(1, Math.floor(newStability));
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + daysUntilDue);

  let newState = currentState;
  if (currentState === 0 && grade !== "again") {
    newState = 1;
  } else if (currentState === 1 && newStability > 7 && grade !== "again") {
    newState = 2;
  } else if (currentState === 2 && newStability > 90 && grade !== "again") {
    newState = 3;
  } else if (grade === "again" && currentState > 0) {
    newState = Math.max(1, currentState - 1);
  }

  return {
    type: "relationship_schedule_view",
    relationship_card_id: relationshipCardId,
    library_id: event.library_id,
    user_id: event.user_id,
    state: newState,
    due_at: nextDueDate.toISOString(),
    stability: newStability,
    difficulty: newDifficulty,
    interval_days: daysUntilDue,
    last_reviewed_at: event.occurred_at,
    last_correct: payload.correct,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

export function reduceRelationshipPerformance(
  prev: RelationshipPerformanceView | undefined,
  event: UserEvent
): RelationshipPerformanceView {
  const payload = RelationshipReviewedPayloadSchema.parse(event.payload);
  const relationshipCardId = event.entity.id;

  const currentTotalReviews = prev?.total_reviews || 0;
  const currentCorrectReviews = prev?.correct_reviews || 0;
  const currentAvgSeconds = prev?.avg_seconds || 0;
  const currentStreak = prev?.streak || 0;
  const currentMaxStreak = prev?.max_streak || 0;

  const newTotalReviews = currentTotalReviews + 1;
  const isCorrect = payload.correct;
  const newCorrectReviews = isCorrect ? currentCorrectReviews + 1 : currentCorrectReviews;
  const newAccuracyRate = newTotalReviews > 0 ? Math.max(0, Math.min(1, newCorrectReviews / newTotalReviews)) : 0;

  const alpha = 0.2;
  const newAvgSeconds = Math.max(0, currentAvgSeconds * (1 - alpha) + payload.seconds_spent * alpha);

  let newStreak = isCorrect ? currentStreak + 1 : 0;
  const newMaxStreak = Math.max(currentMaxStreak, newStreak);

  return {
    type: "relationship_performance_view",
    relationship_card_id: relationshipCardId,
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

export function shouldApplyRelationshipEvent(
  prev: RelationshipScheduleView | RelationshipPerformanceView | undefined,
  event: UserEvent
): boolean {
  if (!prev) return true;
  const viewTimestamp = new Date(prev.last_applied.received_at).getTime();
  const eventTimestamp = new Date(event.received_at).getTime();
  if (eventTimestamp > viewTimestamp) return true;
  if (eventTimestamp === viewTimestamp && event.event_id !== prev.last_applied.event_id) return true;
  if (event.event_id === prev.last_applied.event_id) return false;
  return false;
}

