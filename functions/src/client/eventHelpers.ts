/**
 * Client-Side Event Creation Helpers
 * 
 * Helper functions to create events locally before validation and upload.
 */

import { UserEvent } from "./eventClient";
import { CardReviewedPayloadSchema } from "../validation/schemas";
import { z } from "zod";

type CardReviewedPayload = z.infer<typeof CardReviewedPayloadSchema>;

/**
 * Generates a unique event ID
 * Format: evt_{timestamp}_{random}
 * 
 * @returns Unique event ID
 */
export function generateEventId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `evt_${timestamp}_${random}`;
}

/**
 * Creates a card_reviewed event
 * 
 * @param params - Event parameters
 * @returns Unvalidated event (should be validated before upload)
 */
export function createCardReviewedEvent(params: {
  userId: string;
  libraryId: string;
  cardId: string;
  grade: "again" | "hard" | "good" | "easy";
  secondsSpent: number;
  deviceId?: string;
  occurredAt?: string;
  eventId?: string;
}): Omit<UserEvent, "schema_version"> & { schema_version: string } {
  const now = new Date().toISOString();

  return {
    event_id: params.eventId || generateEventId(),
    type: "card_reviewed",
    user_id: params.userId,
    library_id: params.libraryId,
    occurred_at: params.occurredAt || now,
    received_at: now,
    device_id: params.deviceId || "unknown",
    entity: {
      kind: "card",
      id: params.cardId,
    },
    payload: {
      grade: params.grade,
      seconds_spent: params.secondsSpent,
    },
    schema_version: "1.0",
  };
}

/**
 * Creates a question_attempted event
 * 
 * @param params - Event parameters
 * @returns Unvalidated event (should be validated before upload)
 */
export function createQuestionAttemptedEvent(params: {
  userId: string;
  libraryId: string;
  questionId: string;
  selectedOptionId: string;
  correct: boolean;
  secondsSpent: number;
  deviceId?: string;
  occurredAt?: string;
  eventId?: string;
}): Omit<UserEvent, "schema_version"> & { schema_version: string } {
  const now = new Date().toISOString();

  return {
    event_id: params.eventId || generateEventId(),
    type: "question_attempted",
    user_id: params.userId,
    library_id: params.libraryId,
    occurred_at: params.occurredAt || now,
    received_at: now,
    device_id: params.deviceId || "unknown",
    entity: {
      kind: "question",
      id: params.questionId,
    },
    payload: {
      selected_option_id: params.selectedOptionId,
      correct: params.correct,
      seconds_spent: params.secondsSpent,
    },
    schema_version: "1.0",
  };
}

/**
 * Creates a session_started event
 * 
 * @param params - Event parameters
 * @returns Unvalidated event (should be validated before upload)
 */
export function createSessionStartedEvent(params: {
  userId: string;
  libraryId: string;
  sessionId: string;
  plannedLoad?: number;
  queueSize?: number;
  cramMode?: boolean;
  deviceId?: string;
  occurredAt?: string;
  eventId?: string;
}): Omit<UserEvent, "schema_version"> & { schema_version: string } {
  const now = new Date().toISOString();

  return {
    event_id: params.eventId || generateEventId(),
    type: "session_started",
    user_id: params.userId,
    library_id: params.libraryId,
    occurred_at: params.occurredAt || now,
    received_at: now,
    device_id: params.deviceId || "unknown",
    entity: {
      kind: "session",
      id: params.sessionId,
    },
    payload: {
      planned_load: params.plannedLoad,
      queue_size: params.queueSize,
      cram_mode: params.cramMode || false,
    },
    schema_version: "1.0",
  };
}

