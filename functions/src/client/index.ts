/**
 * Client SDK - Main Entry Point
 * 
 * Provides a complete client-side API for:
 * - Creating events locally
 * - Validating events
 * - Uploading events to Firestore
 * - Reading views (projected read models)
 * 
 * Usage:
 *   import { StudyBuddyClient } from './client';
 *   
 *   const client = new StudyBuddyClient(firestore, userId, libraryId);
 *   await client.reviewCard(cardId, 'good', 18);
 *   const dueCards = await client.getDueCards();
 * 
 * Note: In a real client app, use Firebase Client SDK:
 *   import { Firestore } from 'firebase/firestore';
 *   import { initializeApp } from 'firebase/app';
 *   import { getFirestore } from 'firebase/firestore';
 */

// Note: Using server types for documentation - replace with client SDK in actual app
import { Firestore } from "@google-cloud/firestore";
import {
  createCardReviewedEvent,
  createQuestionAttemptedEvent,
  createSessionStartedEvent,
  generateEventId,
} from "./eventHelpers";
import { validateEventBeforeEnqueue, safeValidateEventBeforeEnqueue, UserEvent } from "./eventClient";
import { uploadEvent, uploadEventsBatch, checkEventExists } from "./eventUpload";
import {
  getCardScheduleView,
  getCardPerformanceView,
  getDueCards,
  getCardScheduleViews,
  getCardPerformanceViews,
  CardScheduleView,
  CardPerformanceView,
} from "./viewClient";
import {
  SyncEngine,
  LocalEventQueue,
  CursorStore,
  MemoryEventQueue,
  MemoryCursorStore,
} from "./sync";

export {
  UserEvent,
  CardScheduleView,
  CardPerformanceView,
  generateEventId,
  createCardReviewedEvent,
  createQuestionAttemptedEvent,
  createSessionStartedEvent,
  validateEventBeforeEnqueue,
  safeValidateEventBeforeEnqueue,
  uploadEvent,
  uploadEventsBatch,
  checkEventExists,
  getCardScheduleView,
  getCardPerformanceView,
  getDueCards,
  getCardScheduleViews,
  getCardPerformanceViews,
};

// Export sync module
export * from "./sync";

/**
 * High-level client SDK for StudyBuddy
 * 
 * Provides convenient methods for common operations.
 * Supports offline-first sync with local event queue.
 */
export class StudyBuddyClient {
  private syncEngine?: SyncEngine;

  constructor(
    private firestore: Firestore,
    private userId: string,
    private libraryId: string,
    private deviceId: string = "unknown",
    eventQueue?: LocalEventQueue,
    cursorStore?: CursorStore
  ) {
    // Initialize sync engine if queue/store provided
    if (eventQueue && cursorStore) {
      this.syncEngine = new SyncEngine(
        firestore,
        eventQueue,
        cursorStore,
        userId,
        libraryId,
        {
          enableAutoSync: true,
          autoSyncIntervalMs: 60000, // 1 minute
        }
      );
    }
  }

  /**
   * Reviews a card and uploads the event
   * 
   * If sync engine is enabled, queues the event for offline-first sync.
   * Otherwise, uploads immediately.
   * 
   * @param cardId - Card ID
   * @param grade - Review grade
   * @param secondsSpent - Time spent reviewing
   * @returns Upload result
   */
  async reviewCard(
    cardId: string,
    grade: "again" | "hard" | "good" | "easy",
    secondsSpent: number
  ) {
    // 1. Create event locally
    const rawEvent = createCardReviewedEvent({
      userId: this.userId,
      libraryId: this.libraryId,
      cardId,
      grade,
      secondsSpent,
      deviceId: this.deviceId,
    });

    // 2. Validate event
    const validation = safeValidateEventBeforeEnqueue(rawEvent);
    if (!validation.success) {
      return {
        success: false,
        error: `Validation failed: ${validation.error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    // 3. If sync engine is enabled, queue for offline-first sync
    if (this.syncEngine) {
      await this.syncEngine.queueEvent(validation.event);
      // Return success - event is queued and will be uploaded by sync engine
      return {
        success: true,
        eventId: validation.event.event_id,
        path: getEventPath(this.userId, this.libraryId, validation.event.event_id),
        idempotent: false,
      };
    }

    // 4. Otherwise, upload immediately
    const uploadResult = await uploadEvent(this.firestore, validation.event);
    return uploadResult;
  }

  /**
   * Gets due cards for the current user/library
   * 
   * @param limit - Maximum number of cards to return
   * @returns Array of due card schedule views
   */
  async getDueCards(limit: number = 50): Promise<CardScheduleView[]> {
    return getDueCards(this.firestore, this.userId, this.libraryId, limit);
  }

  /**
   * Gets schedule view for a specific card
   * 
   * @param cardId - Card ID
   * @returns Card schedule view or null
   */
  async getCardSchedule(cardId: string): Promise<CardScheduleView | null> {
    return getCardScheduleView(this.firestore, this.userId, this.libraryId, cardId);
  }

  /**
   * Gets performance view for a specific card
   * 
   * @param cardId - Card ID
   * @returns Card performance view or null
   */
  async getCardPerformance(cardId: string): Promise<CardPerformanceView | null> {
    return getCardPerformanceView(this.firestore, this.userId, this.libraryId, cardId);
  }

  /**
   * Uploads a custom event
   * 
   * @param event - Validated event
   * @returns Upload result
   */
  async uploadEvent(event: UserEvent) {
    return uploadEvent(this.firestore, event);
  }

  /**
   * Uploads multiple events in a batch
   * 
   * @param events - Array of validated events
   * @returns Array of upload results
   */
  async uploadEvents(events: UserEvent[]) {
    return uploadEventsBatch(this.firestore, events);
  }

  /**
   * Syncs outbound events (device → cloud)
   * Only available if sync engine is enabled
   */
  async syncOutbound() {
    if (!this.syncEngine) {
      throw new Error("Sync engine not initialized. Provide eventQueue and cursorStore in constructor.");
    }
    return this.syncEngine.syncOutbound();
  }

  /**
   * Syncs inbound events (cloud → device)
   * Only available if sync engine is enabled
   */
  async syncInbound() {
    if (!this.syncEngine) {
      throw new Error("Sync engine not initialized. Provide eventQueue and cursorStore in constructor.");
    }
    return this.syncEngine.syncInbound();
  }

  /**
   * Performs full sync (both outbound and inbound)
   * Only available if sync engine is enabled
   */
  async syncAll() {
    if (!this.syncEngine) {
      throw new Error("Sync engine not initialized. Provide eventQueue and cursorStore in constructor.");
    }
    return this.syncEngine.syncAll();
  }

  /**
   * Gets sync status
   * Only available if sync engine is enabled
   */
  async getSyncStatus() {
    if (!this.syncEngine) {
      throw new Error("Sync engine not initialized. Provide eventQueue and cursorStore in constructor.");
    }
    return this.syncEngine.getStatus();
  }
}

// Import for getEventPath
import { getEventPath } from "../validation/eventValidation";

