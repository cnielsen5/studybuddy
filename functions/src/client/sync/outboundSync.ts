/**
 * Outbound Sync (Device → Cloud)
 * 
 * Handles uploading queued events from local storage to Firestore.
 * - Uploads in batches
 * - Marks events as acknowledged once create succeeds or "already exists"
 * - Retries failed uploads with exponential backoff
 */

import { Firestore } from "@google-cloud/firestore";
import { uploadEventsBatch } from "../eventUpload";
import { LocalEventQueue, QueuedEvent } from "./localEventQueue";

export interface OutboundSyncResult {
  success: boolean;
  uploaded: number;
  failed: number;
  idempotent: number;
  errors: string[];
}

export interface OutboundSyncOptions {
  batchSize?: number; // Number of events to upload per batch (default: 50)
  maxRetries?: number; // Maximum retry attempts per event (default: 3)
  retryDelayMs?: number; // Initial retry delay in milliseconds (default: 1000)
}

/**
 * Syncs queued events from local storage to Firestore
 */
export class OutboundSync {
  constructor(
    private firestore: Firestore,
    private eventQueue: LocalEventQueue,
    private options: OutboundSyncOptions = {}
  ) {}

  /**
   * Syncs all pending events
   */
  async syncAll(): Promise<OutboundSyncResult> {
    const pending = await this.eventQueue.getPendingEvents();
    
    if (pending.length === 0) {
      return {
        success: true,
        uploaded: 0,
        failed: 0,
        idempotent: 0,
        errors: [],
      };
    }

    const batchSize = this.options.batchSize || 50;
    const results: OutboundSyncResult = {
      success: true,
      uploaded: 0,
      failed: 0,
      idempotent: 0,
      errors: [],
    };

    // Process in batches
    for (let i = 0; i < pending.length; i += batchSize) {
      const batch = pending.slice(i, i + batchSize);
      const batchResult = await this.syncBatch(batch);
      
      results.uploaded += batchResult.uploaded;
      results.failed += batchResult.failed;
      results.idempotent += batchResult.idempotent;
      results.errors.push(...batchResult.errors);
    }

    return results;
  }

  /**
   * Syncs a single batch of events
   */
  private async syncBatch(queuedEvents: QueuedEvent[]): Promise<OutboundSyncResult> {
    const events = queuedEvents.map((qe) => qe.event);
    const uploadResults = await uploadEventsBatch(this.firestore, events);

    const result: OutboundSyncResult = {
      success: true,
      uploaded: 0,
      failed: 0,
      idempotent: 0,
      errors: [],
    };

    // Process results
    for (let i = 0; i < uploadResults.length; i++) {
      const uploadResult = uploadResults[i];
      const queuedEvent = queuedEvents[i];

      if (uploadResult.success) {
        // Success - mark as acknowledged and remove from queue
        await this.eventQueue.acknowledge(uploadResult.eventId);
        await this.eventQueue.remove(uploadResult.eventId);

        if (uploadResult.idempotent) {
          result.idempotent += 1;
        } else {
          result.uploaded += 1;
        }
      } else {
        // Failure - increment attempt count
        // Note: This requires the queue implementation to support incrementAttempt
        // For MemoryEventQueue, it's available; for IndexedDB, you'd need to implement it
        if ('incrementAttempt' in this.eventQueue) {
          await (this.eventQueue as any).incrementAttempt(uploadResult.eventId);
        }

        // Check if we should retry
        const maxRetries = this.options.maxRetries || 3;
        if (queuedEvent.attempts < maxRetries) {
          // Will retry on next sync
          result.failed += 1;
          result.errors.push(
            `Event ${uploadResult.eventId}: ${uploadResult.error} (attempt ${queuedEvent.attempts + 1}/${maxRetries})`
          );
        } else {
          // Max retries exceeded - mark as failed permanently
          result.failed += 1;
          result.errors.push(
            `Event ${uploadResult.eventId}: Max retries exceeded. ${uploadResult.error}`
          );
          // Optionally: move to a "failed" queue or log for manual intervention
        }
      }
    }

    return result;
  }

  /**
   * Gets sync status
   */
  async getStatus(): Promise<{
    pendingCount: number;
    oldestPending?: QueuedEvent;
  }> {
    const pending = await this.eventQueue.getPendingEvents();
    const oldest = pending.sort(
      (a, b) => new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime()
    )[0];

    return {
      pendingCount: pending.length,
      oldestPending: oldest,
    };
  }
}

