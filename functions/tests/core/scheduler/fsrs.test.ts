/**
 * FSRS Scheduler Tests
 */

import {
  calculateNextSchedule,
  calculateRetention,
  calculateOptimalInterval,
  initializeCardSchedule,
  DEFAULT_FSRS_PARAMS,
  CardScheduleInput,
  ReviewGrade,
} from "../../../src/core/scheduler/fsrs";
import { CardState } from "../../../src/domain/enums";

describe("FSRS Scheduler", () => {
  describe("calculateNextSchedule", () => {
    it("should initialize new card schedule", () => {
      const input: CardScheduleInput = {
        stability: 1.0,
        difficulty: 5.0,
        state: CardState.NEW,
        reps: 0,
        lapses: 0,
        lastReviewAt: new Date().toISOString(),
        currentTime: new Date().toISOString(),
      };

      const result = calculateNextSchedule(input, "good");

      expect(result.stability).toBeGreaterThan(input.stability);
      expect(result.state).toBe(CardState.LEARNING);
      expect(result.reps).toBe(1);
      expect(result.lapses).toBe(0);
    });

    it("should handle 'again' grade (lapse)", () => {
      const input: CardScheduleInput = {
        stability: 10.0,
        difficulty: 5.0,
        state: CardState.REVIEW,
        reps: 5,
        lapses: 0,
        lastReviewAt: new Date().toISOString(),
        currentTime: new Date().toISOString(),
      };

      const result = calculateNextSchedule(input, "again");

      expect(result.stability).toBeLessThan(input.stability);
      expect(result.difficulty).toBeGreaterThan(input.difficulty);
      expect(result.state).toBe(CardState.RELEARNING);
      expect(result.lapses).toBe(1);
    });

    it("should increase stability on 'good' grade", () => {
      const input: CardScheduleInput = {
        stability: 5.0,
        difficulty: 5.0,
        state: CardState.REVIEW,
        reps: 3,
        lapses: 0,
        lastReviewAt: new Date().toISOString(),
        currentTime: new Date().toISOString(),
      };

      const result = calculateNextSchedule(input, "good");

      expect(result.stability).toBeGreaterThan(input.stability);
      expect(result.difficulty).toBeLessThan(input.difficulty);
    });

    it("should transition from LEARNING to REVIEW when stability is high", () => {
      const input: CardScheduleInput = {
        stability: 6.0,
        difficulty: 5.0,
        state: CardState.LEARNING,
        reps: 2,
        lapses: 0,
        lastReviewAt: new Date().toISOString(),
        currentTime: new Date().toISOString(),
      };

      const result = calculateNextSchedule(input, "good");

      expect(result.state).toBe(CardState.REVIEW);
    });

    it("should use shorter intervals for LEARNING state", () => {
      const input: CardScheduleInput = {
        stability: 3.0,
        difficulty: 5.0,
        state: CardState.LEARNING,
        reps: 1,
        lapses: 0,
        lastReviewAt: new Date().toISOString(),
        currentTime: new Date().toISOString(),
      };

      const result = calculateNextSchedule(input, "good");

      expect(result.intervalDays).toBeGreaterThanOrEqual(1);
      expect(result.intervalDays).toBeLessThanOrEqual(4);
    });

    it("should respect stability bounds", () => {
      const input: CardScheduleInput = {
        stability: 1000.0, // Way above max
        difficulty: 5.0,
        state: CardState.REVIEW,
        reps: 10,
        lapses: 0,
        lastReviewAt: new Date().toISOString(),
        currentTime: new Date().toISOString(),
      };

      const result = calculateNextSchedule(input, "easy");

      expect(result.stability).toBeLessThanOrEqual(DEFAULT_FSRS_PARAMS.maxStability);
    });
  });

  describe("calculateRetention", () => {
    it("should return 1.0 for elapsedDays = 0", () => {
      const retention = calculateRetention(10.0, 0);
      expect(retention).toBe(1.0);
    });

    it("should decrease retention as elapsed days increase", () => {
      const stability = 10.0;
      const retention1 = calculateRetention(stability, 1);
      const retention5 = calculateRetention(stability, 5);
      const retention10 = calculateRetention(stability, 10);

      expect(retention1).toBeGreaterThan(retention5);
      expect(retention5).toBeGreaterThan(retention10);
    });

    it("should return values between 0 and 1", () => {
      const retention = calculateRetention(10.0, 100);
      expect(retention).toBeGreaterThanOrEqual(0);
      expect(retention).toBeLessThanOrEqual(1);
    });
  });

  describe("calculateOptimalInterval", () => {
    it("should calculate interval for target retention", () => {
      const stability = 10.0;
      const interval = calculateOptimalInterval(stability, 0.9);

      expect(interval).toBeGreaterThan(0);
      expect(interval).toBeLessThanOrEqual(stability);
    });

    it("should throw error for invalid target retention", () => {
      expect(() => calculateOptimalInterval(10.0, 1.5)).toThrow();
      expect(() => calculateOptimalInterval(10.0, -0.1)).toThrow();
    });

    it("should return at least 1 day", () => {
      const interval = calculateOptimalInterval(0.1, 0.9);
      expect(interval).toBeGreaterThanOrEqual(1);
    });
  });

  describe("initializeCardSchedule", () => {
    it("should initialize with default parameters", () => {
      const schedule = initializeCardSchedule();

      expect(schedule.stability).toBe(DEFAULT_FSRS_PARAMS.initialStability);
      expect(schedule.difficulty).toBe(DEFAULT_FSRS_PARAMS.initialDifficulty);
      expect(schedule.state).toBe(CardState.NEW);
      expect(schedule.reps).toBe(0);
      expect(schedule.lapses).toBe(0);
    });
  });
});

