/**
 * Sync Engine
 * 
 * Orchestrates both outbound and inbound sync.
 * Handles:
 * - Offline-first event queuing
 * - Periodic background sync
 * - Network status monitoring
 * - Sync status reporting
 */

import { Firestore } from "@google-cloud/firestore";
import { LocalEventQueue } from "./localEventQueue";
import { CursorStore } from "./syncCursor";
import { OutboundSync, OutboundSyncResult } from "./outboundSync";
import { InboundSync, InboundSyncResult } from "./inboundSync";

export interface SyncStatus {
  outbound: {
    pendingCount: number;
    lastSyncAt?: string;
    lastSyncResult?: OutboundSyncResult;
  };
  inbound: {
    lastSyncAt?: string;
    lastSyncResult?: InboundSyncResult;
    cursor?: {
      last_received_at: string;
      last_event_id: string;
    };
  };
  isOnline: boolean;
}

export interface SyncEngineOptions {
  outboundBatchSize?: number;
  inboundBatchSize?: number;
  autoSyncIntervalMs?: number; // Auto-sync interval (default: 60000 = 1 minute)
  enableAutoSync?: boolean; // Enable automatic periodic sync (default: true)
}

/**
 * Main sync engine that coordinates outbound and inbound sync
 */
export class SyncEngine {
  private outboundSync: OutboundSync;
  private inboundSync: InboundSync;
  private autoSyncInterval?: NodeJS.Timeout;
  private isOnline: boolean = true;

  constructor(
    private firestore: Firestore,
    private eventQueue: LocalEventQueue,
    private cursorStore: CursorStore,
    private userId: string,
    private libraryId: string,
    private options: SyncEngineOptions = {}
  ) {
    this.outboundSync = new OutboundSync(firestore, eventQueue, {
      batchSize: options.outboundBatchSize,
    });

    this.inboundSync = new InboundSync(
      firestore,
      cursorStore,
      userId,
      libraryId,
      {
        batchSize: options.inboundBatchSize,
      }
    );

    // Monitor online/offline status
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.isOnline = true;
        this.syncOutbound(); // Auto-sync when coming online
      });
      window.addEventListener("offline", () => {
        this.isOnline = false;
      });
    }

    // Start auto-sync if enabled
    if (options.enableAutoSync !== false) {
      this.startAutoSync();
    }
  }

  /**
   * Queues an event for outbound sync
   * If online, attempts immediate upload; otherwise queues for later
   */
  async queueEvent(event: UserEvent): Promise<void> {
    await this.eventQueue.enqueue(event);

    // If online, try immediate upload
    if (this.isOnline) {
      // Fire and forget - don't wait for result
      this.syncOutbound().catch((error) => {
        console.warn("Immediate sync failed, event queued for later:", error);
      });
    }
  }

  /**
   * Syncs outbound events (device → cloud)
   */
  async syncOutbound(): Promise<OutboundSyncResult> {
    if (!this.isOnline) {
      return {
        success: false,
        uploaded: 0,
        failed: 0,
        idempotent: 0,
        errors: ["Device is offline"],
      };
    }

    return this.outboundSync.syncAll();
  }

  /**
   * Syncs inbound events (cloud → device)
   */
  async syncInbound(): Promise<InboundSyncResult> {
    if (!this.isOnline) {
      return {
        success: false,
        eventsReceived: 0,
        cursorUpdated: false,
        error: "Device is offline",
      };
    }

    return this.inboundSync.sync();
  }

  /**
   * Performs a full sync (both outbound and inbound)
   */
  async syncAll(): Promise<{
    outbound: OutboundSyncResult;
    inbound: InboundSyncResult;
  }> {
    const [outbound, inbound] = await Promise.all([
      this.syncOutbound(),
      this.syncInbound(),
    ]);

    return { outbound, inbound };
  }

  /**
   * Gets current sync status
   */
  async getStatus(): Promise<SyncStatus> {
    const [outboundStatus, inboundCursor] = await Promise.all([
      this.outboundSync.getStatus(),
      this.inboundSync.getCursor(),
    ]);

    return {
      outbound: {
        pendingCount: outboundStatus.pendingCount,
      },
      inbound: {
        cursor: inboundCursor
          ? {
              last_received_at: inboundCursor.last_received_at,
              last_event_id: inboundCursor.last_event_id,
            }
          : undefined,
      },
      isOnline: this.isOnline,
    };
  }

  /**
   * Starts automatic periodic sync
   */
  startAutoSync(): void {
    if (this.autoSyncInterval) {
      return; // Already started
    }

    const interval = this.options.autoSyncIntervalMs || 60000; // 1 minute default

    this.autoSyncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncAll().catch((error) => {
          console.warn("Auto-sync failed:", error);
        });
      }
    }, interval);
  }

  /**
   * Stops automatic periodic sync
   */
  stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = undefined;
    }
  }

  /**
   * Forces a full inbound sync (clears cursor)
   */
  async forceFullInboundSync(): Promise<InboundSyncResult> {
    await this.inboundSync.forceFullSync();
    return this.syncInbound();
  }

  /**
   * Cleans up resources
   */
  destroy(): void {
    this.stopAutoSync();
  }
}

// Import for type checking
import { UserEvent } from "../eventClient";

