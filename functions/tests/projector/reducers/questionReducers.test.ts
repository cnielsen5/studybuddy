/**
 * Question Reducer Tests
 * 
 * Tests for pure reducer functions:
 * - Idempotency
 * - Monotonic constraints
 * - Deterministic behavior
 */

import {
  reduceQuestionPerformance,
  shouldApplyQuestionEvent,
  QuestionPerformanceView,
} from "../../../src/projector/reducers/questionReducers";
import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";

const validQuestionAttemptedEvent = {
  ...validUserEvent,
  type: "question_attempted",
  entity: { kind: "question", id: "q_0001" },
  payload: {
    selected_option_id: "opt_B",
    correct: true,
    seconds_spent: 35,
  },
} as const;

describe("Question Reducers", () => {
  describe("reduceQuestionPerformance", () => {
    it("should create new performance view for new question", () => {
      const result = reduceQuestionPerformance(undefined, validQuestionAttemptedEvent);

      expect(result.type).toBe("question_performance_view");
      expect(result.question_id).toBe(validQuestionAttemptedEvent.entity.id);
      expect(result.total_attempts).toBe(1);
      expect(result.correct_attempts).toBe(1);
      expect(result.accuracy_rate).toBe(1.0);
    });

    it("should respect monotonic constraints (no negative values)", () => {
      const prev: QuestionPerformanceView = {
        type: "question_performance_view",
        question_id: "q_0001",
        library_id: "lib_abc",
        user_id: "user_123",
        total_attempts: 0,
        correct_attempts: 0,
        accuracy_rate: 0,
        avg_seconds: 0,
        streak: 0,
        max_streak: 0,
        last_attempted_at: "2025-12-29T12:00:00.000Z",
        last_applied: {
          received_at: "2025-12-29T12:00:00.000Z",
          event_id: "evt_prev",
        },
        updated_at: "2025-12-29T12:00:00.000Z",
      };

      const result = reduceQuestionPerformance(prev, validQuestionAttemptedEvent);

      expect(result.total_attempts).toBeGreaterThanOrEqual(0);
      expect(result.correct_attempts).toBeGreaterThanOrEqual(0);
      expect(result.accuracy_rate).toBeGreaterThanOrEqual(0);
      expect(result.accuracy_rate).toBeLessThanOrEqual(1);
      expect(result.avg_seconds).toBeGreaterThanOrEqual(0);
      expect(result.streak).toBeGreaterThanOrEqual(0);
      expect(result.max_streak).toBeGreaterThanOrEqual(0);
    });

    it("should increment total_attempts monotonically", () => {
      let current: QuestionPerformanceView | undefined = undefined;

      for (let i = 0; i < 5; i++) {
        const event = {
          ...validQuestionAttemptedEvent,
          payload: { selected_option_id: "opt_A", correct: true, seconds_spent: 20 },
        };
        current = reduceQuestionPerformance(current, event);
        expect(current.total_attempts).toBe(i + 1);
      }
    });

    it("should update accuracy rate correctly", () => {
      let current: QuestionPerformanceView | undefined = undefined;

      // Correct attempt
      current = reduceQuestionPerformance(current, validQuestionAttemptedEvent);
      expect(current.accuracy_rate).toBe(1.0);

      // Incorrect attempt
      const incorrectEvent = {
        ...validQuestionAttemptedEvent,
        payload: { selected_option_id: "opt_A", correct: false, seconds_spent: 30 },
      };
      current = reduceQuestionPerformance(current, incorrectEvent);
      expect(current.accuracy_rate).toBe(0.5); // 1/2 = 50%
    });

    it("should update streak correctly", () => {
      let current: QuestionPerformanceView | undefined = undefined;

      // Correct attempts build streak
      for (let i = 0; i < 3; i++) {
        current = reduceQuestionPerformance(current, validQuestionAttemptedEvent);
        expect(current.streak).toBe(i + 1);
      }

      // Incorrect resets streak
      const incorrectEvent = {
        ...validQuestionAttemptedEvent,
        payload: { selected_option_id: "opt_A", correct: false, seconds_spent: 30 },
      };
      current = reduceQuestionPerformance(current, incorrectEvent);
      expect(current.streak).toBe(0);
      expect(current.max_streak).toBe(3); // Max streak preserved
    });
  });

  describe("shouldApplyQuestionEvent", () => {
    it("should return true for new view", () => {
      const result = shouldApplyQuestionEvent(undefined, validQuestionAttemptedEvent);
      expect(result).toBe(true);
    });

    it("should return false for idempotent event", () => {
      const prev: QuestionPerformanceView = {
        type: "question_performance_view",
        question_id: "q_0001",
        library_id: "lib_abc",
        user_id: "user_123",
        total_attempts: 1,
        correct_attempts: 1,
        accuracy_rate: 1.0,
        avg_seconds: 35,
        streak: 1,
        max_streak: 1,
        last_attempted_at: "2025-12-29T12:00:00.000Z",
        last_applied: {
          received_at: validQuestionAttemptedEvent.received_at,
          event_id: validQuestionAttemptedEvent.event_id,
        },
        updated_at: "2025-12-29T12:00:00.000Z",
      };

      const result = shouldApplyQuestionEvent(prev, validQuestionAttemptedEvent);
      expect(result).toBe(false);
    });
  });
});

