/**
 * Local Event Queue
 * 
 * Manages a local queue of unsent events for offline-first sync.
 * Uses IndexedDB (via localForage) to persist events across sessions.
 * 
 * Note: In a real client app, install localForage:
 *   npm install localforage
 *   npm install --save-dev @types/localforage
 */

import { UserEvent } from "../eventClient";

export interface QueuedEvent {
  event: UserEvent;
  queuedAt: string; // ISO timestamp when event was queued
  attempts: number; // Number of upload attempts
  lastAttemptAt?: string; // ISO timestamp of last upload attempt
  acknowledged: boolean; // True if successfully uploaded
}

export interface LocalEventQueue {
  /**
   * Adds an event to the queue
   */
  enqueue(event: UserEvent): Promise<void>;

  /**
   * Gets all unacknowledged events
   */
  getPendingEvents(): Promise<QueuedEvent[]>;

  /**
   * Marks an event as acknowledged (successfully uploaded)
   */
  acknowledge(eventId: string): Promise<void>;

  /**
   * Removes an event from the queue (after successful upload)
   */
  remove(eventId: string): Promise<void>;

  /**
   * Gets the count of pending events
   */
  getPendingCount(): Promise<number>;

  /**
   * Clears all acknowledged events (cleanup)
   */
  clearAcknowledged(): Promise<void>;
}

/**
 * In-memory implementation (for testing/development)
 * In production, use IndexedDB via localForage
 */
export class MemoryEventQueue implements LocalEventQueue {
  private queue: Map<string, QueuedEvent> = new Map();

  async enqueue(event: UserEvent): Promise<void> {
    const queuedEvent: QueuedEvent = {
      event,
      queuedAt: new Date().toISOString(),
      attempts: 0,
      acknowledged: false,
    };
    this.queue.set(event.event_id, queuedEvent);
  }

  async getPendingEvents(): Promise<QueuedEvent[]> {
    return Array.from(this.queue.values()).filter((qe) => !qe.acknowledged);
  }

  async acknowledge(eventId: string): Promise<void> {
    const queued = this.queue.get(eventId);
    if (queued) {
      queued.acknowledged = true;
    }
  }

  async remove(eventId: string): Promise<void> {
    this.queue.delete(eventId);
  }

  async getPendingCount(): Promise<number> {
    return Array.from(this.queue.values()).filter((qe) => !qe.acknowledged).length;
  }

  async clearAcknowledged(): Promise<void> {
    for (const [eventId, queued] of this.queue.entries()) {
      if (queued.acknowledged) {
        this.queue.delete(eventId);
      }
    }
  }

  /**
   * Increments attempt count (for retry logic)
   */
  async incrementAttempt(eventId: string): Promise<void> {
    const queued = this.queue.get(eventId);
    if (queued) {
      queued.attempts += 1;
      queued.lastAttemptAt = new Date().toISOString();
    }
  }
}

/**
 * IndexedDB implementation using localForage
 * 
 * Usage in a real client app:
 *   import localforage from 'localforage';
 *   const queue = new IndexedDBEventQueue(localforage);
 */
export class IndexedDBEventQueue implements LocalEventQueue {
  constructor(private storage: any) {
    // Configure localForage instance
    this.storage.config({
      name: 'StudyBuddy',
      storeName: 'eventQueue',
      version: 1.0,
    });
  }

  private getQueueKey(): string {
    return 'eventQueue';
  }

  async enqueue(event: UserEvent): Promise<void> {
    const queue = await this.getQueue();
    const queuedEvent: QueuedEvent = {
      event,
      queuedAt: new Date().toISOString(),
      attempts: 0,
      acknowledged: false,
    };
    queue[event.event_id] = queuedEvent;
    await this.saveQueue(queue);
  }

  async getPendingEvents(): Promise<QueuedEvent[]> {
    const queue = await this.getQueue();
    return Object.values(queue).filter((qe: QueuedEvent) => !qe.acknowledged);
  }

  async acknowledge(eventId: string): Promise<void> {
    const queue = await this.getQueue();
    if (queue[eventId]) {
      queue[eventId].acknowledged = true;
      await this.saveQueue(queue);
    }
  }

  async remove(eventId: string): Promise<void> {
    const queue = await this.getQueue();
    delete queue[eventId];
    await this.saveQueue(queue);
  }

  async getPendingCount(): Promise<number> {
    const pending = await this.getPendingEvents();
    return pending.length;
  }

  async clearAcknowledged(): Promise<void> {
    const queue = await this.getQueue();
    const filtered: Record<string, QueuedEvent> = {};
    for (const [eventId, queued] of Object.entries(queue)) {
      if (!(queued as QueuedEvent).acknowledged) {
        filtered[eventId] = queued as QueuedEvent;
      }
    }
    await this.saveQueue(filtered);
  }

  private async getQueue(): Promise<Record<string, QueuedEvent>> {
    const queue = await this.storage.getItem(this.getQueueKey());
    return queue || {};
  }

  private async saveQueue(queue: Record<string, QueuedEvent>): Promise<void> {
    await this.storage.setItem(this.getQueueKey(), queue);
  }
}

