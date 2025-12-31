/**
 * Question View Reducers
 * 
 * Pure functions for question performance view updates.
 */

import { UserEvent } from "../eventProjector";
import { QuestionAttemptedPayloadSchema } from "../../validation/schemas";

// Type for payload validation (used implicitly via schema.parse)
// type QuestionAttemptedPayload = z.infer<typeof QuestionAttemptedPayloadSchema>;

export interface QuestionPerformanceView {
  type: "question_performance_view";
  question_id: string;
  library_id: string;
  user_id: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy_rate: number;
  avg_seconds: number;
  streak: number;
  max_streak: number;
  last_attempted_at: string;
  last_applied: {
    received_at: string;
    event_id: string;
  };
  updated_at: string;
}

/**
 * Reduces a question_attempted event to update QuestionPerformanceView
 */
export function reduceQuestionPerformance(
  prev: QuestionPerformanceView | undefined,
  event: UserEvent
): QuestionPerformanceView {
  const payload = QuestionAttemptedPayloadSchema.parse(event.payload);
  const questionId = event.entity.id;

  const currentTotalAttempts = prev?.total_attempts || 0;
  const currentCorrectAttempts = prev?.correct_attempts || 0;
  const currentAvgSeconds = prev?.avg_seconds || 0;
  const currentStreak = prev?.streak || 0;
  const currentMaxStreak = prev?.max_streak || 0;

  const newTotalAttempts = currentTotalAttempts + 1;
  const isCorrect = payload.correct;
  const newCorrectAttempts = isCorrect ? currentCorrectAttempts + 1 : currentCorrectAttempts;
  const newAccuracyRate = Math.max(0, Math.min(1, newCorrectAttempts / newTotalAttempts));

  const alpha = 0.2;
  const newAvgSeconds = Math.max(0, currentAvgSeconds * (1 - alpha) + payload.seconds_spent * alpha);

  let newStreak = isCorrect ? currentStreak + 1 : 0;
  const newMaxStreak = Math.max(currentMaxStreak, newStreak);

  return {
    type: "question_performance_view",
    question_id: questionId,
    library_id: event.library_id,
    user_id: event.user_id,
    total_attempts: newTotalAttempts,
    correct_attempts: newCorrectAttempts,
    accuracy_rate: newAccuracyRate,
    avg_seconds: newAvgSeconds,
    streak: newStreak,
    max_streak: newMaxStreak,
    last_attempted_at: event.occurred_at,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

/**
 * Checks if an event should be applied based on idempotency
 */
export function shouldApplyQuestionEvent(
  prev: QuestionPerformanceView | undefined,
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

