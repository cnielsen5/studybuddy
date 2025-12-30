/**
 * Annotation Projector Tests
 * 
 * Tests for card_annotation_updated event projection including:
 * - Projection to CardAnnotationView
 * - Idempotency via last_applied cursor
 * - Tag management (add, remove, update)
 * - Pinned status updates
 */

import { projectCardAnnotationUpdatedEvent } from "../../src/projector/annotationProjector";
import { Firestore } from "@google-cloud/firestore";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { validCardAnnotationUpdatedEvent } from "../fixtures/cardAnnotationUpdated.fixture.ts";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("Annotation Projector", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockSet = jest.fn();
    mockDoc = jest.fn(() => ({
      get: mockGet,
      set: mockSet,
    }));

    mockFirestore = {
      doc: mockDoc,
    } as any;
  });

  describe("projectCardAnnotationUpdatedEvent", () => {
    it("should successfully project new annotation event", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      const result = await projectCardAnnotationUpdatedEvent(mockFirestore, validCardAnnotationUpdatedEvent);

      expect(result.success).toBe(true);
      expect(result.viewUpdated).toBe(true);
      expect(result.idempotent).toBe(false);
      expect(result.cardId).toBe(validCardAnnotationUpdatedEvent.entity.id);
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("should handle idempotent event (already processed)", async () => {
      const existingView = {
        type: "card_annotation_view",
        card_id: "card_0001",
        last_applied: {
          received_at: validCardAnnotationUpdatedEvent.received_at,
          event_id: validCardAnnotationUpdatedEvent.event_id,
        },
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => existingView,
      });

      const result = await projectCardAnnotationUpdatedEvent(mockFirestore, validCardAnnotationUpdatedEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.viewUpdated).toBe(false);
      expect(mockSet).not.toHaveBeenCalled();
    });

    it("should return error for invalid payload", async () => {
      const invalidEvent = {
        ...validCardAnnotationUpdatedEvent,
        payload: { action: "invalid_action" }, // Invalid enum value
      };

      const result = await projectCardAnnotationUpdatedEvent(mockFirestore, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid payload");
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should return error for wrong entity kind", async () => {
      const wrongEvent = {
        ...validCardAnnotationUpdatedEvent,
        entity: { kind: "question", id: "q_0001" },
      };

      const result = await projectCardAnnotationUpdatedEvent(mockFirestore, wrongEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Expected entity.kind to be "card"');
    });

    it("should add tags when action is 'added'", async () => {
      const existingView = {
        type: "card_annotation_view",
        card_id: "card_0001",
        tags: ["existing_tag"],
        pinned: false,
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => existingView,
      });

      let capturedUpdate: any = null;
      mockSet.mockImplementation((data: any) => {
        capturedUpdate = data;
      });

      await projectCardAnnotationUpdatedEvent(mockFirestore, validCardAnnotationUpdatedEvent);

      expect(capturedUpdate).toBeDefined();
      expect(capturedUpdate.tags).toContain("existing_tag");
      expect(capturedUpdate.tags).toContain("cram");
      expect(capturedUpdate.tags).toContain("high-priority");
      expect(capturedUpdate.pinned).toBe(true);
    });

    it("should remove tags when action is 'removed'", async () => {
      const existingView = {
        type: "card_annotation_view",
        card_id: "card_0001",
        tags: ["cram", "high-priority", "keep_this"],
        pinned: true,
      };

      const removeEvent = {
        ...validCardAnnotationUpdatedEvent,
        payload: {
          action: "removed",
          tags: ["cram"],
        },
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => existingView,
      });

      let capturedUpdate: any = null;
      mockSet.mockImplementation((data: any) => {
        capturedUpdate = data;
      });

      await projectCardAnnotationUpdatedEvent(mockFirestore, removeEvent);

      expect(capturedUpdate).toBeDefined();
      expect(capturedUpdate.tags).not.toContain("cram");
      expect(capturedUpdate.tags).toContain("high-priority");
      expect(capturedUpdate.tags).toContain("keep_this");
    });

    it("should replace tags when action is 'updated'", async () => {
      const existingView = {
        type: "card_annotation_view",
        card_id: "card_0001",
        tags: ["old_tag1", "old_tag2"],
        pinned: false,
      };

      const updateEvent = {
        ...validCardAnnotationUpdatedEvent,
        payload: {
          action: "updated",
          tags: ["new_tag1", "new_tag2"],
          pinned: true,
        },
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => existingView,
      });

      let capturedUpdate: any = null;
      mockSet.mockImplementation((data: any) => {
        capturedUpdate = data;
      });

      await projectCardAnnotationUpdatedEvent(mockFirestore, updateEvent);

      expect(capturedUpdate).toBeDefined();
      expect(capturedUpdate.tags).toEqual(["new_tag1", "new_tag2"]);
      expect(capturedUpdate.tags).not.toContain("old_tag1");
      expect(capturedUpdate.pinned).toBe(true);
    });

    it("should create view with correct structure", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      let capturedUpdate: any = null;
      mockSet.mockImplementation((data: any) => {
        capturedUpdate = data;
      });

      await projectCardAnnotationUpdatedEvent(mockFirestore, validCardAnnotationUpdatedEvent);

      expect(capturedUpdate).toBeDefined();
      expect(capturedUpdate.type).toBe("card_annotation_view");
      expect(capturedUpdate.card_id).toBe(validCardAnnotationUpdatedEvent.entity.id);
      expect(Array.isArray(capturedUpdate.tags)).toBe(true);
      expect(typeof capturedUpdate.pinned).toBe("boolean");
      expect(capturedUpdate.last_applied.event_id).toBe(validCardAnnotationUpdatedEvent.event_id);
    });
  });
});

