/**
 * Schedule Update Projector Tests
 * 
 * Tests for acceleration_applied and lapse_applied event projection including:
 * - Projection to CardScheduleView
 * - Idempotency via last_applied cursor
 */

import {
  projectAccelerationAppliedEvent,
  projectLapseAppliedEvent,
} from "../../src/projector/scheduleUpdateProjector";
import { Firestore } from "@google-cloud/firestore";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { validAccelerationAppliedEvent } from "../fixtures/accelerationApplied.fixture.ts";
import { validLapseAppliedEvent } from "../fixtures/lapseApplied.fixture.ts";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("Schedule Update Projector", () => {
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

  describe("projectAccelerationAppliedEvent", () => {
    it("should successfully project acceleration_applied event", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      const result = await projectAccelerationAppliedEvent(mockFirestore, validAccelerationAppliedEvent);

      expect(result.success).toBe(true);
      expect(result.viewUpdated).toBe(true);
      expect(result.idempotent).toBe(false);
      expect(result.cardId).toBe(validAccelerationAppliedEvent.entity.id);
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("should handle idempotent event", async () => {
      const existingView = {
        type: "card_schedule_view",
        card_id: "card_0001",
        last_applied: {
          received_at: validAccelerationAppliedEvent.received_at,
          event_id: validAccelerationAppliedEvent.event_id,
        },
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => existingView,
      });

      const result = await projectAccelerationAppliedEvent(mockFirestore, validAccelerationAppliedEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.viewUpdated).toBe(false);
    });

    it("should update stability and due date correctly", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      let capturedUpdate: any = null;
      mockSet.mockImplementation((data: any) => {
        capturedUpdate = data;
      });

      await projectAccelerationAppliedEvent(mockFirestore, validAccelerationAppliedEvent);

      expect(capturedUpdate).toBeDefined();
      expect(capturedUpdate.type).toBe("card_schedule_view");
      expect(capturedUpdate.stability).toBe(validAccelerationAppliedEvent.payload.new_stability);
      expect(capturedUpdate.interval_days).toBe(validAccelerationAppliedEvent.payload.next_due_days);
      expect(new Date(capturedUpdate.due_at).getTime()).toBeGreaterThan(new Date().getTime());
    });

    it("should return error for invalid payload", async () => {
      const invalidEvent = {
        ...validAccelerationAppliedEvent,
        payload: { original_stability: -1 }, // Invalid
      };

      const result = await projectAccelerationAppliedEvent(mockFirestore, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid payload");
    });

    it("should return error for wrong entity kind", async () => {
      const wrongEvent = {
        ...validAccelerationAppliedEvent,
        entity: { kind: "question", id: "q_0001" },
      };

      const result = await projectAccelerationAppliedEvent(mockFirestore, wrongEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Expected entity.kind to be "card"');
    });
  });

  describe("projectLapseAppliedEvent", () => {
    it("should successfully project lapse_applied event", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      const result = await projectLapseAppliedEvent(mockFirestore, validLapseAppliedEvent);

      expect(result.success).toBe(true);
      expect(result.viewUpdated).toBe(true);
      expect(result.idempotent).toBe(false);
      expect(result.cardId).toBe(validLapseAppliedEvent.entity.id);
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("should update stability and move card to learning state", async () => {
      const existingView = {
        type: "card_schedule_view",
        card_id: "card_0001",
        state: 2, // review state
        difficulty: 5.0,
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

      await projectLapseAppliedEvent(mockFirestore, validLapseAppliedEvent);

      expect(capturedUpdate).toBeDefined();
      expect(capturedUpdate).not.toBeNull();
      expect(capturedUpdate.stability).toBe(validLapseAppliedEvent.payload.new_stability);
      expect(capturedUpdate.state).toBe(1); // Moved back to learning
      expect(capturedUpdate.difficulty).toBeGreaterThan(5.0); // Increased
      expect(capturedUpdate.last_grade).toBe("again");
    });

    it("should return error for invalid payload", async () => {
      const invalidEvent = {
        ...validLapseAppliedEvent,
        payload: { original_stability: -1 }, // Invalid
      };

      const result = await projectLapseAppliedEvent(mockFirestore, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid payload");
    });

    it("should handle idempotent event", async () => {
      const existingView = {
        type: "card_schedule_view",
        card_id: "card_0001",
        last_applied: {
          received_at: validLapseAppliedEvent.received_at,
          event_id: validLapseAppliedEvent.event_id,
        },
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => existingView,
      });

      const result = await projectLapseAppliedEvent(mockFirestore, validLapseAppliedEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.viewUpdated).toBe(false);
    });
  });
});

