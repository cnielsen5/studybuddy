/**
 * Client-Side Event Upload
 * 
 * Functions to upload events to Firestore using the canonical path.
 * Uses create-only semantics with idempotency.
 * 
 * Note: In a real client app, import from 'firebase/firestore' instead:
 *   import { Firestore } from 'firebase/firestore';
 * For server-side ingestion, use src/ingestion/eventIngestion.ts
 */

// Note: Using server types for documentation - replace with client SDK in actual app
import { Firestore } from "@google-cloud/firestore";
import { getEventPath, getEventPathComponents } from "../validation/eventValidation";
import { UserEvent } from "./eventClient";

export interface UploadResult {
  success: boolean;
  eventId: string;
  path: string;
  idempotent: boolean;
  error?: string;
}

/**
 * Uploads a single event to Firestore
 * 
 * This is the client-side equivalent of server-side ingestion.
 * It uses create-only semantics: if the event already exists, returns idempotent success.
 * 
 * @param firestore - Firestore instance (client SDK)
 * @param event - Validated event to upload
 * @returns Upload result
 */
export async function uploadEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<UploadResult> {
  try {
    const { path, eventId } = getEventPathComponents(event);

    // Check if event already exists (idempotency)
    const eventRef = firestore.doc(path);
    const existingDoc = await eventRef.get();

    if (existingDoc.exists) {
      // Event already exists - idempotent success
      return {
        success: true,
        eventId,
        path,
        idempotent: true,
      };
    }

    // Write event (create-only)
    await eventRef.set(event);

    return {
      success: true,
      eventId,
      path,
      idempotent: false,
    };
  } catch (error) {
    return {
      success: false,
      eventId: event.event_id,
      path: getEventPath(event.user_id, event.library_id, event.event_id),
      idempotent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Uploads multiple events in a batch
 * 
 * @param firestore - Firestore instance (client SDK)
 * @param events - Array of validated events
 * @returns Array of upload results (one per event)
 */
export async function uploadEventsBatch(
  firestore: Firestore,
  events: UserEvent[]
): Promise<UploadResult[]> {
  // Note: In client SDK, use: writeBatch(firestore) instead
  // This is server SDK syntax for documentation
  const batch = (firestore as any).batch();
  const results: UploadResult[] = [];
  const writes: Array<{ ref: any; event: UserEvent }> = [];

  // Check each event and prepare batch writes
  for (const event of events) {
    try {
      const { path, eventId } = getEventPathComponents(event);
      const eventRef = firestore.doc(path);

      // Check if exists (can't do in batch, so check individually)
      const existingDoc = await eventRef.get();
      if (existingDoc.exists) {
        results.push({
          success: true,
          eventId,
          path,
          idempotent: true,
        });
        continue;
      }

      // Add to batch
      batch.set(eventRef, event);
      writes.push({ ref: eventRef, event });
      results.push({
        success: true,
        eventId,
        path,
        idempotent: false,
      });
    } catch (error) {
      // Safely construct path, handling cases where event structure is invalid
      let path = "unknown";
      try {
        if (event.user_id && event.library_id && event.event_id) {
          path = getEventPath(event.user_id, event.library_id, event.event_id);
        }
      } catch {
        // If path construction fails, use "unknown"
        path = "unknown";
      }

      results.push({
        success: false,
        eventId: (event as any).event_id || "unknown",
        path,
        idempotent: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Commit batch if there are writes
  if (writes.length > 0) {
    await batch.commit();
  }

  return results;
}

/**
 * Checks if an event exists (idempotency check)
 * 
 * @param firestore - Firestore instance (client SDK)
 * @param userId - User ID
 * @param libraryId - Library ID
 * @param eventId - Event ID
 * @returns True if event exists, false otherwise
 */
export async function checkEventExists(
  firestore: Firestore,
  userId: string,
  libraryId: string,
  eventId: string
): Promise<boolean> {
  const path = getEventPath(userId, libraryId, eventId);
  const doc = await firestore.doc(path).get();
  return doc.exists;
}

