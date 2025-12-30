/**
 * Card Projector Tests
 * 
 * Tests for card_reviewed event projection including:
 * - Projection to CardScheduleView
 * - Projection to CardPerformanceView
 * - Idempotency via last_applied cursor
 * - Transactional updates
 */

import { projectCardReviewedEvent } from "../../src/projector/cardProjector";
import { Firestore } from "@google-cloud/firestore";
import { validCardReviewedEvent } from "../fixtures/cardReviewed.fixture.ts";
import { validCardScheduleView } from "../fixtures/views/cardScheduleView.fixture.ts";
import { validCardPerformanceView } from "../fixtures/views/cardPerformanceView.fixture.ts";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("Card Projector", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockRunTransaction: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockSet = jest.fn();
    mockDoc = jest.fn(() => ({
      get: mockGet,
      set: mockSet,
    }));

    // Mock transaction
    mockRunTransaction = jest.fn(async (callback) => {
      // Create mock transaction object
      const mockTransaction = {
        get: jest.fn(),
        set: jest.fn(),
      };

      // Mock get to return different results for each view based on ref path
      mockTransaction.get.mockImplementation(async (ref: any) => {
        const path = ref.path || "";
        if (path.includes("card_schedule")) {
          return { exists: false, data: () => undefined };
        }
        if (path.includes("card_perf")) {
          return { exists: false, data: () => undefined };
        }
        return { exists: false, data: () => undefined };
      });

      // Mock firestore.doc to return refs with paths
      mockDoc.mockImplementation((path: string) => {
        return { path };
      });

      return await callback(mockTransaction);
    });

    mockFirestore = {
      doc: mockDoc,
      runTransaction: mockRunTransaction,
    } as any;
  });

  describe("projectCardReviewedEvent", () => {
    it("should successfully project new event to both views", async () => {
      const result = await projectCardReviewedEvent(mockFirestore, validCardReviewedEvent);

      expect(result.success).toBe(true);
      expect(result.scheduleViewUpdated).toBe(true);
      expect(result.performanceViewUpdated).toBe(true);
      expect(result.idempotent).toBe(false);
      expect(result.cardId).toBe(validCardReviewedEvent.entity.id);
      expect(mockRunTransaction).toHaveBeenCalledTimes(1);
    });

    it("should handle idempotent event (already processed)", async () => {
      // Mock transaction to return views with last_applied matching event
      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn(),
          set: jest.fn(),
        };

        const existingView = {
          ...validCardScheduleView,
          last_applied: {
            received_at: validCardReviewedEvent.received_at,
            event_id: validCardReviewedEvent.event_id,
          },
        };

        mockTransaction.get.mockResolvedValue({
          exists: true,
          data: () => existingView,
        });

        return await callback(mockTransaction);
      });

      const result = await projectCardReviewedEvent(mockFirestore, validCardReviewedEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.scheduleViewUpdated).toBe(false);
      expect(result.performanceViewUpdated).toBe(false);
    });

    it("should handle out-of-order events (older than last_applied)", async () => {
      // Mock transaction to return views with newer last_applied
      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn(),
          set: jest.fn(),
        };

        const existingView = {
          ...validCardScheduleView,
          last_applied: {
            received_at: new Date(Date.now() + 10000).toISOString(), // Future timestamp
            event_id: "evt_newer_event",
          },
        };

        mockTransaction.get.mockResolvedValue({
          exists: true,
          data: () => existingView,
        });

        return await callback(mockTransaction);
      });

      const result = await projectCardReviewedEvent(mockFirestore, validCardReviewedEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      // Out-of-order events are skipped (idempotent)
    });

    it("should return error for invalid payload", async () => {
      const invalidEvent = {
        ...validCardReviewedEvent,
        payload: { grade: "invalid_grade", seconds_spent: 18 },
      };

      const result = await projectCardReviewedEvent(mockFirestore, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid payload");
      expect(mockRunTransaction).not.toHaveBeenCalled();
    });

    it("should return error for wrong entity kind", async () => {
      const wrongEvent = {
        ...validCardReviewedEvent,
        entity: { kind: "question", id: "q_0001" },
      };

      const result = await projectCardReviewedEvent(mockFirestore, wrongEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Expected entity.kind to be "card"');
    });

    it("should update schedule view with correct FSRS-like calculations", async () => {
      let capturedScheduleUpdate: any = null;

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn(),
          set: jest.fn((ref: any, data: any) => {
            const path = ref.path || "";
            if (path.includes("card_schedule")) {
              capturedScheduleUpdate = data;
            }
          }),
        };

        // Mock get to return different results for each view
        mockTransaction.get.mockImplementation(async (ref: any) => {
          const path = ref.path || "";
          if (path.includes("card_schedule")) {
            return { exists: false, data: () => undefined };
          }
          if (path.includes("card_perf")) {
            return { exists: false, data: () => undefined };
          }
          return { exists: false, data: () => undefined };
        });

        // Mock firestore.doc to return refs with paths
        mockDoc.mockImplementation((path: string) => {
          return { path };
        });

        return await callback(mockTransaction);
      });

      await projectCardReviewedEvent(mockFirestore, validCardReviewedEvent);

      expect(capturedScheduleUpdate).toBeDefined();
      expect(capturedScheduleUpdate).not.toBeNull();
      expect(capturedScheduleUpdate.type).toBe("card_schedule_view");
      expect(capturedScheduleUpdate.card_id).toBe(validCardReviewedEvent.entity.id);
      expect(capturedScheduleUpdate.stability).toBeGreaterThan(0);
      expect(capturedScheduleUpdate.difficulty).toBeGreaterThan(0);
      expect(capturedScheduleUpdate.last_applied.event_id).toBe(validCardReviewedEvent.event_id);
    });

    it("should update performance view with correct metrics", async () => {
      let capturedPerformanceUpdate: any = null;

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn(),
          set: jest.fn((ref: any, data: any) => {
            const path = ref.path || "";
            if (path.includes("card_perf")) {
              capturedPerformanceUpdate = data;
            }
          }),
        };

        // Mock get to return different results for each view
        mockTransaction.get.mockImplementation(async (ref: any) => {
          const path = ref.path || "";
          if (path.includes("card_schedule")) {
            return { exists: false, data: () => undefined };
          }
          if (path.includes("card_perf")) {
            return { exists: false, data: () => undefined };
          }
          return { exists: false, data: () => undefined };
        });

        // Mock firestore.doc to return refs with paths
        mockDoc.mockImplementation((path: string) => {
          return { path };
        });

        return await callback(mockTransaction);
      });

      await projectCardReviewedEvent(mockFirestore, validCardReviewedEvent);

      expect(capturedPerformanceUpdate).toBeDefined();
      expect(capturedPerformanceUpdate).not.toBeNull();
      expect(capturedPerformanceUpdate.type).toBe("card_performance_view");
      expect(capturedPerformanceUpdate.card_id).toBe(validCardReviewedEvent.entity.id);
      expect(capturedPerformanceUpdate.total_reviews).toBe(1);
      expect(capturedPerformanceUpdate.accuracy_rate).toBeGreaterThanOrEqual(0);
      expect(capturedPerformanceUpdate.last_applied.event_id).toBe(validCardReviewedEvent.event_id);
    });
  });
});

