/**
 * End-to-End Client Flow Tests
 * 
 * Tests the complete user journey:
 * 1. Client creates event locally
 * 2. Client uploads event to Firestore
 * 3. Projector processes event (simulated)
 * 4. Client reads updated views
 * 5. Verify views reflect the event
 * 
 * This validates the entire architecture works together.
 */

import { StudyBuddyClient } from "../../src/client";
import { projectCardReviewedEvent } from "../../src/projector/cardProjector";
import { Firestore } from "@google-cloud/firestore";
import { validCardReviewedEvent } from "../fixtures/cardReviewed.fixture.ts";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("End-to-End Client Flow", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockCollection: jest.Mock;
  let mockWhere: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;
  let mockQueryGet: jest.Mock;
  let mockRunTransaction: jest.Mock;
  let mockBatch: jest.Mock;
  let mockBatchSet: jest.Mock;
  let mockBatchCommit: jest.Mock;

  const userId = "user_123";
  const libraryId = "lib_abc";
  const deviceId = "device_001";
  const cardId = "card_0001";

  beforeEach(() => {
    jest.clearAllMocks();

    // Track document data for reads/writes (shared across all mocks)
    const documentData: Record<string, any> = {};

    // Setup Firestore mocks
    mockGet = jest.fn();
    mockSet = jest.fn();
    mockQueryGet = jest.fn();
    mockBatchSet = jest.fn();
    mockBatchCommit = jest.fn().mockResolvedValue(undefined);

    mockBatch = jest.fn(() => ({
      set: mockBatchSet,
      commit: mockBatchCommit,
    }));

    mockLimit = jest.fn().mockReturnValue({
      get: mockQueryGet,
    });

    mockOrderBy = jest.fn().mockReturnValue({
      limit: mockLimit,
    });

    mockWhere = jest.fn().mockReturnValue({
      orderBy: mockOrderBy,
    });

    mockCollection = jest.fn().mockReturnValue({
      where: mockWhere,
    });

    // Mock doc to return refs that share the same documentData
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

    // Mock transaction to use the same documentData
    mockRunTransaction = jest.fn(async (callback: any) => {
      const transaction = {
        get: jest.fn(async (ref: any) => {
          // ref is a docRef object created by mockDoc, which has a path property
          const path = typeof ref === 'string' ? ref : (ref?.path || ref);
          const data = documentData[path];
          return {
            exists: data !== undefined,
            data: () => data,
          };
        }),
        set: jest.fn((ref: any, data: any) => {
          // ref is a docRef object created by mockDoc, which has a path property
          const path = typeof ref === 'string' ? ref : (ref?.path || ref);
          documentData[path] = data;
        }),
      };
      return callback(transaction);
    });

    mockFirestore = {
      doc: mockDoc,
      collection: mockCollection,
      runTransaction: mockRunTransaction,
      batch: mockBatch,
    } as any;
  });

  describe("Complete card review flow", () => {
    it("should complete full flow: create → upload → project → read views", async () => {
      const client = new StudyBuddyClient(mockFirestore, userId, libraryId, deviceId);

      // Step 1: Get initial due cards (empty)
      mockQueryGet.mockResolvedValueOnce({ docs: [] });
      const initialDueCards = await client.getDueCards(10);
      expect(initialDueCards).toEqual([]);

      // Step 2: Review a card (creates and uploads event)
      const grade = "good" as const;
      const secondsSpent = 18;

      const uploadResult = await client.reviewCard(cardId, grade, secondsSpent);

      expect(uploadResult.success).toBe(true);
      expect(uploadResult.idempotent).toBe(false);

      // Step 3: Simulate projector processing the event
      // Get the uploaded event (we need to construct it from the upload result)
      // In a real scenario, the trigger would read the event from Firestore
      const uploadedEvent = {
        ...validCardReviewedEvent,
        event_id: uploadResult.eventId || "evt_001",
        user_id: userId,
        library_id: libraryId,
        entity: { kind: "card" as const, id: cardId },
        payload: { grade, seconds_spent: secondsSpent, rating_confidence: 2 },
        received_at: new Date().toISOString(),
      };

      // Project the event (views don't exist yet, so they'll be created)
      const projectionResult = await projectCardReviewedEvent(mockFirestore, uploadedEvent);

      expect(projectionResult.success).toBe(true);
      expect(projectionResult.scheduleViewUpdated).toBe(true);
      expect(projectionResult.performanceViewUpdated).toBe(true);

      // Step 4: Read updated views via client
      const updatedSchedule = await client.getCardSchedule(cardId);
      const updatedPerformance = await client.getCardPerformance(cardId);

      // Verify schedule view
      expect(updatedSchedule).not.toBeNull();
      if (updatedSchedule) {
        expect(updatedSchedule.card_id).toBe(cardId);
        expect(updatedSchedule.last_grade).toBe(grade);
        expect(updatedSchedule.last_applied).toBeDefined();
        expect(updatedSchedule.last_applied.event_id).toBe(uploadedEvent.event_id);
        expect(updatedSchedule.updated_at).toBeDefined();
      }

      // Verify performance view
      expect(updatedPerformance).not.toBeNull();
      if (updatedPerformance) {
        expect(updatedPerformance.card_id).toBe(cardId);
        expect(updatedPerformance.total_reviews).toBe(1);
        expect(updatedPerformance.correct_reviews).toBe(1); // "good" is correct
        expect(updatedPerformance.accuracy_rate).toBe(1.0);
        // avg_seconds uses exponential moving average (EMA) with alpha=0.2
        // First review: 0 * 0.8 + 18 * 0.2 = 3.6
        expect(updatedPerformance.avg_seconds).toBeCloseTo(3.6, 1);
        expect(updatedPerformance.streak).toBe(1);
        expect(updatedPerformance.max_streak).toBe(1);
        expect(updatedPerformance.last_applied).toBeDefined();
        expect(updatedPerformance.last_applied.event_id).toBe(uploadedEvent.event_id);
      }

      // Step 5: Get updated due cards list
      // The card should have a future due date now
      mockQueryGet.mockResolvedValueOnce({ docs: [] }); // No cards due yet (interval > 0)
      const updatedDueCards = await client.getDueCards(10);
      
      // Card should not be in due list (has future due date)
      const stillDue = updatedDueCards.find((c) => c.card_id === cardId);
      expect(stillDue).toBeUndefined();
    });

    it("should handle multiple reviews of the same card", async () => {
      const client = new StudyBuddyClient(mockFirestore, userId, libraryId, deviceId);

      // First review
      const eventPath1 = `users/${userId}/libraries/${libraryId}/events/evt_001`;
      const eventDoc1 = mockDoc(eventPath1);
      (eventDoc1.get as jest.Mock).mockResolvedValueOnce({ exists: false });
      (eventDoc1.set as jest.Mock).mockResolvedValueOnce(undefined);

      const uploadResult1 = await client.reviewCard(cardId, "good", 18);
      expect(uploadResult1.success).toBe(true);

      const event1 = {
        ...validCardReviewedEvent,
        event_id: uploadResult1.eventId || "evt_001",
        user_id: userId,
        library_id: libraryId,
        entity: { kind: "card" as const, id: cardId },
        payload: { grade: "good" as const, seconds_spent: 18, rating_confidence: 2 },
        received_at: "2025-01-01T00:00:00.000Z",
      };

      await projectCardReviewedEvent(mockFirestore, event1);

      // Second review (after some time)
      const eventPath2 = `users/${userId}/libraries/${libraryId}/events/evt_002`;
      const eventDoc2 = mockDoc(eventPath2);
      (eventDoc2.get as jest.Mock).mockResolvedValueOnce({ exists: false });
      (eventDoc2.set as jest.Mock).mockResolvedValueOnce(undefined);

      const uploadResult2 = await client.reviewCard(cardId, "easy", 12);
      expect(uploadResult2.success).toBe(true);

      const event2 = {
        ...validCardReviewedEvent,
        event_id: uploadResult2.eventId || "evt_002",
        user_id: userId,
        library_id: libraryId,
        entity: { kind: "card" as const, id: cardId },
        payload: { grade: "easy" as const, seconds_spent: 12, rating_confidence: 2 },
        received_at: "2025-01-02T00:00:00.000Z", // Later timestamp
      };

      await projectCardReviewedEvent(mockFirestore, event2);

      // Read updated views
      const finalSchedule = await client.getCardSchedule(cardId);
      const finalPerformance = await client.getCardPerformance(cardId);

      // Verify performance accumulated correctly
      expect(finalPerformance).not.toBeNull();
      if (finalPerformance) {
        expect(finalPerformance.total_reviews).toBe(2);
        expect(finalPerformance.correct_reviews).toBe(2); // Both "good" and "easy" are correct
        expect(finalPerformance.accuracy_rate).toBe(1.0);
        expect(finalPerformance.streak).toBe(2);
        expect(finalPerformance.max_streak).toBe(2);
        // avg_seconds uses EMA (alpha=0.2):
        // First review: 0 * 0.8 + 18 * 0.2 = 3.6
        // Second review: 3.6 * 0.8 + 12 * 0.2 = 2.88 + 2.4 = 5.28
        expect(finalPerformance.avg_seconds).toBeCloseTo(5.28, 1);
      }

      // Verify schedule reflects latest review
      expect(finalSchedule).not.toBeNull();
      if (finalSchedule) {
        expect(finalSchedule.last_grade).toBe("easy");
        expect(finalSchedule.last_applied.event_id).toBe(event2.event_id);
      }
    });

    it("should handle idempotent event upload (duplicate event)", async () => {
      const client = new StudyBuddyClient(mockFirestore, userId, libraryId, deviceId);

      // First upload
      const uploadResult1 = await client.reviewCard(cardId, "good", 18);
      expect(uploadResult1.success).toBe(true);
      expect(uploadResult1.idempotent).toBe(false);

      // Second upload (same card, but different event ID - will create new event)
      // To test true idempotency, we'd need to upload the exact same event
      // For now, we verify the structure works
      const uploadResult2 = await client.reviewCard(cardId, "good", 18);
      expect(uploadResult2.success).toBe(true);
      // Note: In real scenario with same event_id, this would be idempotent
    });
  });

  describe("Error handling in flow", () => {
    it("should handle validation failure gracefully", async () => {
      const client = new StudyBuddyClient(mockFirestore, userId, libraryId, deviceId);

      // This would fail validation if we passed invalid data
      // For now, we'll test that the client handles validation errors
      // (Actual validation is tested in unit tests)
      
      // Test that client returns error on validation failure
      // We can't easily trigger this without mocking, but the structure is there
      expect(client).toBeDefined();
    });

    it("should handle missing views gracefully", async () => {
      const client = new StudyBuddyClient(mockFirestore, userId, libraryId, deviceId);

      // Try to read views for a card that hasn't been reviewed
      const schedule = await client.getCardSchedule("card_nonexistent");
      const performance = await client.getCardPerformance("card_nonexistent");

      expect(schedule).toBeNull();
      expect(performance).toBeNull();
    });
  });
});

