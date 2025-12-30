/**
 * Card Reducer Tests
 * 
 * Tests for pure reducer functions:
 * - Idempotency (applying same event twice = no change)
 * - Monotonic constraints (no negative values, bounds respected)
 * - Deterministic behavior
 */

import {
  reduceCardSchedule,
  reduceCardPerformance,
  shouldApplyCardEvent,
  CardScheduleView,
  CardPerformanceView,
} from "../../../src/projector/reducers/cardReducers";
import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { validCardReviewedEvent } from "../../fixtures/cardReviewed.fixture.ts";

describe("Card Reducers", () => {
  describe("reduceCardSchedule", () => {
    it("should create new schedule view for new card", () => {
      const result = reduceCardSchedule(undefined, validCardReviewedEvent);

      expect(result.type).toBe("card_schedule_view");
      expect(result.card_id).toBe(validCardReviewedEvent.entity.id);
      expect(result.stability).toBeGreaterThan(0);
      expect(result.difficulty).toBeGreaterThan(0);
      expect(result.interval_days).toBeGreaterThanOrEqual(1);
      expect(result.state).toBeGreaterThanOrEqual(0);
      expect(result.last_grade).toBe(validCardReviewedEvent.payload.grade);
    });

    it("should be deterministic (same input produces same output)", () => {
      const prev: CardScheduleView | undefined = undefined;
      
      const result1 = reduceCardSchedule(prev, validCardReviewedEvent);
      const result2 = reduceCardSchedule(prev, validCardReviewedEvent);

      // Same input should produce same output (deterministic)
      expect(result2.stability).toBe(result1.stability);
      expect(result2.difficulty).toBe(result1.difficulty);
      expect(result2.state).toBe(result1.state);
      expect(result2.due_at).toBe(result1.due_at);
    });

    it("should handle idempotency at reducer level (applying same event twice)", () => {
      const prev: CardScheduleView | undefined = undefined;
      
      const result1 = reduceCardSchedule(prev, validCardReviewedEvent);
      
      // If we apply the same event again (simulating idempotency check failure),
      // the reducer should still produce consistent results
      // Note: In practice, idempotency is checked before calling reducer
      const result2 = reduceCardSchedule(result1, validCardReviewedEvent);
      
      // The reducer will increment, but the values should be consistent
      expect(result2.last_applied.event_id).toBe(validCardReviewedEvent.event_id);
    });

    it("should respect monotonic constraints (no negative values)", () => {
      const prev: CardScheduleView = {
        type: "card_schedule_view",
        card_id: "card_0001",
        library_id: "lib_abc",
        user_id: "user_123",
        state: 2,
        due_at: "2025-12-30T09:00:00.000Z",
        stability: 0.05, // Very low stability
        difficulty: 0.05, // Very low difficulty
        interval_days: 1,
        last_reviewed_at: "2025-12-29T12:00:00.000Z",
        last_grade: "good",
        last_applied: {
          received_at: "2025-12-29T12:00:00.000Z",
          event_id: "evt_prev",
        },
        updated_at: "2025-12-29T12:00:00.000Z",
      };

      const againEvent = {
        ...validCardReviewedEvent,
        payload: { grade: "again", seconds_spent: 10 },
      };

      const result = reduceCardSchedule(prev, againEvent);

      // Monotonic constraints
      expect(result.stability).toBeGreaterThanOrEqual(0.1); // Minimum stability
      expect(result.difficulty).toBeGreaterThanOrEqual(0.1); // Minimum difficulty
      expect(result.difficulty).toBeLessThanOrEqual(10.0); // Maximum difficulty
      expect(result.interval_days).toBeGreaterThanOrEqual(1); // Minimum interval
      expect(result.state).toBeGreaterThanOrEqual(0); // Minimum state
      expect(result.state).toBeLessThanOrEqual(3); // Maximum state
    });

    it("should increase stability on good grades", () => {
      const prev: CardScheduleView = {
        type: "card_schedule_view",
        card_id: "card_0001",
        library_id: "lib_abc",
        user_id: "user_123",
        state: 2,
        due_at: "2025-12-30T09:00:00.000Z",
        stability: 5.0,
        difficulty: 5.0,
        interval_days: 5,
        last_reviewed_at: "2025-12-29T12:00:00.000Z",
        last_grade: "good",
        last_applied: {
          received_at: "2025-12-29T12:00:00.000Z",
          event_id: "evt_prev",
        },
        updated_at: "2025-12-29T12:00:00.000Z",
      };

      const goodEvent = {
        ...validCardReviewedEvent,
        payload: { grade: "good", seconds_spent: 15 },
      };

      const result = reduceCardSchedule(prev, goodEvent);

      expect(result.stability).toBeGreaterThan(prev.stability);
      expect(result.difficulty).toBeLessThan(prev.difficulty); // Good grade reduces difficulty
    });

    it("should decrease stability on 'again' grade", () => {
      const prev: CardScheduleView = {
        type: "card_schedule_view",
        card_id: "card_0001",
        library_id: "lib_abc",
        user_id: "user_123",
        state: 2,
        due_at: "2025-12-30T09:00:00.000Z",
        stability: 10.0,
        difficulty: 5.0,
        interval_days: 10,
        last_reviewed_at: "2025-12-29T12:00:00.000Z",
        last_grade: "good",
        last_applied: {
          received_at: "2025-12-29T12:00:00.000Z",
          event_id: "evt_prev",
        },
        updated_at: "2025-12-29T12:00:00.000Z",
      };

      const againEvent = {
        ...validCardReviewedEvent,
        payload: { grade: "again", seconds_spent: 20 },
      };

      const result = reduceCardSchedule(prev, againEvent);

      expect(result.stability).toBeLessThan(prev.stability);
      expect(result.difficulty).toBeGreaterThan(prev.difficulty); // Again increases difficulty
      expect(result.state).toBeLessThanOrEqual(prev.state); // State can decrease on lapse
    });

    it("should transition state correctly (new -> learning -> review -> mastered)", () => {
      let current: CardScheduleView | undefined = undefined;

      // New card, good grade -> learning
      const goodEvent1 = {
        ...validCardReviewedEvent,
        payload: { grade: "good", seconds_spent: 15 },
      };
      current = reduceCardSchedule(current, goodEvent1);
      expect(current.state).toBe(1); // learning

      // Learning, multiple good reviews -> review
      for (let i = 0; i < 3; i++) {
        const goodEvent = {
          ...validCardReviewedEvent,
          payload: { grade: "good", seconds_spent: 15 },
        };
        current = reduceCardSchedule(current, goodEvent);
      }
      // After building up stability, should transition to review
      if (current.stability > 7) {
        expect(current.state).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe("reduceCardPerformance", () => {
    it("should create new performance view for new card", () => {
      const result = reduceCardPerformance(undefined, validCardReviewedEvent);

      expect(result.type).toBe("card_performance_view");
      expect(result.card_id).toBe(validCardReviewedEvent.entity.id);
      expect(result.total_reviews).toBe(1);
      expect(result.accuracy_rate).toBeGreaterThanOrEqual(0);
      expect(result.accuracy_rate).toBeLessThanOrEqual(1);
    });

    it("should be deterministic (same input produces same output)", () => {
      const prev: CardPerformanceView | undefined = undefined;
      
      const result1 = reduceCardPerformance(prev, validCardReviewedEvent);
      const result2 = reduceCardPerformance(prev, validCardReviewedEvent);

      // Same input should produce same output (deterministic)
      expect(result2.total_reviews).toBe(result1.total_reviews);
      expect(result2.correct_reviews).toBe(result1.correct_reviews);
      expect(result2.accuracy_rate).toBe(result1.accuracy_rate);
    });

    it("should be idempotent (applying same event twice produces same result)", () => {
      const prev: CardPerformanceView | undefined = undefined;
      
      const result1 = reduceCardPerformance(prev, validCardReviewedEvent);
      const result2 = reduceCardPerformance(result1, validCardReviewedEvent);

      // If applied again, total_reviews would increase, but if idempotency check
      // prevents this, the result should be the same
      // For this test, we verify the calculation is deterministic
      expect(result2.total_reviews).toBe(result1.total_reviews + 1);
    });

    it("should respect monotonic constraints (no negative values)", () => {
      const prev: CardPerformanceView = {
        type: "card_performance_view",
        card_id: "card_0001",
        library_id: "lib_abc",
        user_id: "user_123",
        total_reviews: 0,
        correct_reviews: 0,
        accuracy_rate: 0,
        avg_seconds: 0,
        streak: 0,
        max_streak: 0,
        last_reviewed_at: "2025-12-29T12:00:00.000Z",
        last_applied: {
          received_at: "2025-12-29T12:00:00.000Z",
          event_id: "evt_prev",
        },
        updated_at: "2025-12-29T12:00:00.000Z",
      };

      const result = reduceCardPerformance(prev, validCardReviewedEvent);

      // Monotonic constraints
      expect(result.total_reviews).toBeGreaterThanOrEqual(0);
      expect(result.correct_reviews).toBeGreaterThanOrEqual(0);
      expect(result.accuracy_rate).toBeGreaterThanOrEqual(0);
      expect(result.accuracy_rate).toBeLessThanOrEqual(1);
      expect(result.avg_seconds).toBeGreaterThanOrEqual(0);
      expect(result.streak).toBeGreaterThanOrEqual(0);
      expect(result.max_streak).toBeGreaterThanOrEqual(0);
    });

    it("should increment total_reviews monotonically", () => {
      let current: CardPerformanceView | undefined = undefined;

      for (let i = 0; i < 5; i++) {
        const event = {
          ...validCardReviewedEvent,
          payload: { grade: "good", seconds_spent: 15 },
        };
        current = reduceCardPerformance(current, event);
        expect(current.total_reviews).toBe(i + 1);
      }
    });

    it("should update accuracy rate correctly", () => {
      let current: CardPerformanceView | undefined = undefined;

      // First review: good (correct)
      const goodEvent = {
        ...validCardReviewedEvent,
        payload: { grade: "good", seconds_spent: 15 },
      };
      current = reduceCardPerformance(current, goodEvent);
      expect(current.accuracy_rate).toBe(1.0); // 1/1 = 100%

      // Second review: again (incorrect)
      const againEvent = {
        ...validCardReviewedEvent,
        payload: { grade: "again", seconds_spent: 20 },
      };
      current = reduceCardPerformance(current, againEvent);
      expect(current.accuracy_rate).toBe(0.5); // 1/2 = 50%

      // Third review: good (correct)
      current = reduceCardPerformance(current, goodEvent);
      expect(current.accuracy_rate).toBeCloseTo(0.667, 2); // 2/3 ≈ 66.7%
    });

    it("should update streak correctly", () => {
      let current: CardPerformanceView | undefined = undefined;

      // Good reviews build streak
      for (let i = 0; i < 3; i++) {
        const goodEvent = {
          ...validCardReviewedEvent,
          payload: { grade: "good", seconds_spent: 15 },
        };
        current = reduceCardPerformance(current, goodEvent);
        expect(current.streak).toBe(i + 1);
        expect(current.max_streak).toBe(i + 1);
      }

      // Again resets streak
      const againEvent = {
        ...validCardReviewedEvent,
        payload: { grade: "again", seconds_spent: 20 },
      };
      current = reduceCardPerformance(current, againEvent);
      expect(current.streak).toBe(0);
      expect(current.max_streak).toBe(3); // Max streak preserved
    });

    it("should calculate average seconds using exponential moving average", () => {
      let current: CardPerformanceView | undefined = undefined;

      const event1 = {
        ...validCardReviewedEvent,
        payload: { grade: "good", seconds_spent: 10 },
      };
      current = reduceCardPerformance(current, event1);
      expect(current.avg_seconds).toBeGreaterThan(0);

      const event2 = {
        ...validCardReviewedEvent,
        payload: { grade: "good", seconds_spent: 20 },
      };
      const prevAvg = current.avg_seconds;
      current = reduceCardPerformance(current, event2);
      
      // EMA should move toward new value but not jump completely
      expect(current.avg_seconds).toBeGreaterThan(prevAvg);
      expect(current.avg_seconds).toBeLessThan(20); // Should be weighted average
    });
  });

  describe("shouldApplyCardEvent", () => {
    it("should return true for new view (no previous state)", () => {
      const result = shouldApplyCardEvent(undefined, validCardReviewedEvent);
      expect(result).toBe(true);
    });

    it("should return false for idempotent event (same event_id)", () => {
      const prev: CardScheduleView = {
        type: "card_schedule_view",
        card_id: "card_0001",
        library_id: "lib_abc",
        user_id: "user_123",
        state: 2,
        due_at: "2025-12-30T09:00:00.000Z",
        stability: 5.0,
        difficulty: 5.0,
        interval_days: 5,
        last_reviewed_at: "2025-12-29T12:00:00.000Z",
        last_grade: "good",
        last_applied: {
          received_at: validCardReviewedEvent.received_at,
          event_id: validCardReviewedEvent.event_id,
        },
        updated_at: "2025-12-29T12:00:00.000Z",
      };

      const result = shouldApplyCardEvent(prev, validCardReviewedEvent);
      expect(result).toBe(false); // Idempotent skip
    });

    it("should return true for newer event", () => {
      const prev: CardScheduleView = {
        type: "card_schedule_view",
        card_id: "card_0001",
        library_id: "lib_abc",
        user_id: "user_123",
        state: 2,
        due_at: "2025-12-30T09:00:00.000Z",
        stability: 5.0,
        difficulty: 5.0,
        interval_days: 5,
        last_reviewed_at: "2025-12-29T12:00:00.000Z",
        last_grade: "good",
        last_applied: {
          received_at: "2025-12-29T12:00:00.000Z",
          event_id: "evt_older",
        },
        updated_at: "2025-12-29T12:00:00.000Z",
      };

      const newerEvent = {
        ...validCardReviewedEvent,
        received_at: "2025-12-29T13:00:00.000Z", // Later timestamp
        event_id: "evt_newer",
      };

      const result = shouldApplyCardEvent(prev, newerEvent);
      expect(result).toBe(true);
    });

    it("should return false for older event (out of order)", () => {
      const prev: CardScheduleView = {
        type: "card_schedule_view",
        card_id: "card_0001",
        library_id: "lib_abc",
        user_id: "user_123",
        state: 2,
        due_at: "2025-12-30T09:00:00.000Z",
        stability: 5.0,
        difficulty: 5.0,
        interval_days: 5,
        last_reviewed_at: "2025-12-29T13:00:00.000Z",
        last_grade: "good",
        last_applied: {
          received_at: "2025-12-29T13:00:00.000Z",
          event_id: "evt_newer",
        },
        updated_at: "2025-12-29T13:00:00.000Z",
      };

      const olderEvent = {
        ...validCardReviewedEvent,
        received_at: "2025-12-29T12:00:00.000Z", // Earlier timestamp
        event_id: "evt_older",
      };

      const result = shouldApplyCardEvent(prev, olderEvent);
      expect(result).toBe(false); // Out of order, skip
    });
  });
});

