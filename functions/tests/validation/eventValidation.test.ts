/**
 * Event Validation Tests
 * 
 * Tests for event validation utilities including:
 * - Zod validation
 * - Path construction
 * - Path component extraction
 */

import {
  validateEventForIngestion,
  safeValidateEvent,
  getEventPath,
  getEventPathComponents,
  prepareEventForWrite,
} from "../../src/validation/eventValidation";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { validCardReviewedEvent } from "../fixtures/cardReviewed.fixture.ts";
import { z } from "zod";

describe("Event Validation", () => {
  describe("validateEventForIngestion", () => {
    it("should validate a valid event", () => {
      expect(() => validateEventForIngestion(validUserEvent)).not.toThrow();
      const result = validateEventForIngestion(validUserEvent);
      expect(result.event_id).toBe(validUserEvent.event_id);
    });

    it("should throw ZodError for invalid event", () => {
      const invalidEvent = { ...validUserEvent, event_id: "invalid" };
      expect(() => validateEventForIngestion(invalidEvent)).toThrow(z.ZodError);
    });

    it("should throw ZodError for missing required fields", () => {
      const invalidEvent = { ...validUserEvent };
      delete (invalidEvent as any).user_id;
      expect(() => validateEventForIngestion(invalidEvent)).toThrow(z.ZodError);
    });

    it("should validate all event fixtures", () => {
      const events = [
        validUserEvent,
        validCardReviewedEvent,
      ];

      for (const event of events) {
        expect(() => validateEventForIngestion(event)).not.toThrow();
      }
    });
  });

  describe("safeValidateEvent", () => {
    it("should return success for valid event", () => {
      const result = safeValidateEvent(validUserEvent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.event_id).toBe(validUserEvent.event_id);
      }
    });

    it("should return error for invalid event", () => {
      const invalidEvent = { ...validUserEvent, event_id: "invalid" };
      const result = safeValidateEvent(invalidEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });
  });

  describe("getEventPath", () => {
    it("should construct correct path", () => {
      const path = getEventPath("user_123", "lib_abc", "evt_001");
      expect(path).toBe("users/user_123/libraries/lib_abc/events/evt_001");
    });

    it("should throw for invalid userId format", () => {
      expect(() => getEventPath("invalid", "lib_abc", "evt_001")).toThrow(
        "Invalid userId format"
      );
    });

    it("should throw for invalid libraryId format", () => {
      expect(() => getEventPath("user_123", "invalid", "evt_001")).toThrow(
        "Invalid libraryId format"
      );
    });

    it("should throw for invalid eventId format", () => {
      expect(() => getEventPath("user_123", "lib_abc", "invalid")).toThrow(
        "Invalid eventId format"
      );
    });
  });

  describe("getEventPathComponents", () => {
    it("should extract path components from valid event", () => {
      const components = getEventPathComponents(validUserEvent);
      expect(components.userId).toBe(validUserEvent.user_id);
      expect(components.libraryId).toBe(validUserEvent.library_id);
      expect(components.eventId).toBe(validUserEvent.event_id);
      expect(components.path).toBe(
        `users/${validUserEvent.user_id}/libraries/${validUserEvent.library_id}/events/${validUserEvent.event_id}`
      );
    });
  });

  describe("prepareEventForWrite", () => {
    it("should validate and prepare valid event", () => {
      const result = prepareEventForWrite(validUserEvent);
      expect(result.event.event_id).toBe(validUserEvent.event_id);
      expect(result.path).toContain("users/");
      expect(result.path).toContain("/libraries/");
      expect(result.path).toContain("/events/");
      expect(result.userId).toBe(validUserEvent.user_id);
      expect(result.libraryId).toBe(validUserEvent.library_id);
      expect(result.eventId).toBe(validUserEvent.event_id);
    });

    it("should throw for invalid event", () => {
      const invalidEvent = { ...validUserEvent, event_id: "invalid" };
      expect(() => prepareEventForWrite(invalidEvent)).toThrow(z.ZodError);
    });
  });
});

