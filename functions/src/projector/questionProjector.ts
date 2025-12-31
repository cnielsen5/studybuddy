/**
 * Question Event Projector
 * 
 * Projects question_attempted events to:
 * - QuestionPerformanceView: users/{uid}/libraries/{libraryId}/views/question_perf/{questionId}
 * 
 * Implements idempotency via last_applied cursor comparison.
 * Uses pure reducer functions for business logic.
 */

import { Firestore } from "@google-cloud/firestore";
import { UserEvent } from "./eventProjector";
import { QuestionAttemptedPayloadSchema } from "../validation/schemas";
import {
  reduceQuestionPerformance,
  shouldApplyQuestionEvent,
  QuestionPerformanceView,
} from "./reducers/questionReducers";

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

// Idempotency check and calculation now handled by pure reducers

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
    const currentView = viewDoc.exists 
      ? (viewDoc.data() as QuestionPerformanceView)
      : undefined;

    const shouldApply = shouldApplyQuestionEvent(currentView, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        questionId: questionId,
        performanceViewUpdated: false,
        idempotent: true,
      };
    }

    const updatedView = reduceQuestionPerformance(currentView, event);
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

