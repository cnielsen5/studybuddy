/**
 * Outbound Sync Tests
 * 
 * Tests for outbound sync functionality including:
 * - Batch upload
 * - Acknowledgment tracking
 * - Retry logic
 * - Error handling
 */

import { OutboundSync } from "../../../src/client/sync/outboundSync";
import { MemoryEventQueue } from "../../../src/client/sync/localEventQueue";
import { uploadEventsBatch } from "../../../src/client/eventUpload";
import { Firestore } from "@google-cloud/firestore";
import { validCardReviewedEvent } from "../../fixtures/cardReviewed.fixture.ts";

// Mock dependencies
jest.mock("../../../src/client/eventUpload");
jest.mock("@google-cloud/firestore");

describe("Outbound Sync", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let eventQueue: MemoryEventQueue;
  let outboundSync: OutboundSync;

  beforeEach(() => {
    jest.clearAllMocks();
    eventQueue = new MemoryEventQueue();
    mockFirestore = {} as any;
    outboundSync = new OutboundSync(mockFirestore, eventQueue, {
      batchSize: 50,
      maxRetries: 3,
    });
  });

  describe("syncAll", () => {
    it("should return success when no pending events", async () => {
      const result = await outboundSync.syncAll();

      expect(result.success).toBe(true);
      expect(result.uploaded).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.idempotent).toBe(0);
    });

    it("should upload pending events in batches", async () => {
      const event1 = { ...validCardReviewedEvent, event_id: "evt_001" };
      const event2 = { ...validCardReviewedEvent, event_id: "evt_002" };

      await eventQueue.enqueue(event1);
      await eventQueue.enqueue(event2);

      (uploadEventsBatch as jest.Mock).mockResolvedValue([
        { success: true, eventId: "evt_001", path: "path1", idempotent: false },
        { success: true, eventId: "evt_002", path: "path2", idempotent: false },
      ]);

      const result = await outboundSync.syncAll();

      expect(result.success).toBe(true);
      expect(result.uploaded).toBe(2);
      expect(result.failed).toBe(0);
      expect(uploadEventsBatch).toHaveBeenCalledTimes(1);
      expect(uploadEventsBatch).toHaveBeenCalledWith(mockFirestore, [event1, event2]);
    });

    it("should acknowledge successfully uploaded events", async () => {
      const event = { ...validCardReviewedEvent, event_id: "evt_001" };
      await eventQueue.enqueue(event);

      (uploadEventsBatch as jest.Mock).mockResolvedValue([
        { success: true, eventId: "evt_001", path: "path1", idempotent: false },
      ]);

      await outboundSync.syncAll();

      const pending = await eventQueue.getPendingEvents();
      expect(pending).toHaveLength(0);
    });

    it("should handle idempotent events", async () => {
      const event = { ...validCardReviewedEvent, event_id: "evt_001" };
      await eventQueue.enqueue(event);

      (uploadEventsBatch as jest.Mock).mockResolvedValue([
        { success: true, eventId: "evt_001", path: "path1", idempotent: true },
      ]);

      const result = await outboundSync.syncAll();

      expect(result.idempotent).toBe(1);
      expect(result.uploaded).toBe(0);

      // Idempotent events should still be removed
      const pending = await eventQueue.getPendingEvents();
      expect(pending).toHaveLength(0);
    });

    it("should handle failed uploads and increment attempts", async () => {
      const event = { ...validCardReviewedEvent, event_id: "evt_001" };
      await eventQueue.enqueue(event);

      (uploadEventsBatch as jest.Mock).mockResolvedValue([
        {
          success: false,
          eventId: "evt_001",
          path: "path1",
          idempotent: false,
          error: "Network error",
        },
      ]);

      const result = await outboundSync.syncAll();

      expect(result.failed).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes("Network error"))).toBe(true);

      // Event should still be pending (not removed)
      const pending = await eventQueue.getPendingEvents();
      expect(pending).toHaveLength(1);

      // Attempt count should be incremented
      expect(pending[0].attempts).toBe(1);
      expect(pending[0].lastAttemptAt).toBeDefined();
    });

    it("should respect maxRetries limit", async () => {
      const event = { ...validCardReviewedEvent, event_id: "evt_001" };
      await eventQueue.enqueue(event);

      // Simulate 3 failed attempts
      (uploadEventsBatch as jest.Mock)
        .mockResolvedValueOnce([
          {
            success: false,
            eventId: "evt_001",
            path: "path1",
            idempotent: false,
            error: "Error 1",
          },
        ])
        .mockResolvedValueOnce([
          {
            success: false,
            eventId: "evt_001",
            path: "path1",
            idempotent: false,
            error: "Error 2",
          },
        ])
        .mockResolvedValueOnce([
          {
            success: false,
            eventId: "evt_001",
            path: "path1",
            idempotent: false,
            error: "Error 3",
          },
        ]);

      // First attempt
      await outboundSync.syncAll();
      const pending1 = await eventQueue.getPendingEvents();
      expect(pending1[0].attempts).toBe(1);

      // Second attempt
      await outboundSync.syncAll();
      const pending2 = await eventQueue.getPendingEvents();
      expect(pending2[0].attempts).toBe(2);

      // Third attempt (max retries)
      await outboundSync.syncAll();
      const pending3 = await eventQueue.getPendingEvents();
      expect(pending3[0].attempts).toBe(3);

      // Fourth attempt should still fail but mark as max retries exceeded
      const result = await outboundSync.syncAll();
      expect(result.errors.some((e) => e.includes("Max retries exceeded"))).toBe(true);
    });

    it("should process events in batches", async () => {
      // Create 60 events (more than batch size of 50)
      const events = Array.from({ length: 60 }, (_, i) => ({
        ...validCardReviewedEvent,
        event_id: `evt_${String(i + 1).padStart(3, "0")}`,
      }));

      for (const event of events) {
        await eventQueue.enqueue(event);
      }

      // Mock batch uploads
      (uploadEventsBatch as jest.Mock)
        .mockResolvedValueOnce(
          events.slice(0, 50).map((e) => ({
            success: true,
            eventId: e.event_id,
            path: `path/${e.event_id}`,
            idempotent: false,
          }))
        )
        .mockResolvedValueOnce(
          events.slice(50, 60).map((e) => ({
            success: true,
            eventId: e.event_id,
            path: `path/${e.event_id}`,
            idempotent: false,
          }))
        );

      const result = await outboundSync.syncAll();

      expect(result.uploaded).toBe(60);
      expect(uploadEventsBatch).toHaveBeenCalledTimes(2);
    });
  });

  describe("getStatus", () => {
    it("should return pending count", async () => {
      await eventQueue.enqueue(validCardReviewedEvent);
      const event2 = { ...validCardReviewedEvent, event_id: "evt_002" };
      await eventQueue.enqueue(event2);

      const status = await outboundSync.getStatus();

      expect(status.pendingCount).toBe(2);
    });

    it("should return oldest pending event", async () => {
      const event1 = { ...validCardReviewedEvent, event_id: "evt_001" };
      const event2 = { ...validCardReviewedEvent, event_id: "evt_002" };

      // Add small delay between enqueues
      await eventQueue.enqueue(event1);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await eventQueue.enqueue(event2);

      const status = await outboundSync.getStatus();

      expect(status.oldestPending).toBeDefined();
      expect(status.oldestPending?.event.event_id).toBe("evt_001");
    });
  });
});

