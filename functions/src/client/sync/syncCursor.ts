/**
 * Sync Cursor Management
 * 
 * Tracks the last synced event for inbound sync (cloud → device).
 * Uses a per-library cursor: last received_at + last event_id (tie-break).
 * 
 * Note: In a real client app, store cursors in IndexedDB via localForage.
 */

export interface SyncCursor {
  library_id: string;
  last_received_at: string; // ISO timestamp of last received event
  last_event_id: string; // Event ID of last received event (tie-break)
  synced_at: string; // ISO timestamp when cursor was last updated
}

export interface CursorStore {
  /**
   * Gets the cursor for a library
   */
  getCursor(libraryId: string): Promise<SyncCursor | null>;

  /**
   * Updates the cursor for a library
   */
  updateCursor(libraryId: string, receivedAt: string, eventId: string): Promise<void>;

  /**
   * Gets all cursors
   */
  getAllCursors(): Promise<SyncCursor[]>;

  /**
   * Clears cursor for a library (force full sync)
   */
  clearCursor(libraryId: string): Promise<void>;
}

/**
 * In-memory implementation (for testing/development)
 */
export class MemoryCursorStore implements CursorStore {
  private cursors: Map<string, SyncCursor> = new Map();

  async getCursor(libraryId: string): Promise<SyncCursor | null> {
    return this.cursors.get(libraryId) || null;
  }

  async updateCursor(libraryId: string, receivedAt: string, eventId: string): Promise<void> {
    this.cursors.set(libraryId, {
      library_id: libraryId,
      last_received_at: receivedAt,
      last_event_id: eventId,
      synced_at: new Date().toISOString(),
    });
  }

  async getAllCursors(): Promise<SyncCursor[]> {
    return Array.from(this.cursors.values());
  }

  async clearCursor(libraryId: string): Promise<void> {
    this.cursors.delete(libraryId);
  }
}

/**
 * IndexedDB implementation using localForage
 * 
 * Usage in a real client app:
 *   import localforage from 'localforage';
 *   const cursorStore = new IndexedDBCursorStore(localforage);
 */
export class IndexedDBCursorStore implements CursorStore {
  constructor(private storage: any) {
    this.storage.config({
      name: 'StudyBuddy',
      storeName: 'syncCursors',
      version: 1.0,
    });
  }

  private getCursorsKey(): string {
    return 'syncCursors';
  }

  async getCursor(libraryId: string): Promise<SyncCursor | null> {
    const cursors = await this.getCursors();
    return cursors[libraryId] || null;
  }

  async updateCursor(libraryId: string, receivedAt: string, eventId: string): Promise<void> {
    const cursors = await this.getCursors();
    cursors[libraryId] = {
      library_id: libraryId,
      last_received_at: receivedAt,
      last_event_id: eventId,
      synced_at: new Date().toISOString(),
    };
    await this.saveCursors(cursors);
  }

  async getAllCursors(): Promise<SyncCursor[]> {
    const cursors = await this.getCursors();
    return Object.values(cursors);
  }

  async clearCursor(libraryId: string): Promise<void> {
    const cursors = await this.getCursors();
    delete cursors[libraryId];
    await this.saveCursors(cursors);
  }

  private async getCursors(): Promise<Record<string, SyncCursor>> {
    const cursors = await this.storage.getItem(this.getCursorsKey());
    return cursors || {};
  }

  private async saveCursors(cursors: Record<string, SyncCursor>): Promise<void> {
    await this.storage.setItem(this.getCursorsKey(), cursors);
  }
}

