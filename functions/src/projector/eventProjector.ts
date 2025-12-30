/**
 * Event Projector - Server-Side
 * 
 * Validates events before projecting to views.
 * 
 * Usage:
 *   1. Read event from Firestore
 *   2. Validate with Zod
 *   3. Project to views
 */

import { Firestore } from "@google-cloud/firestore";
import { validateEventForIngestion, getEventPath } from "../validation/eventValidation";
import { z } from "zod";
import { UserEventSchema } from "../validation/schemas";

export type UserEvent = z.infer<typeof UserEventSchema>;

export interface ProjectionResult {
  success: boolean;
  eventId: string;
  error?: string;
}

/**
 * Validates an event before projection
 * 
 * @param rawEvent - Event data from Firestore
 * @returns Validated event or error
 */
export function validateEventForProjection(
  rawEvent: unknown
): { success: true; event: UserEvent } | { success: false; error: z.ZodError } {
  try {
    const event = validateEventForIngestion(rawEvent);
    return { success: true, event };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Reads and validates an event from Firestore
 */
export async function readAndValidateEvent(
  firestore: Firestore,
  userId: string,
  libraryId: string,
  eventId: string
): Promise<{ success: true; event: UserEvent } | { success: false; error: string }> {
  const path = getEventPath(userId, libraryId, eventId);
  const doc = await firestore.doc(path).get();

  if (!doc.exists) {
    return { success: false, error: `Event not found: ${eventId}` };
  }

  const rawEvent = doc.data();
  const validation = validateEventForProjection(rawEvent);

  if (!validation.success) {
    return {
      success: false,
      error: `Event validation failed: ${validation.error.errors.map((e) => e.message).join(", ")}`,
    };
  }

  return { success: true, event: validation.event };
}

/**
 * Example: Project event to CardScheduleView
 * (This is a placeholder - implement actual projection logic)
 */
export async function projectEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<ProjectionResult> {
  try {
    // 1. Event is already validated at this point
    // 2. Project to appropriate views based on event type
    // 3. Write views to Firestore

    // Example projection logic would go here
    // For now, just return success

    return {
      success: true,
      eventId: event.event_id,
    };
  } catch (error) {
    return {
      success: false,
      eventId: event.event_id,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

