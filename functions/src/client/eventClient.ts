/**
 * Client-Side Event Validation and Enqueue
 * 
 * Validates events with Zod before enqueueing for upload.
 * 
 * Usage:
 *   1. Create event
 *   2. Validate with Zod
 *   3. Enqueue for upload
 */

import { validateEventForIngestion, safeValidateEvent, getEventPathComponents } from "../validation/eventValidation";
import { z } from "zod";
import { UserEventSchema } from "../validation/schemas";

export type UserEvent = z.infer<typeof UserEventSchema>;

/**
 * Validates an event on the client before enqueueing
 * 
 * @param rawEvent - Event data to validate
 * @returns Validated event or throws ZodError
 */
export function validateEventBeforeEnqueue(rawEvent: unknown): UserEvent {
  return validateEventForIngestion(rawEvent);
}

/**
 * Safe validation for client-side error handling
 */
export function safeValidateEventBeforeEnqueue(
  rawEvent: unknown
): { success: true; event: UserEvent } | { success: false; error: z.ZodError } {
  const result = safeValidateEvent(rawEvent);
  if (result.success) {
    return { success: true, event: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Prepares event for enqueue with validation
 * Returns event and path information for client-side tracking
 */
export function prepareEventForEnqueue(rawEvent: unknown): {
  event: UserEvent;
  path: string;
  eventId: string;
} {
  const event = validateEventBeforeEnqueue(rawEvent);
  const { path, eventId } = getEventPathComponents(event);

  return {
    event,
    path,
    eventId,
  };
}

/**
 * Example: Client-side event creation and validation
 */
export function createAndValidateEvent(
  eventData: Partial<UserEvent> & { event_id: string; type: string; user_id: string; library_id: string }
): UserEvent {
  // Client creates event with required fields
  const event = {
    ...eventData,
    occurred_at: eventData.occurred_at || new Date().toISOString(),
    received_at: eventData.received_at || new Date().toISOString(),
    device_id: eventData.device_id || "unknown",
    entity: eventData.entity || { kind: "card", id: "" },
    payload: eventData.payload || {},
    schema_version: eventData.schema_version || "1.0",
  } as UserEvent;

  // Validate before enqueueing
  return validateEventBeforeEnqueue(event);
}

