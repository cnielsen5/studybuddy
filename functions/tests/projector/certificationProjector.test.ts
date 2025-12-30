/**
 * Certification Projector Tests
 * 
 * Tests for mastery_certification_completed event projection including:
 * - Projection to ConceptCertificationView
 * - Idempotency via last_applied cursor
 */

import { projectMasteryCertificationCompletedEvent } from "../../src/projector/certificationProjector";
import { Firestore } from "@google-cloud/firestore";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { validMasteryCertificationCompletedEvent } from "../fixtures/masteryCertificationCompleted.fixture.ts";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("Certification Projector", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockSet = jest.fn().mockResolvedValue(undefined);
    mockDoc = jest.fn(() => ({
      get: mockGet,
      set: mockSet,
    }));

    mockFirestore = {
      doc: mockDoc,
    } as any;
  });

  describe("projectMasteryCertificationCompletedEvent", () => {
    it("should successfully project new certification event", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      const result = await projectMasteryCertificationCompletedEvent(
        mockFirestore,
        validMasteryCertificationCompletedEvent
      );

      expect(result.success).toBe(true);
      expect(result.viewUpdated).toBe(true);
      expect(result.idempotent).toBe(false);
      expect(result.conceptId).toBe(validMasteryCertificationCompletedEvent.entity.id);
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("should handle idempotent event (already processed)", async () => {
      const existingView = {
        type: "concept_certification_view",
        concept_id: "concept_0001",
        last_applied: {
          received_at: validMasteryCertificationCompletedEvent.received_at,
          event_id: validMasteryCertificationCompletedEvent.event_id,
        },
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => existingView,
      });

      const result = await projectMasteryCertificationCompletedEvent(
        mockFirestore,
        validMasteryCertificationCompletedEvent
      );

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.viewUpdated).toBe(false);
      expect(mockSet).not.toHaveBeenCalled();
    });

    it("should return error for invalid payload", async () => {
      const invalidEvent = {
        ...validMasteryCertificationCompletedEvent,
        payload: { certification_result: "invalid" }, // Invalid enum value
      };

      const result = await projectMasteryCertificationCompletedEvent(mockFirestore, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid payload");
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should return error for wrong entity kind", async () => {
      const wrongEvent = {
        ...validMasteryCertificationCompletedEvent,
        entity: { kind: "card", id: "card_0001" },
      };

      const result = await projectMasteryCertificationCompletedEvent(mockFirestore, wrongEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Expected entity.kind to be "concept"');
    });

    it("should calculate accuracy correctly", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      let capturedUpdate: any = null;
      mockSet.mockImplementation((data: any) => {
        capturedUpdate = data;
      });

      await projectMasteryCertificationCompletedEvent(mockFirestore, validMasteryCertificationCompletedEvent);

      expect(capturedUpdate).toBeDefined();
      expect(capturedUpdate.type).toBe("concept_certification_view");
      expect(capturedUpdate.concept_id).toBe(validMasteryCertificationCompletedEvent.entity.id);
      expect(capturedUpdate.certification_result).toBe("partial");
      expect(capturedUpdate.questions_answered).toBe(4);
      expect(capturedUpdate.correct_count).toBe(3);
      expect(capturedUpdate.accuracy).toBe(0.75); // 3/4
      expect(capturedUpdate.certification_history).toHaveLength(1);
    });

    it("should append to certification history", async () => {
      const existingView = {
        type: "concept_certification_view",
        concept_id: "concept_0001",
        certification_history: [
          {
            certification_result: "none",
            date: "2025-12-01T00:00:00.000Z",
            questions_answered: 3,
            correct_count: 1,
          },
        ],
        last_applied: {
          received_at: "2025-01-01T00:00:00.000Z",
          event_id: "evt_old",
        },
      };

      let capturedUpdate: any = null;
      mockDoc.mockImplementation((path: string) => {
        return {
          path,
          get: async () => ({
            exists: true,
            data: () => existingView,
          }),
          set: async (data: any) => {
            capturedUpdate = data;
            await mockSet(data);
          },
        };
      });

      await projectMasteryCertificationCompletedEvent(mockFirestore, validMasteryCertificationCompletedEvent);

      expect(capturedUpdate).toBeDefined();
      expect(capturedUpdate).not.toBeNull();
      expect(capturedUpdate.certification_history).toHaveLength(2);
      expect(capturedUpdate.certification_history[1].certification_result).toBe("partial");
    });
  });
});

