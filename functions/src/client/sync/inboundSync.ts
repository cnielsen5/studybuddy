/**
 * Inbound Sync (Cloud → Device)
 * 
 * Fetches new events from Firestore since the last sync cursor.
 * Even with server-side projection, we store events locally for:
 * - Audit trail
 * - Rebuild capability
 * - Offline history
 * 
 * Reads should primarily use views, but events are for history/reconciliation.
 */

import { Firestore } from "@google-cloud/firestore";
import { UserEvent } from "../eventClient";
import { CursorStore, SyncCursor } from "./syncCursor";

export interface InboundSyncResult {
  success: boolean;
  eventsReceived: number;
  cursorUpdated: boolean;
  error?: string;
}

export interface InboundSyncOptions {
  batchSize?: number; // Number of events to fetch per query (default: 100)
  maxEvents?: number; // Maximum events to fetch in one sync (default: 1000)
}

/**
 * Syncs new events from Firestore to local storage
 */
export class InboundSync {
  constructor(
    private firestore: Firestore,
    private cursorStore: CursorStore,
    private userId: string,
    private libraryId: string,
    private options: InboundSyncOptions = {}
  ) {}

  /**
   * Syncs new events since the last cursor
   */
  async sync(): Promise<InboundSyncResult> {
    try {
      const cursor = await this.cursorStore.getCursor(this.libraryId);
      const events = await this.fetchNewEvents(cursor);

      if (events.length === 0) {
        return {
          success: true,
          eventsReceived: 0,
          cursorUpdated: false,
        };
      }

      // Update cursor with the latest event
      const latestEvent = events[events.length - 1];
      await this.cursorStore.updateCursor(
        this.libraryId,
        latestEvent.received_at,
        latestEvent.event_id
      );

      // Store events locally (implementation depends on storage choice)
      // For now, we just return them - the caller can decide how to store

      return {
        success: true,
        eventsReceived: events.length,
        cursorUpdated: true,
      };
    } catch (error) {
      return {
        success: false,
        eventsReceived: 0,
        cursorUpdated: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Fetches new events since the cursor
   */
  private async fetchNewEvents(cursor: SyncCursor | null): Promise<UserEvent[]> {
    const eventsPath = `users/${this.userId}/libraries/${this.libraryId}/events`;
    const eventsRef = this.firestore.collection(eventsPath);

    let query: any = eventsRef.orderBy("received_at", "asc");

    // If we have a cursor, start from after the last event
    if (cursor) {
      // Query events after the cursor's received_at
      // If multiple events have the same received_at, use event_id as tie-break
      query = query.where("received_at", ">", cursor.last_received_at);
    }

    const batchSize = this.options.batchSize || 100;
    const maxEvents = this.options.maxEvents || 1000;
    const allEvents: UserEvent[] = [];

    let lastDoc: any = null;
    let fetched = 0;

    while (fetched < maxEvents) {
      let batchQuery = query.limit(Math.min(batchSize, maxEvents - fetched));

      // If we have a last document, start from there
      if (lastDoc) {
        batchQuery = batchQuery.startAfter(lastDoc);
      }

      const snapshot = await batchQuery.get();

      if (snapshot.empty) {
        break;
      }

      const batchEvents = snapshot.docs.map((doc: any) => doc.data() as UserEvent);
      allEvents.push(...batchEvents);

      fetched += batchEvents.length;
      lastDoc = snapshot.docs[snapshot.docs.length - 1];

      // If we got fewer events than requested, we've reached the end
      if (batchEvents.length < batchSize) {
        break;
      }
    }

    // Filter out events that match the cursor exactly (tie-break)
    if (cursor) {
      return allEvents.filter((event) => {
        const eventTime = new Date(event.received_at).getTime();
        const cursorTime = new Date(cursor.last_received_at).getTime();

        if (eventTime > cursorTime) {
          return true;
        }
        if (eventTime === cursorTime) {
          // Same timestamp - use event_id as tie-break
          return event.event_id > cursor.last_event_id;
        }
        return false;
      });
    }

    return allEvents;
  }

  /**
   * Gets the current cursor for this library
   */
  async getCursor(): Promise<SyncCursor | null> {
    return this.cursorStore.getCursor(this.libraryId);
  }

  /**
   * Forces a full sync by clearing the cursor
   */
  async forceFullSync(): Promise<void> {
    await this.cursorStore.clearCursor(this.libraryId);
  }
}

