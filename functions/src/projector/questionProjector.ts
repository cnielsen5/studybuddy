/**
 * Question Event Projector
 * 
 * Projects question_attempted events to:
 * - QuestionPerformanceView: users/{uid}/libraries/{libraryId}/views/question_perf/{questionId}
 * 
 * Implements idempotency via last_applied cursor comparison.
 */

import { Firestore } from "@google-cloud/firestore";
import { UserEvent } from "./eventProjector";
import { QuestionAttemptedPayloadSchema } from "../validation/schemas";
import { z } from "zod";

type QuestionAttemptedPayload = z.infer<typeof QuestionAttemptedPayloadSchema>;

export interface QuestionProjectionResult {
  success: boolean;
  eventId: string;
  questionId: string;
  performanceViewUpdated: boolean;
  idempotent: boolean;
  error?: string;
}

/**
 * Gets the view path for QuestionPerformanceView
 */
function getQuestionPerformanceViewPath(userId: string, libraryId: string, questionId: string): string {
  return `users/${userId}/libraries/${libraryId}/views/question_perf/${questionId}`;
}

/**
 * Checks if event should be applied based on last_applied cursor
 */
function shouldApplyEvent(
  viewLastApplied: { received_at: string; event_id: string } | undefined,
  event: UserEvent
): boolean {
  if (!viewLastApplied) {
    return true;
  }

  const viewTimestamp = new Date(viewLastApplied.received_at).getTime();
  const eventTimestamp = new Date(event.received_at).getTime();

  if (eventTimestamp > viewTimestamp) {
    return true;
  }

  if (eventTimestamp === viewTimestamp && event.event_id !== viewLastApplied.event_id) {
    return true;
  }

  if (event.event_id === viewLastApplied.event_id) {
    return false;
  }

  return false;
}

/**
 * Calculates the updated QuestionPerformanceView
 */
function calculatePerformanceViewUpdate(
  currentView: any,
  event: UserEvent,
  payload: QuestionAttemptedPayload
): any {
  const questionId = event.entity.id;
  const currentTotalAttempts = currentView?.total_attempts || 0;
  const currentCorrectAttempts = currentView?.correct_attempts || 0;
  const currentAvgSeconds = currentView?.avg_seconds || 0;
  const currentStreak = currentView?.streak || 0;
  const currentMaxStreak = currentView?.max_streak || 0;

  const newTotalAttempts = currentTotalAttempts + 1;
  const isCorrect = payload.correct;
  const newCorrectAttempts = isCorrect ? currentCorrectAttempts + 1 : currentCorrectAttempts;
  const newAccuracyRate = newCorrectAttempts / newTotalAttempts;

  const alpha = 0.2;
  const newAvgSeconds = currentAvgSeconds * (1 - alpha) + payload.seconds_spent * alpha;

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
 * Projects a question_attempted event to QuestionPerformanceView
 */
export async function projectQuestionAttemptedEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<QuestionProjectionResult> {
  try {
    const payloadValidation = QuestionAttemptedPayloadSchema.safeParse(event.payload);
    if (!payloadValidation.success) {
      return {
        success: false,
        eventId: event.event_id,
        questionId: event.entity.id,
        performanceViewUpdated: false,
        idempotent: false,
        error: `Invalid payload: ${payloadValidation.error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    const payload = payloadValidation.data;
    const questionId = event.entity.id;

    if (event.entity.kind !== "question") {
      return {
        success: false,
        eventId: event.event_id,
        questionId: questionId,
        performanceViewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "question", got "${event.entity.kind}"`,
      };
    }

    const viewPath = getQuestionPerformanceViewPath(event.user_id, event.library_id, questionId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? viewDoc.data() : undefined;

    const shouldApply = shouldApplyEvent(currentView?.last_applied, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        questionId: questionId,
        performanceViewUpdated: false,
        idempotent: true,
      };
    }

    const updatedView = calculatePerformanceViewUpdate(currentView, event, payload);
    await viewRef.set(updatedView, { merge: false });

    return {
      success: true,
      eventId: event.event_id,
      questionId: questionId,
      performanceViewUpdated: true,
      idempotent: false,
    };
  } catch (error) {
    return {
      success: false,
      eventId: event.event_id,
      questionId: event.entity.id,
      performanceViewUpdated: false,
      idempotent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

