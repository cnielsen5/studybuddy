/**
 * Relationship Projector Tests
 * 
 * Tests for relationship_reviewed event projection including:
 * - Projection to RelationshipScheduleView
 * - Projection to RelationshipPerformanceView
 * - Idempotency via last_applied cursor
 * - Transactional updates
 */

import { projectRelationshipReviewedEvent } from "../../src/projector/relationshipProjector";
import { Firestore } from "@google-cloud/firestore";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { validRelationshipReviewedEvent } from "../fixtures/relationshipReviewed.fixture.ts";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("Relationship Projector", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mock;
  let mockRunTransaction: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDoc = jest.fn((path: string) => ({ path }));

    mockRunTransaction = jest.fn(async (callback) => {
      const mockTransaction = {
        get: jest.fn(),
        set: jest.fn(),
      };

      mockTransaction.get.mockImplementation(async (ref: any) => {
        const path = ref.path || "";
        if (path.includes("relationship_schedule")) {
          return { exists: false, data: () => undefined };
        }
        if (path.includes("relationship_perf")) {
          return { exists: false, data: () => undefined };
        }
        return { exists: false, data: () => undefined };
      });

      return await callback(mockTransaction);
    });

    mockFirestore = {
      doc: mockDoc,
      runTransaction: mockRunTransaction,
    } as any;
  });

  describe("projectRelationshipReviewedEvent", () => {
    it("should successfully project new event to both views", async () => {
      const result = await projectRelationshipReviewedEvent(mockFirestore, validRelationshipReviewedEvent);

      expect(result.success).toBe(true);
      expect(result.scheduleViewUpdated).toBe(true);
      expect(result.performanceViewUpdated).toBe(true);
      expect(result.idempotent).toBe(false);
      expect(result.relationshipCardId).toBe(validRelationshipReviewedEvent.entity.id);
      expect(mockRunTransaction).toHaveBeenCalledTimes(1);
    });

    it("should handle idempotent event (already processed)", async () => {
      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn(),
          set: jest.fn(),
        };

        const existingView = {
          type: "relationship_schedule_view",
          last_applied: {
            received_at: validRelationshipReviewedEvent.received_at,
            event_id: validRelationshipReviewedEvent.event_id,
          },
        };

        mockTransaction.get.mockResolvedValue({
          exists: true,
          data: () => existingView,
        });

        return await callback(mockTransaction);
      });

      const result = await projectRelationshipReviewedEvent(mockFirestore, validRelationshipReviewedEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.scheduleViewUpdated).toBe(false);
      expect(result.performanceViewUpdated).toBe(false);
    });

    it("should return error for invalid payload", async () => {
      const invalidEvent = {
        ...validRelationshipReviewedEvent,
        payload: { concept_a_id: "concept_1", correct: true }, // Missing required fields
      };

      const result = await projectRelationshipReviewedEvent(mockFirestore, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid payload");
      expect(mockRunTransaction).not.toHaveBeenCalled();
    });

    it("should return error for wrong entity kind", async () => {
      const wrongEvent = {
        ...validRelationshipReviewedEvent,
        entity: { kind: "card", id: "card_0001" },
      };

      const result = await projectRelationshipReviewedEvent(mockFirestore, wrongEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Expected entity.kind to be "relationship_card"');
    });

    it("should update schedule view with correct calculations", async () => {
      let capturedScheduleUpdate: any = null;

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn(),
          set: jest.fn((ref: any, data: any) => {
            const path = ref.path || "";
            if (path.includes("relationship_schedule")) {
              capturedScheduleUpdate = data;
            }
          }),
        };

        mockTransaction.get.mockImplementation(async (ref: any) => {
          return { exists: false, data: () => undefined };
        });

        return await callback(mockTransaction);
      });

      await projectRelationshipReviewedEvent(mockFirestore, validRelationshipReviewedEvent);

      expect(capturedScheduleUpdate).toBeDefined();
      expect(capturedScheduleUpdate.type).toBe("relationship_schedule_view");
      expect(capturedScheduleUpdate.relationship_card_id).toBe(validRelationshipReviewedEvent.entity.id);
      expect(capturedScheduleUpdate.stability).toBeGreaterThan(0);
      expect(capturedScheduleUpdate.last_applied.event_id).toBe(validRelationshipReviewedEvent.event_id);
    });

    it("should update performance view with correct metrics", async () => {
      let capturedPerformanceUpdate: any = null;

      mockRunTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn(),
          set: jest.fn((ref: any, data: any) => {
            const path = ref.path || "";
            if (path.includes("relationship_perf")) {
              capturedPerformanceUpdate = data;
            }
          }),
        };

        mockTransaction.get.mockImplementation(async (ref: any) => {
          return { exists: false, data: () => undefined };
        });

        return await callback(mockTransaction);
      });

      await projectRelationshipReviewedEvent(mockFirestore, validRelationshipReviewedEvent);

      expect(capturedPerformanceUpdate).toBeDefined();
      expect(capturedPerformanceUpdate.type).toBe("relationship_performance_view");
      expect(capturedPerformanceUpdate.relationship_card_id).toBe(validRelationshipReviewedEvent.entity.id);
      expect(capturedPerformanceUpdate.total_reviews).toBe(1);
      expect(capturedPerformanceUpdate.last_applied.event_id).toBe(validRelationshipReviewedEvent.event_id);
    });
  });
});

