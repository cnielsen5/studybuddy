
/**
 * Event Validation and Idempotency
 * 
 * Canonical Event Write Path:
 *   users/{uid}/libraries/{libraryId}/events/{eventId}
 * 
 * Idempotency Rule:
 *   - eventId is globally unique
 *   - Write is create-only (never update events)
 *   - If document exists: treat as already uploaded (idempotent success)
 * 
 * Usage:
 *   - Client: Validate before enqueue
 *   - Server: Validate before projecting
 */

import { z } from "zod";
import { UserEventSchema, safeValidate } from "./schemas";

/**
 * Validates a UserEvent and returns typed result
 * @throws {z.ZodError} if validation fails
 */
export function validateEventForIngestion(event: unknown): z.infer<typeof UserEventSchema> {
  return UserEventSchema.parse(event);
}

/**
 * Safe validation that returns a result instead of throwing
 */
export function safeValidateEvent(
  event: unknown
): { success: true; data: z.infer<typeof UserEventSchema> } | { success: false; error: z.ZodError } {
  return safeValidate(UserEventSchema, event);
}

/**
 * Constructs the canonical Firestore path for an event
 * 
 * @param userId - User ID (must start with "user_")
 * @param libraryId - Library ID (must start with "lib_")
 * @param eventId - Event ID (must start with "evt_")
 * @returns Firestore document path
 */
export function getEventPath(userId: string, libraryId: string, eventId: string): string {
  if (!userId.startsWith("user_")) {
    throw new Error(`Invalid userId format: ${userId} (must start with "user_")`);
  }
  if (!libraryId.startsWith("lib_")) {
    throw new Error(`Invalid libraryId format: ${libraryId} (must start with "lib_")`);
  }
  if (!eventId.startsWith("evt_")) {
    throw new Error(`Invalid eventId format: ${eventId} (must start with "evt_")`);
  }

  return `users/${userId}/libraries/${libraryId}/events/${eventId}`;
}

/**
 * Extracts path components from an event
 */
export function getEventPathComponents(event: z.infer<typeof UserEventSchema>): {
  userId: string;
  libraryId: string;
  eventId: string;
  path: string;
} {
  return {
    userId: event.user_id,
    libraryId: event.library_id,
    eventId: event.event_id,
    path: getEventPath(event.user_id, event.library_id, event.event_id),
  };
}

/**
 * Idempotency check result
 */
export type IdempotencyResult =
  | { exists: true; alreadyProcessed: true }
  | { exists: false; alreadyProcessed: false };

/**
 * Validates event structure and returns path information
 * Use this before writing to Firestore
 */
export function prepareEventForWrite(
  rawEvent: unknown
): {
  event: z.infer<typeof UserEventSchema>;
  path: string;
  userId: string;
  libraryId: string;
  eventId: string;
} {
  // Validate event structure
  const event = validateEventForIngestion(rawEvent);

  // Extract path components
  const { userId, libraryId, eventId, path } = getEventPathComponents(event);

  return {
    event,
    path,
    userId,
    libraryId,
    eventId,
  };
}

