/**
 * Firestore Trigger for Event Projection
 * 
 * Triggers on: users/{uid}/libraries/{libraryId}/events/{eventId} onCreate
 * 
 * Responsibilities:
 * 1. Parse event with Zod
 * 2. Route by event.type
 * 3. Transactionally update view docs
 * 4. Enforce idempotency via view.last_applied cursor
 */

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { validateEventForProjection, projectEvent } from "../projector/eventProjector";

// Initialize Admin SDK if not already done
if (admin.apps && admin.apps.length === 0) {
  admin.initializeApp();
}

// Get Firestore instance (lazy initialization for test compatibility)
function getFirestore() {
  return admin.firestore();
}

/**
 * Firestore trigger that projects events to views when created
 * 
 * Path: users/{userId}/libraries/{libraryId}/events/{eventId}
 */
export const onEventCreated = onDocumentCreated(
  {
    document: "users/{userId}/libraries/{libraryId}/events/{eventId}",
  },
  async (event) => {
    const eventData = event.data?.data();
    const eventId = event.params.eventId;
    const userId = event.params.userId;
    const libraryId = event.params.libraryId;

    if (!eventData) {
      logger.warn(`Event document ${eventId} has no data, skipping projection`);
      return;
    }

    try {
      // 1. Validate event with Zod
      const validation = validateEventForProjection(eventData);
      if (!validation.success) {
        logger.error(`Event validation failed for ${eventId}:`, {
          errors: validation.error.errors,
        });
        // Don't throw - log and continue (allows manual inspection)
        return;
      }

      const validatedEvent = validation.event;

      // 2. Verify path matches event data
      if (validatedEvent.event_id !== eventId) {
        logger.error(`Event ID mismatch: path=${eventId}, data=${validatedEvent.event_id}`);
        return;
      }
      if (validatedEvent.user_id !== userId) {
        logger.error(`User ID mismatch: path=${userId}, data=${validatedEvent.user_id}`);
        return;
      }
      if (validatedEvent.library_id !== libraryId) {
        logger.error(`Library ID mismatch: path=${libraryId}, data=${validatedEvent.library_id}`);
        return;
      }

      // 3. Route and project event
      const db = getFirestore();
      const result = await projectEvent(db, validatedEvent);

      if (result.success) {
        logger.info(`Event ${eventId} projected successfully`, {
          eventType: validatedEvent.type,
          eventId: eventId,
        });
      } else {
        logger.error(`Event projection failed for ${eventId}:`, {
          error: result.error,
          eventType: validatedEvent.type,
        });
      }
    } catch (error) {
      logger.error(`Unexpected error projecting event ${eventId}:`, error);
      // Don't throw - allow other events to process
    }
  }
);

