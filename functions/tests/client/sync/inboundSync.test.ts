/**
 * Inbound Sync Tests
 * 
 * Tests for inbound sync functionality including:
 * - Fetching new events since cursor
 * - Cursor updates
 * - Batch fetching
 * - Tie-breaking with event_id
 */

import { InboundSync } from "../../../src/client/sync/inboundSync";
import { MemoryCursorStore } from "../../../src/client/sync/syncCursor";
import { Firestore } from "@google-cloud/firestore";
import { validCardReviewedEvent } from "../../fixtures/cardReviewed.fixture.ts";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("Inbound Sync", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let cursorStore: MemoryCursorStore;
  let inboundSync: InboundSync;
  let mockCollection: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockWhere: jest.Mock;
  let mockLimit: jest.Mock;
  let mockStartAfter: jest.Mock;
  let mockGet: jest.Mock;

  const userId = "user_123";
  const libraryId = "lib_abc";

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockStartAfter = jest.fn().mockReturnValue({ get: mockGet });
    mockLimit = jest.fn().mockReturnValue({ startAfter: mockStartAfter, get: mockGet });
    mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy, limit: mockLimit });
    mockOrderBy = jest.fn().mockReturnValue({ where: mockWhere, limit: mockLimit });
    mockCollection = jest.fn().mockReturnValue({
      orderBy: mockOrderBy,
      where: mockWhere,
    });

    mockFirestore = {
      collection: mockCollection,
    } as any;

    cursorStore = new MemoryCursorStore();
    inboundSync = new InboundSync(mockFirestore, cursorStore, userId, libraryId, {
      batchSize: 100,
      maxEvents: 1000,
    });
  });

  describe("sync", () => {
    it("should return success when no new events", async () => {
      mockGet.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await inboundSync.sync();

      expect(result.success).toBe(true);
      expect(result.eventsReceived).toBe(0);
      expect(result.cursorUpdated).toBe(false);
    });

    it("should fetch events when no cursor exists", async () => {
      const event1 = {
        ...validCardReviewedEvent,
        event_id: "evt_001",
        received_at: "2025-01-01T00:00:00.000Z",
      };
      const event2 = {
        ...validCardReviewedEvent,
        event_id: "evt_002",
        received_at: "2025-01-02T00:00:00.000Z",
      };

      mockGet.mockResolvedValue({
        empty: false,
        docs: [
          { data: () => event1 },
          { data: () => event2 },
        ],
      });

      const result = await inboundSync.sync();

      expect(result.success).toBe(true);
      expect(result.eventsReceived).toBe(2);
      expect(result.cursorUpdated).toBe(true);

      // Verify cursor was updated
      const cursor = await cursorStore.getCursor(libraryId);
      expect(cursor).not.toBeNull();
      expect(cursor?.last_received_at).toBe("2025-01-02T00:00:00.000Z");
      expect(cursor?.last_event_id).toBe("evt_002");
    });

    it("should fetch events since cursor", async () => {
      // Set initial cursor
      await cursorStore.updateCursor(libraryId, "2025-01-01T00:00:00.000Z", "evt_001");

      const event2 = {
        ...validCardReviewedEvent,
        event_id: "evt_002",
        received_at: "2025-01-02T00:00:00.000Z",
      };

      mockGet.mockResolvedValue({
        empty: false,
        docs: [{ data: () => event2 }],
      });

      const result = await inboundSync.sync();

      expect(result.success).toBe(true);
      expect(result.eventsReceived).toBe(1);

      // Verify cursor was updated
      const cursor = await cursorStore.getCursor(libraryId);
      expect(cursor?.last_received_at).toBe("2025-01-02T00:00:00.000Z");
      expect(cursor?.last_event_id).toBe("evt_002");
    });

    it("should filter out events with same timestamp but older event_id", async () => {
      // Set cursor to evt_002
      await cursorStore.updateCursor(libraryId, "2025-01-01T00:00:00.000Z", "evt_002");

      const event1 = {
        ...validCardReviewedEvent,
        event_id: "evt_001", // Older event_id
        received_at: "2025-01-01T00:00:00.000Z", // Same timestamp
      };
      const event3 = {
        ...validCardReviewedEvent,
        event_id: "evt_003", // Newer event_id
        received_at: "2025-01-01T00:00:00.000Z", // Same timestamp
      };

      mockGet.mockResolvedValue({
        empty: false,
        docs: [
          { data: () => event1 },
          { data: () => event3 },
        ],
      });

      const result = await inboundSync.sync();

      // Should only receive evt_003 (newer event_id with same timestamp)
      expect(result.eventsReceived).toBe(1);
    });

    it("should handle errors gracefully", async () => {
      mockGet.mockRejectedValue(new Error("Network error"));

      const result = await inboundSync.sync();

      expect(result.success).toBe(false);
      expect(result.eventsReceived).toBe(0);
      expect(result.error).toContain("Network error");
    });
  });

  describe("getCursor", () => {
    it("should return cursor for library", async () => {
      await cursorStore.updateCursor(libraryId, "2025-01-01T00:00:00.000Z", "evt_001");

      const cursor = await inboundSync.getCursor();

      expect(cursor).not.toBeNull();
      expect(cursor?.last_received_at).toBe("2025-01-01T00:00:00.000Z");
    });

    it("should return null when no cursor exists", async () => {
      const cursor = await inboundSync.getCursor();
      expect(cursor).toBeNull();
    });
  });

  describe("forceFullSync", () => {
    it("should clear cursor and allow full sync", async () => {
      await cursorStore.updateCursor(libraryId, "2025-01-01T00:00:00.000Z", "evt_001");

      await inboundSync.forceFullSync();

      const cursor = await cursorStore.getCursor(libraryId);
      expect(cursor).toBeNull();
    });
  });

  describe("batch fetching", () => {
    it("should fetch events in batches", async () => {
      // Create 150 events (more than batch size of 100)
      const events = Array.from({ length: 150 }, (_, i) => ({
        ...validCardReviewedEvent,
        event_id: `evt_${String(i + 1).padStart(3, "0")}`,
        received_at: new Date(2025, 0, 1, 0, 0, i).toISOString(),
      }));

      let callCount = 0;
      mockGet.mockImplementation(() => {
        const batchNum = callCount++;
        const start = batchNum * 100;
        const end = Math.min(start + 100, events.length);
        const batch = events.slice(start, end);

        return Promise.resolve({
          empty: batch.length === 0,
          docs: batch.map((e) => ({ data: () => e })),
        });
      });

      // Mock startAfter to chain queries
      let lastDocIndex = -1;
      mockStartAfter.mockImplementation((doc: any) => {
        lastDocIndex += 100;
        return { limit: mockLimit, get: mockGet };
      });

      const result = await inboundSync.sync();

      // Should fetch all 150 events across multiple batches
      expect(result.eventsReceived).toBe(150);
    });
  });
});

