import type { ReviewGrade, UserEvent } from "./types";

export function generateEventId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `evt_${timestamp}_${random}`;
}

export function createCardReviewedEvent(params: {
  userId: string;
  libraryId: string;
  cardId: string;
  grade: ReviewGrade;
  secondsSpent: number;
  deviceId?: string;
}): UserEvent {
  const now = new Date().toISOString();

  return {
    event_id: generateEventId(),
    type: "card_reviewed",
    user_id: params.userId,
    library_id: params.libraryId,
    occurred_at: now,
    received_at: now,
    device_id: params.deviceId ?? "unknown",
    entity: { kind: "card", id: params.cardId },
    payload: {
      grade: params.grade,
      seconds_spent: params.secondsSpent,
    },
    schema_version: "1.0",
  };
}

export function createQuestionAttemptedEvent(params: {
  userId: string;
  libraryId: string;
  questionId: string;
  selectedOptionId: string;
  correct: boolean;
  secondsSpent: number;
  deviceId?: string;
}): UserEvent {
  const now = new Date().toISOString();

  return {
    event_id: generateEventId(),
    type: "question_attempted",
    user_id: params.userId,
    library_id: params.libraryId,
    occurred_at: now,
    received_at: now,
    device_id: params.deviceId ?? "unknown",
    entity: { kind: "question", id: params.questionId },
    payload: {
      selected_option_id: params.selectedOptionId,
      correct: params.correct,
      seconds_spent: params.secondsSpent,
    },
    schema_version: "1.0",
  };
}

export function createMasteryCertificationCompletedEvent(params: {
  userId: string;
  libraryId: string;
  conceptId: string;
  certificationResult: "full" | "partial" | "none";
  questionsAnswered: number;
  correctCount: number;
  reasoningQuality?: "good" | "weak";
  deviceId?: string;
}): UserEvent {
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    certification_result: params.certificationResult,
    questions_answered: params.questionsAnswered,
    correct_count: params.correctCount,
  };
  if (params.reasoningQuality !== undefined) {
    payload.reasoning_quality = params.reasoningQuality;
  }

  return {
    event_id: generateEventId(),
    type: "mastery_certification_completed",
    user_id: params.userId,
    library_id: params.libraryId,
    occurred_at: now,
    received_at: now,
    device_id: params.deviceId ?? "unknown",
    entity: { kind: "concept", id: params.conceptId },
    payload,
    schema_version: "1.0",
  };
}
