/**
 * Event Ingestion - Server-Side
 * 
 * Handles event ingestion with idempotency and validation.
 * 
 * Canonical Path: users/{uid}/libraries/{libraryId}/events/{eventId}
 * 
 * Rules:
 * - Validate event with Zod before processing
 * - Check if event already exists (idempotency)
 * - Create-only: never update existing events
 * - If exists: return success (already processed)
 */

import { Firestore } from "@google-cloud/firestore";
import {
  prepareEventForWrite,
  getEventPath,
  IdempotencyResult,
} from "../validation/eventValidation";
import { z } from "zod";
import { UserEventSchema } from "../validation/schemas";

export type UserEvent = z.infer<typeof UserEventSchema>;

export interface IngestionResult {
  success: boolean;
  eventId: string;
  path: string;
  idempotent: boolean;
  error?: string;
}

/**
 * Ingests a single event with idempotency check
 * 
 * @param firestore - Firestore instance
 * @param rawEvent - Raw event data (will be validated)
 * @returns Ingestion result
 */
export async function ingestEvent(
  firestore: Firestore,
  rawEvent: unknown
): Promise<IngestionResult> {
  try {
    // 1. Validate event structure
    const { event, path, eventId } = prepareEventForWrite(rawEvent);

    // 2. Check if event already exists (idempotency)
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

    // 3. Write event (create-only)
    await eventRef.set(event);

    return {
      success: true,
      eventId,
      path,
      idempotent: false,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        eventId: (rawEvent as any)?.event_id || "unknown",
        path: "unknown",
        idempotent: false,
        error: `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    return {
      success: false,
      eventId: (rawEvent as any)?.event_id || "unknown",
      path: "unknown",
      idempotent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Batch ingest multiple events
 * Returns results for each event
 */
export async function ingestEventsBatch(
  firestore: Firestore,
  rawEvents: unknown[]
): Promise<IngestionResult[]> {
  const batch = firestore.batch();
  const results: IngestionResult[] = [];

  for (const rawEvent of rawEvents) {
    try {
      const { event, path, eventId } = prepareEventForWrite(rawEvent);
      const eventRef = firestore.doc(path);

      // Check if exists (can't do in batch, so we'll check individually)
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
      results.push({
        success: true,
        eventId,
        path,
        idempotent: false,
      });
    } catch (error) {
      results.push({
        success: false,
        eventId: (rawEvent as any)?.event_id || "unknown",
        path: "unknown",
        idempotent: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Commit batch
  if (results.some((r) => r.success && !r.idempotent)) {
    await batch.commit();
  }

  return results;
}

/**
 * Checks if an event exists (idempotency check)
 */
export async function checkEventExists(
  firestore: Firestore,
  userId: string,
  libraryId: string,
  eventId: string
): Promise<IdempotencyResult> {
  const path = getEventPath(userId, libraryId, eventId);
  const doc = await firestore.doc(path).get();

  if (doc.exists) {
    return { exists: true, alreadyProcessed: true };
  }

  return { exists: false, alreadyProcessed: false };
}

