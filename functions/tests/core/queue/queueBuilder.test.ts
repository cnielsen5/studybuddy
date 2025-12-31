/**
 * Queue Builder Tests
 */

import {
  buildQueue,
  getQueueStats,
  QueueBuilderOptions,
  CardScheduleView,
} from "../../../src/core/queue/queueBuilder";
import { CardState } from "../../../src/domain/enums";

describe("Queue Builder", () => {
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

  describe("buildQueue", () => {
    it("should build queue from eligible cards", () => {
      const schedules = [
        createSchedule({ card_id: "card_001", state: CardState.NEW }),
        createSchedule({ card_id: "card_002", state: CardState.REVIEW }),
      ];

      const queue = buildQueue(schedules);

      expect(queue.length).toBe(2);
      expect(queue[0].card_id).toBeDefined();
      expect(queue[0].priority).toBeDefined();
      expect(queue[0].position).toBe(1);
    });

    it("should respect maxSize", () => {
      const schedules = Array.from({ length: 100 }, (_, i) =>
        createSchedule({ card_id: `card_${i}` })
      );

      const options: QueueBuilderOptions = {
        currentTime: new Date().toISOString(),
        includeNew: true,
        includeLearning: true,
        includeReview: true,
        includeRelearning: true,
        maxSize: 10,
      };

      const queue = buildQueue(schedules, options);

      expect(queue.length).toBe(10);
    });

    it("should prioritize overdue cards", () => {
      const now = new Date();
      const overdue = new Date(now);
      overdue.setDate(overdue.getDate() - 5);
      const future = new Date(now);
      future.setDate(future.getDate() + 5);

      const schedules = [
        createSchedule({
          card_id: "card_future",
          due_at: future.toISOString(),
          state: CardState.REVIEW,
        }),
        createSchedule({
          card_id: "card_overdue",
          due_at: overdue.toISOString(),
          state: CardState.REVIEW,
        }),
      ];

      const options: QueueBuilderOptions = {
        currentTime: now.toISOString(),
        includeNew: true,
        includeLearning: true,
        includeReview: true,
        includeRelearning: true,
        strategy: "due_first",
      };

      const queue = buildQueue(schedules, options);

      expect(queue[0].card_id).toBe("card_overdue");
    });

    it("should balance new and review cards", () => {
      const newCards = Array.from({ length: 20 }, (_, i) =>
        createSchedule({ card_id: `new_${i}`, state: CardState.NEW })
      );
      const reviewCards = Array.from({ length: 20 }, (_, i) =>
        createSchedule({ card_id: `review_${i}`, state: CardState.REVIEW })
      );

      const options: QueueBuilderOptions = {
        currentTime: new Date().toISOString(),
        includeNew: true,
        includeLearning: true,
        includeReview: true,
        includeRelearning: true,
        maxSize: 20,
        balanceNewAndReview: true,
        newCardRatio: 0.3, // 30% new, 70% review
      };

      const queue = buildQueue([...newCards, ...reviewCards], options);

      const stats = getQueueStats(queue);
      expect(stats.new).toBeLessThanOrEqual(7); // ~30% of 20
      expect(stats.review).toBeGreaterThanOrEqual(13); // ~70% of 20
    });
  });

  describe("getQueueStats", () => {
    it("should calculate correct statistics", () => {
      const schedules = [
        createSchedule({ card_id: "card_1", state: CardState.NEW }),
        createSchedule({ card_id: "card_2", state: CardState.LEARNING }),
        createSchedule({ card_id: "card_3", state: CardState.REVIEW }),
        createSchedule({ card_id: "card_4", state: CardState.RELEARNING }),
      ];

      const queue = buildQueue(schedules);
      const stats = getQueueStats(queue);

      expect(stats.total).toBe(4);
      expect(stats.new).toBe(1);
      expect(stats.learning).toBe(1);
      expect(stats.review).toBe(1);
      expect(stats.relearning).toBe(1);
    });

    it("should handle empty queue", () => {
      const stats = getQueueStats([]);

      expect(stats.total).toBe(0);
      expect(stats.new).toBe(0);
      expect(stats.averagePriority).toBe(0);
    });
  });
});

