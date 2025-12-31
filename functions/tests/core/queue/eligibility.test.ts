/**
 * Eligibility Tests
 */

import {
  checkEligibility,
  isDue,
  isNew,
  isLearning,
  isReview,
  CardScheduleView,
  EligibilityOptions,
} from "../../../src/core/queue/eligibility";
import { CardState } from "../../../src/domain/enums";
import { PrimaryReason } from "../../../src/domain/enums";

describe("Eligibility", () => {
  const createSchedule = (
    overrides: Partial<CardScheduleView> = {}
  ): CardScheduleView => ({
    card_id: "card_001",
    state: CardState.NEW,
    due_at: new Date().toISOString(),
    stability: 1.0,
    difficulty: 5.0,
    interval_days: 1,
    last_reviewed_at: new Date().toISOString(),
    ...overrides,
  });

  describe("checkEligibility", () => {
    it("should mark new cards as eligible", () => {
      const schedule = createSchedule({ state: CardState.NEW });
      const result = checkEligibility(schedule);

      expect(result.eligible).toBe(true);
      expect(result.reason).toBe(PrimaryReason.NEW_CARD);
      expect(result.context?.isNew).toBe(true);
    });

    it("should mark due cards as eligible", () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - 1); // Yesterday
      const schedule = createSchedule({
        state: CardState.REVIEW,
        due_at: dueDate.toISOString(),
      });
      const result = checkEligibility(schedule);

      expect(result.eligible).toBe(true);
      expect(result.reason).toBe(PrimaryReason.DUE);
      expect(result.context?.isOverdue).toBe(true);
    });

    it("should exclude cards when state is not included", () => {
      const schedule = createSchedule({ state: CardState.REVIEW });
      const options: EligibilityOptions = {
        currentTime: new Date().toISOString(),
        includeNew: true,
        includeLearning: true,
        includeReview: false, // Exclude review
        includeRelearning: true,
      };
      const result = checkEligibility(schedule, options);

      expect(result.eligible).toBe(false);
    });

    it("should respect maxOverdueDays", () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - 35); // 35 days ago
      const schedule = createSchedule({
        state: CardState.REVIEW,
        due_at: dueDate.toISOString(),
      });
      const options: EligibilityOptions = {
        currentTime: new Date().toISOString(),
        includeNew: true,
        includeLearning: true,
        includeReview: true,
        includeRelearning: true,
        maxOverdueDays: 30, // Max 30 days
      };
      const result = checkEligibility(schedule, options);

      expect(result.eligible).toBe(false);
    });
  });

  describe("isDue", () => {
    it("should return true for overdue cards", () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - 1);
      const schedule = createSchedule({ due_at: dueDate.toISOString() });
      expect(isDue(schedule)).toBe(true);
    });

    it("should return true for cards due today", () => {
      const schedule = createSchedule({ due_at: new Date().toISOString() });
      expect(isDue(schedule)).toBe(true);
    });

    it("should return false for future cards", () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      const schedule = createSchedule({ due_at: dueDate.toISOString() });
      expect(isDue(schedule)).toBe(false);
    });
  });

  describe("isNew", () => {
    it("should return true for NEW state", () => {
      const schedule = createSchedule({ state: CardState.NEW });
      expect(isNew(schedule)).toBe(true);
    });

    it("should return false for other states", () => {
      const schedule = createSchedule({ state: CardState.REVIEW });
      expect(isNew(schedule)).toBe(false);
    });
  });

  describe("isLearning", () => {
    it("should return true for LEARNING state", () => {
      const schedule = createSchedule({ state: CardState.LEARNING });
      expect(isLearning(schedule)).toBe(true);
    });

    it("should return true for RELEARNING state", () => {
      const schedule = createSchedule({ state: CardState.RELEARNING });
      expect(isLearning(schedule)).toBe(true);
    });

    it("should return false for REVIEW state", () => {
      const schedule = createSchedule({ state: CardState.REVIEW });
      expect(isLearning(schedule)).toBe(false);
    });
  });

  describe("isReview", () => {
    it("should return true for REVIEW state", () => {
      const schedule = createSchedule({ state: CardState.REVIEW });
      expect(isReview(schedule)).toBe(true);
    });

    it("should return false for other states", () => {
      const schedule = createSchedule({ state: CardState.NEW });
      expect(isReview(schedule)).toBe(false);
    });
  });
});

