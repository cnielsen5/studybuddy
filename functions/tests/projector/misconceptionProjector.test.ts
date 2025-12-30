/**
 * Misconception Projector Tests
 * 
 * Tests for misconception_probe_result event projection including:
 * - Projection to MisconceptionEdgeView
 * - Idempotency via last_applied cursor
 */

import { projectMisconceptionProbeResultEvent } from "../../src/projector/misconceptionProjector";
import { Firestore } from "@google-cloud/firestore";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { validMisconceptionProbeResultEvent } from "../fixtures/misconceptionProbeResult.fixture.ts";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("Misconception Projector", () => {
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

  describe("projectMisconceptionProbeResultEvent", () => {
    it("should successfully project new event to misconception view", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      const result = await projectMisconceptionProbeResultEvent(mockFirestore, validMisconceptionProbeResultEvent);

      expect(result.success).toBe(true);
      expect(result.viewUpdated).toBe(true);
      expect(result.idempotent).toBe(false);
      expect(result.misconceptionId).toBe(validMisconceptionProbeResultEvent.entity.id);
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("should handle idempotent event (already processed)", async () => {
      const existingView = {
        type: "misconception_edge_view",
        misconception_id: "mis_edge_001",
        last_applied: {
          received_at: validMisconceptionProbeResultEvent.received_at,
          event_id: validMisconceptionProbeResultEvent.event_id,
        },
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => existingView,
      });

      const result = await projectMisconceptionProbeResultEvent(mockFirestore, validMisconceptionProbeResultEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.viewUpdated).toBe(false);
      expect(mockSet).not.toHaveBeenCalled();
    });

    it("should return error for invalid payload", async () => {
      const invalidEvent = {
        ...validMisconceptionProbeResultEvent,
        payload: { confirmed: "invalid" }, // Wrong type
      };

      const result = await projectMisconceptionProbeResultEvent(mockFirestore, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid payload");
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should return error for wrong entity kind", async () => {
      const wrongEvent = {
        ...validMisconceptionProbeResultEvent,
        entity: { kind: "card", id: "card_0001" },
      };

      const result = await projectMisconceptionProbeResultEvent(mockFirestore, wrongEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Expected entity.kind to be "misconception_edge"');
    });

    it("should increase strength when misconception is confirmed", async () => {
      const existingView = {
        type: "misconception_edge_view",
        misconception_id: "mis_edge_001",
        strength: 0.5,
        status: "active",
        concept_a_id: "concept_attention",
        concept_b_id: "concept_working_memory",
        direction: { from: "concept_attention", to: "concept_working_memory" },
        misconception_type: "directionality",
        evidence: {
          relationship_failures: 0,
          high_confidence_errors: 0,
          probe_confirmations: 0,
        },
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

      await projectMisconceptionProbeResultEvent(mockFirestore, validMisconceptionProbeResultEvent);

      expect(capturedUpdate).toBeDefined();
      expect(capturedUpdate).not.toBeNull();
      expect(capturedUpdate.strength).toBeGreaterThan(0.5); // Increased
      expect(capturedUpdate.evidence.probe_confirmations).toBe(1);
    });

    it("should decrease strength when misconception is not confirmed", async () => {
      const existingView = {
        type: "misconception_edge_view",
        misconception_id: "mis_edge_001",
        strength: 0.5,
        status: "active",
        concept_a_id: "concept_attention",
        concept_b_id: "concept_working_memory",
        direction: { from: "concept_attention", to: "concept_working_memory" },
        misconception_type: "directionality",
        evidence: {
          relationship_failures: 0,
          high_confidence_errors: 0,
          probe_confirmations: 0,
        },
        last_applied: {
          received_at: "2025-01-01T00:00:00.000Z",
          event_id: "evt_old",
        },
      };

      const notConfirmedEvent = {
        ...validMisconceptionProbeResultEvent,
        payload: {
          confirmed: false,
          explanation_quality: "weak",
          seconds_spent: 30,
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

      await projectMisconceptionProbeResultEvent(mockFirestore, notConfirmedEvent);

      expect(capturedUpdate).toBeDefined();
      expect(capturedUpdate).not.toBeNull();
      expect(capturedUpdate.strength).toBeLessThan(0.5); // Decreased
    });
  });
});

