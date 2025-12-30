/**
 * Event Projector Tests
 * 
 * Tests for event projection validation including:
 * - Event validation before projection
 * - Reading and validating events from Firestore
 * - Projection error handling
 */

import {
  validateEventForProjection,
  readAndValidateEvent,
  projectEvent,
} from "../../src/projector/eventProjector";
import { Firestore } from "@google-cloud/firestore";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { validCardReviewedEvent } from "../fixtures/cardReviewed.fixture.ts";
import { z } from "zod";

// Mock Firestore
jest.mock("@google-cloud/firestore");

// Mock card projector to avoid needing full Firestore transaction setup
jest.mock("../../src/projector/cardProjector", () => ({
  projectCardReviewedEvent: jest.fn(),
}));

describe("Event Projector", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockDoc = jest.fn(() => ({
      get: mockGet,
    }));

    mockFirestore = {
      doc: mockDoc,
    } as any;
  });

  describe("validateEventForProjection", () => {
    it("should validate a valid event", () => {
      const result = validateEventForProjection(validUserEvent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.event.event_id).toBe(validUserEvent.event_id);
      }
    });

    it("should return error for invalid event", () => {
      const invalidEvent = { ...validUserEvent, event_id: "invalid" };
      const result = validateEventForProjection(invalidEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });

    it("should return error for missing required fields", () => {
      const invalidEvent = { ...validUserEvent };
      delete (invalidEvent as any).user_id;
      const result = validateEventForProjection(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe("readAndValidateEvent", () => {
    it("should read and validate existing event", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => validUserEvent,
      });

      const result = await readAndValidateEvent(
        mockFirestore,
        "user_123",
        "lib_abc",
        validUserEvent.event_id
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.event.event_id).toBe(validUserEvent.event_id);
      }
    });

    it("should return error when event doesn't exist", async () => {
      mockGet.mockResolvedValue({ exists: false });

      const result = await readAndValidateEvent(
        mockFirestore,
        "user_123",
        "lib_abc",
        "evt_nonexistent"
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("not found");
      }
    });

    it("should return error for invalid event data", async () => {
      const invalidEvent = { ...validUserEvent, event_id: "invalid" };
      mockGet.mockResolvedValue({
        exists: true,
        data: () => invalidEvent,
      });

      const result = await readAndValidateEvent(
        mockFirestore,
        "user_123",
        "lib_abc",
        "evt_invalid"
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("validation failed");
      }
    });
  });

  describe("projectEvent", () => {
    it("should successfully project a valid card_reviewed event", async () => {
      // Mock the card projector to return success
      const { projectCardReviewedEvent } = require("../../src/projector/cardProjector");
      projectCardReviewedEvent.mockResolvedValue({
        success: true,
        eventId: validCardReviewedEvent.event_id,
        cardId: validCardReviewedEvent.entity.id,
        scheduleViewUpdated: true,
        performanceViewUpdated: true,
        idempotent: false,
      });

      // validCardReviewedEvent has type "card_reviewed" which is handled by the router
      const result = await projectEvent(mockFirestore, validCardReviewedEvent);

      expect(result.success).toBe(true);
      expect(result.eventId).toBe(validCardReviewedEvent.event_id);
      expect(projectCardReviewedEvent).toHaveBeenCalledWith(mockFirestore, validCardReviewedEvent);
    });

    it("should handle unknown event types gracefully", async () => {
      // Create an event with an unknown type
      const unknownEvent = {
        ...validUserEvent,
        type: "unknown_event_type",
      };

      // Unknown event types return success with an error message
      const result = await projectEvent(mockFirestore, unknownEvent);

      expect(result.success).toBe(true);
      expect(result.eventId).toBe(unknownEvent.event_id);
      // Router returns success but with error message for unknown types
      expect(result.error).toBeDefined();
      expect(result.error).toContain("No projector for event type");
    });
  });
});

