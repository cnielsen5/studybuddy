/**
 * Client-Side Event Validation Tests
 * 
 * Tests for client-side event validation and preparation including:
 * - Validation before enqueue
 * - Safe validation with error handling
 * - Event creation helpers
 */

import {
  validateEventBeforeEnqueue,
  safeValidateEventBeforeEnqueue,
  prepareEventForEnqueue,
  createAndValidateEvent,
} from "../../src/client/eventClient";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { z } from "zod";

describe("Client Event Validation", () => {
  describe("validateEventBeforeEnqueue", () => {
    it("should validate a valid event", () => {
      expect(() => validateEventBeforeEnqueue(validUserEvent)).not.toThrow();
      const result = validateEventBeforeEnqueue(validUserEvent);
      expect(result.event_id).toBe(validUserEvent.event_id);
    });

    it("should throw ZodError for invalid event", () => {
      const invalidEvent = { ...validUserEvent, event_id: "invalid" };
      expect(() => validateEventBeforeEnqueue(invalidEvent)).toThrow(z.ZodError);
    });

    it("should throw for missing required fields", () => {
      const invalidEvent = { ...validUserEvent };
      delete (invalidEvent as any).user_id;
      expect(() => validateEventBeforeEnqueue(invalidEvent)).toThrow(z.ZodError);
    });
  });

  describe("safeValidateEventBeforeEnqueue", () => {
    it("should return success for valid event", () => {
      const result = safeValidateEventBeforeEnqueue(validUserEvent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.event.event_id).toBe(validUserEvent.event_id);
      }
    });

    it("should return error for invalid event", () => {
      const invalidEvent = { ...validUserEvent, event_id: "invalid" };
      const result = safeValidateEventBeforeEnqueue(invalidEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError);
      }
    });
  });

  describe("prepareEventForEnqueue", () => {
    it("should validate and prepare valid event", () => {
      const result = prepareEventForEnqueue(validUserEvent);
      expect(result.event.event_id).toBe(validUserEvent.event_id);
      expect(result.path).toContain("users/");
      expect(result.path).toContain("/libraries/");
      expect(result.path).toContain("/events/");
      expect(result.eventId).toBe(validUserEvent.event_id);
    });

    it("should throw for invalid event", () => {
      const invalidEvent = { ...validUserEvent, event_id: "invalid" };
      expect(() => prepareEventForEnqueue(invalidEvent)).toThrow(z.ZodError);
    });
  });

  describe("createAndValidateEvent", () => {
    it("should create and validate event with minimal data", () => {
      const event = createAndValidateEvent({
        event_id: "evt_test_001",
        type: "card_reviewed",
        user_id: "user_123",
        library_id: "lib_abc",
        entity: { kind: "card", id: "card_0001" },
        payload: { grade: "good", seconds_spent: 18 },
        schema_version: "1.0",
      });

      expect(event.event_id).toBe("evt_test_001");
      expect(event.type).toBe("card_reviewed");
      expect(event.user_id).toBe("user_123");
      expect(event.library_id).toBe("lib_abc");
      expect(typeof event.occurred_at).toBe("string");
      expect(typeof event.received_at).toBe("string");
    });

    it("should use provided timestamps if available", () => {
      const occurredAt = "2025-01-01T00:00:00Z";
      const receivedAt = "2025-01-01T00:00:01Z";

      const event = createAndValidateEvent({
        event_id: "evt_test_002",
        type: "card_reviewed",
        user_id: "user_123",
        library_id: "lib_abc",
        occurred_at: occurredAt,
        received_at: receivedAt,
        entity: { kind: "card", id: "card_0001" },
        payload: { grade: "good", seconds_spent: 18 },
        schema_version: "1.0",
      });

      expect(event.occurred_at).toBe(occurredAt);
      expect(event.received_at).toBe(receivedAt);
    });

    it("should throw for invalid event data", () => {
      expect(() =>
        createAndValidateEvent({
          event_id: "invalid", // Invalid format
          type: "card_reviewed",
          user_id: "user_123",
          library_id: "lib_abc",
          entity: { kind: "card", id: "card_0001" },
          payload: { grade: "good", seconds_spent: 18 },
          schema_version: "1.0",
        })
      ).toThrow(z.ZodError);
    });
  });
});

