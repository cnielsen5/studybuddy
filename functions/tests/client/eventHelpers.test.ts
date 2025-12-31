/**
 * Event Helpers Tests
 * 
 * Tests for client-side event creation helpers.
 */

import {
  generateEventId,
  createCardReviewedEvent,
  createQuestionAttemptedEvent,
  createSessionStartedEvent,
} from "../../src/client/eventHelpers";
import { validateEventBeforeEnqueue } from "../../src/client/eventClient";

describe("Event Helpers", () => {
  describe("generateEventId", () => {
    it("should generate unique event IDs", () => {
      const id1 = generateEventId();
      const id2 = generateEventId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^evt_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^evt_\d+_[a-z0-9]+$/);
    });

    it("should generate IDs with evt_ prefix", () => {
      const id = generateEventId();
      expect(id.startsWith("evt_")).toBe(true);
    });

    it("should generate different IDs when called multiple times", () => {
      const ids = new Set();
      for (let i = 0; i < 10; i++) {
        ids.add(generateEventId());
      }
      expect(ids.size).toBe(10);
    });
  });

  describe("createCardReviewedEvent", () => {
    it("should create a valid card_reviewed event", () => {
      const event = createCardReviewedEvent({
        userId: "user_123",
        libraryId: "lib_abc",
        cardId: "card_0001",
        grade: "good",
        secondsSpent: 18,
      });

      expect(event.type).toBe("card_reviewed");
      expect(event.user_id).toBe("user_123");
      expect(event.library_id).toBe("lib_abc");
      expect(event.entity.kind).toBe("card");
      expect(event.entity.id).toBe("card_0001");
      expect(event.payload.grade).toBe("good");
      expect(event.payload.seconds_spent).toBe(18);
      expect(event.schema_version).toBe("1.0");
      expect(event.event_id).toMatch(/^evt_/);
    });

    it("should use provided eventId if given", () => {
      const event = createCardReviewedEvent({
        userId: "user_123",
        libraryId: "lib_abc",
        cardId: "card_0001",
        grade: "good",
        secondsSpent: 18,
        eventId: "evt_custom_001",
      });

      expect(event.event_id).toBe("evt_custom_001");
    });

    it("should use provided timestamps if given", () => {
      const occurredAt = "2025-01-01T00:00:00.000Z";
      const event = createCardReviewedEvent({
        userId: "user_123",
        libraryId: "lib_abc",
        cardId: "card_0001",
        grade: "good",
        secondsSpent: 18,
        occurredAt,
      });

      expect(event.occurred_at).toBe(occurredAt);
      expect(typeof event.received_at).toBe("string");
    });

    it("should use provided deviceId if given", () => {
      const event = createCardReviewedEvent({
        userId: "user_123",
        libraryId: "lib_abc",
        cardId: "card_0001",
        grade: "good",
        secondsSpent: 18,
        deviceId: "device_001",
      });

      expect(event.device_id).toBe("device_001");
    });

    it("should default deviceId to 'unknown' if not provided", () => {
      const event = createCardReviewedEvent({
        userId: "user_123",
        libraryId: "lib_abc",
        cardId: "card_0001",
        grade: "good",
        secondsSpent: 18,
      });

      expect(event.device_id).toBe("unknown");
    });

    it("should create event that passes validation", () => {
      const event = createCardReviewedEvent({
        userId: "user_123",
        libraryId: "lib_abc",
        cardId: "card_0001",
        grade: "good",
        secondsSpent: 18,
      });

      expect(() => validateEventBeforeEnqueue(event)).not.toThrow();
    });

    it("should support all grade types", () => {
      const grades: Array<"again" | "hard" | "good" | "easy"> = ["again", "hard", "good", "easy"];

      grades.forEach((grade) => {
        const event = createCardReviewedEvent({
          userId: "user_123",
          libraryId: "lib_abc",
          cardId: "card_0001",
          grade,
          secondsSpent: 18,
        });

        expect(event.payload.grade).toBe(grade);
        expect(() => validateEventBeforeEnqueue(event)).not.toThrow();
      });
    });
  });

  describe("createQuestionAttemptedEvent", () => {
    it("should create a valid question_attempted event", () => {
      const event = createQuestionAttemptedEvent({
        userId: "user_123",
        libraryId: "lib_abc",
        questionId: "q_0001",
        selectedOptionId: "opt_A",
        correct: true,
        secondsSpent: 35,
      });

      expect(event.type).toBe("question_attempted");
      expect(event.user_id).toBe("user_123");
      expect(event.library_id).toBe("lib_abc");
      expect(event.entity.kind).toBe("question");
      expect(event.entity.id).toBe("q_0001");
      expect(event.payload.selected_option_id).toBe("opt_A");
      expect(event.payload.correct).toBe(true);
      expect(event.payload.seconds_spent).toBe(35);
      expect(event.schema_version).toBe("1.0");
    });

    it("should create event that passes validation", () => {
      const event = createQuestionAttemptedEvent({
        userId: "user_123",
        libraryId: "lib_abc",
        questionId: "q_0001",
        selectedOptionId: "opt_A",
        correct: false,
        secondsSpent: 30,
      });

      expect(() => validateEventBeforeEnqueue(event)).not.toThrow();
    });
  });

  describe("createSessionStartedEvent", () => {
    it("should create a valid session_started event", () => {
      const event = createSessionStartedEvent({
        userId: "user_123",
        libraryId: "lib_abc",
        sessionId: "session_0001",
        plannedLoad: 50,
        queueSize: 25,
        cramMode: true,
      });

      expect(event.type).toBe("session_started");
      expect(event.user_id).toBe("user_123");
      expect(event.library_id).toBe("lib_abc");
      expect(event.entity.kind).toBe("session");
      expect(event.entity.id).toBe("session_0001");
      expect(event.payload.planned_load).toBe(50);
      expect(event.payload.queue_size).toBe(25);
      expect(event.payload.cram_mode).toBe(true);
      expect(event.schema_version).toBe("1.0");
    });

    it("should default cramMode to false if not provided", () => {
      const event = createSessionStartedEvent({
        userId: "user_123",
        libraryId: "lib_abc",
        sessionId: "session_0001",
      });

      expect(event.payload.cram_mode).toBe(false);
    });

    it("should create event that passes validation", () => {
      const event = createSessionStartedEvent({
        userId: "user_123",
        libraryId: "lib_abc",
        sessionId: "session_0001",
        plannedLoad: 50,
      });

      expect(() => validateEventBeforeEnqueue(event)).not.toThrow();
    });
  });
});

