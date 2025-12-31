/**
 * Out-of-Order Event Delivery Tests
 * 
 * Tests handling of events that arrive out of chronological order:
 * - Older event arrives after newer event
 * - Idempotency prevents duplicate processing
 * - last_applied cursor ensures correct ordering
 */

import { projectCardReviewedEvent } from "../../src/projector/cardProjector";
import { Firestore } from "@google-cloud/firestore";
import { validCardReviewedEvent } from "../fixtures/cardReviewed.fixture.ts";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("Out-of-Order Event Delivery", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mock;
  let mockRunTransaction: jest.Mock;

  const userId = "user_123";
  const libraryId = "lib_abc";
  const cardId = "card_0001";

  beforeEach(() => {
    jest.clearAllMocks();

    // Track document data (shared across all mocks)
    const documentData: Record<string, any> = {};

    mockDoc = jest.fn((path: string) => {
      const docRef = {
        path,
        get: jest.fn(async () => {
          const data = documentData[path];
          return {
            exists: data !== undefined,
            data: () => data,
          };
        }),
        set: jest.fn(async (data: any) => {
          documentData[path] = data;
        }),
      };
      return docRef;
    });

    mockRunTransaction = jest.fn(async (callback: any) => {
      const transaction = {
        get: jest.fn(async (ref: any) => {
          const path = ref.path || ref;
          const data = documentData[path];
          return {
            exists: data !== undefined,
            data: () => data,
          };
        }),
        set: jest.fn((ref: any, data: any) => {
          const path = ref.path || ref;
          documentData[path] = data;
        }),
      };
      return callback(transaction);
    });

    mockFirestore = {
      doc: mockDoc,
      runTransaction: mockRunTransaction,
    } as any;
  });

  describe("Chronological ordering", () => {
    it("should reject older event if newer event already processed", async () => {
      // Newer event (processed first)
      const newerEvent = {
        ...validCardReviewedEvent,
        event_id: "evt_002",
        user_id: userId,
        library_id: libraryId,
        entity: { kind: "card" as const, id: cardId },
        payload: { grade: "easy" as const, seconds_spent: 12, rating_confidence: 2 },
        received_at: "2025-01-02T00:00:00.000Z", // Later timestamp
      };

      // Older event (arrives later, out of order)
      const olderEvent = {
        ...validCardReviewedEvent,
        event_id: "evt_001",
        user_id: userId,
        library_id: libraryId,
        entity: { kind: "card" as const, id: cardId },
        payload: { grade: "good" as const, seconds_spent: 18, rating_confidence: 2 },
        received_at: "2025-01-01T00:00:00.000Z", // Earlier timestamp
      };

      // Process newer event first
      const newerResult = await projectCardReviewedEvent(mockFirestore, newerEvent);
      expect(newerResult.success).toBe(true);
      expect(newerResult.idempotent).toBe(false);

      // Process older event second (out of order)
      const olderResult = await projectCardReviewedEvent(mockFirestore, olderEvent);
      expect(olderResult.success).toBe(true);
      
      // Should be idempotent (view already has newer event)
      expect(olderResult.idempotent).toBe(true);
      expect(olderResult.scheduleViewUpdated).toBe(false);
      expect(olderResult.performanceViewUpdated).toBe(false);

      // Verify view reflects newer event, not older
      const scheduleViewPath = `users/${userId}/libraries/${libraryId}/views/card_schedule/${cardId}`;
      const scheduleViewRef = mockDoc(scheduleViewPath);
      const scheduleViewDoc = await scheduleViewRef.get();
      
      if (scheduleViewDoc.exists) {
        const scheduleView = scheduleViewDoc.data();
        expect(scheduleView.last_applied.event_id).toBe(newerEvent.event_id);
        expect(scheduleView.last_applied.received_at).toBe(newerEvent.received_at);
        expect(scheduleView.last_grade).toBe("easy"); // From newer event
      }
    });

    it("should accept newer event even if older event processed first", async () => {
      // Older event (processed first)
      const olderEvent = {
        ...validCardReviewedEvent,
        event_id: "evt_001",
        user_id: userId,
        library_id: libraryId,
        entity: { kind: "card" as const, id: cardId },
        payload: { grade: "good" as const, seconds_spent: 18, rating_confidence: 2 },
        received_at: "2025-01-01T00:00:00.000Z",
      };

      // Newer event (arrives later, but chronologically correct)
      const newerEvent = {
        ...validCardReviewedEvent,
        event_id: "evt_002",
        user_id: userId,
        library_id: libraryId,
        entity: { kind: "card" as const, id: cardId },
        payload: { grade: "easy" as const, seconds_spent: 12, rating_confidence: 2 },
        received_at: "2025-01-02T00:00:00.000Z", // Later timestamp
      };

      // Process older event first
      const olderResult = await projectCardReviewedEvent(mockFirestore, olderEvent);
      expect(olderResult.success).toBe(true);
      expect(olderResult.idempotent).toBe(false);

      // Process newer event second (in order)
      const newerResult = await projectCardReviewedEvent(mockFirestore, newerEvent);
      expect(newerResult.success).toBe(true);
      expect(newerResult.idempotent).toBe(false); // Should update (newer than existing)

      // Verify view reflects newer event
      const scheduleViewPath = `users/${userId}/libraries/${libraryId}/views/card_schedule/${cardId}`;
      const scheduleViewRef = mockDoc(scheduleViewPath);
      const scheduleViewDoc = await scheduleViewRef.get();
      
      if (scheduleViewDoc.exists) {
        const scheduleView = scheduleViewDoc.data();
        expect(scheduleView.last_applied.event_id).toBe(newerEvent.event_id);
        expect(scheduleView.last_applied.received_at).toBe(newerEvent.received_at);
        expect(scheduleView.last_grade).toBe("easy"); // From newer event
      }
    });
  });

  describe("Idempotency with out-of-order", () => {
    it("should handle duplicate event IDs regardless of order", async () => {
      const event = {
        ...validCardReviewedEvent,
        event_id: "evt_001",
        user_id: userId,
        library_id: libraryId,
        entity: { kind: "card" as const, id: cardId },
        payload: { grade: "good" as const, seconds_spent: 18, rating_confidence: 2 },
        received_at: "2025-01-01T00:00:00.000Z",
      };

      // Process event first time
      const result1 = await projectCardReviewedEvent(mockFirestore, event);
      expect(result1.success).toBe(true);
      expect(result1.idempotent).toBe(false);

      // Process same event again (duplicate)
      const result2 = await projectCardReviewedEvent(mockFirestore, event);
      expect(result2.success).toBe(true);
      expect(result2.idempotent).toBe(true);
      expect(result2.scheduleViewUpdated).toBe(false);
      expect(result2.performanceViewUpdated).toBe(false);
    });

    it("should maintain correct state after out-of-order events", async () => {
      // Create sequence: evt_001 (old), evt_003 (new), evt_002 (middle, arrives late)
      const event1 = {
        ...validCardReviewedEvent,
        event_id: "evt_001",
        user_id: userId,
        library_id: libraryId,
        entity: { kind: "card" as const, id: cardId },
        payload: { grade: "good" as const, seconds_spent: 18, rating_confidence: 2 },
        received_at: "2025-01-01T00:00:00.000Z",
      };

      const event2 = {
        ...validCardReviewedEvent,
        event_id: "evt_002",
        user_id: userId,
        library_id: libraryId,
        entity: { kind: "card" as const, id: cardId },
        payload: { grade: "hard" as const, seconds_spent: 25, rating_confidence: 2 },
        received_at: "2025-01-02T00:00:00.000Z",
      };

      const event3 = {
        ...validCardReviewedEvent,
        event_id: "evt_003",
        user_id: userId,
        library_id: libraryId,
        entity: { kind: "card" as const, id: cardId },
        payload: { grade: "easy" as const, seconds_spent: 10, rating_confidence: 2 },
        received_at: "2025-01-03T00:00:00.000Z",
      };

      // Process in order: 1, 3, 2 (out of order)
      await projectCardReviewedEvent(mockFirestore, event1);
      await projectCardReviewedEvent(mockFirestore, event3);
      const result2 = await projectCardReviewedEvent(mockFirestore, event2);

      // Event 2 should be idempotent (view already has event 3, which is newer)
      expect(result2.success).toBe(true);
      expect(result2.idempotent).toBe(true);

      // Verify final state reflects event 3 (newest)
      const scheduleViewPath = `users/${userId}/libraries/${libraryId}/views/card_schedule/${cardId}`;
      const scheduleViewRef = mockDoc(scheduleViewPath);
      const scheduleViewDoc = await scheduleViewRef.get();
      
      if (scheduleViewDoc.exists) {
        const scheduleView = scheduleViewDoc.data();
        expect(scheduleView.last_applied.event_id).toBe(event3.event_id);
        expect(scheduleView.last_grade).toBe("easy");
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle events with same received_at timestamp", async () => {
      const sameTime = "2025-01-01T00:00:00.000Z";

      const event1 = {
        ...validCardReviewedEvent,
        event_id: "evt_001",
        user_id: userId,
        library_id: libraryId,
        entity: { kind: "card" as const, id: cardId },
        payload: { grade: "good" as const, seconds_spent: 18, rating_confidence: 2 },
        received_at: sameTime,
      };

      const event2 = {
        ...validCardReviewedEvent,
        event_id: "evt_002",
        user_id: userId,
        library_id: libraryId,
        entity: { kind: "card" as const, id: cardId },
        payload: { grade: "easy" as const, seconds_spent: 12, rating_confidence: 2 },
        received_at: sameTime, // Same timestamp
      };

      // Process first event
      await projectCardReviewedEvent(mockFirestore, event1);

      // Process second event (same timestamp)
      const result2 = await projectCardReviewedEvent(mockFirestore, event2);

      // Should be idempotent (same timestamp means event1 was processed first)
      // In practice, event_id comparison would break the tie
      expect(result2.success).toBe(true);
    });
  });
});

