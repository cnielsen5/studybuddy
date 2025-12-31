/**
 * Explainability Tests
 */

import {
  explainQueueItem,
  explainQueue,
  explainQueueSummary,
  explainPriority,
  QueueItem,
} from "../../../src/core/queue/explainability";
import { CardScheduleView } from "../../../src/core/queue/eligibility";
import { EligibilityResult } from "../../../src/core/queue/eligibility";
import { CardState } from "../../../src/domain/enums";
import { PrimaryReason } from "../../../src/domain/enums";

describe("Explainability", () => {
  const createQueueItem = (
    overrides: Partial<QueueItem> = {}
  ): QueueItem => {
    const schedule: CardScheduleView = {
      card_id: "card_001",
      state: CardState.NEW,
      due_at: new Date().toISOString(),
      stability: 1.0,
      difficulty: 5.0,
      interval_days: 1,
      last_reviewed_at: new Date().toISOString(),
      ...overrides.schedule,
    };

    const eligibility: EligibilityResult = {
      eligible: true,
      reason: PrimaryReason.NEW_CARD,
      context: {
        isNew: true,
        daysUntilDue: 0,
      },
      ...overrides.eligibility,
    };

    return {
      card_id: "card_001",
      schedule,
      eligibility,
      priority: 100,
      position: 1,
      ...overrides,
    };
  };

  describe("explainQueueItem", () => {
    it("should explain new cards", () => {
      const item = createQueueItem();
      const explanation = explainQueueItem(item);

      expect(explanation.reason).toBe(PrimaryReason.NEW_CARD);
      expect(explanation.explanation).toContain("new card");
    });

    it("should explain overdue cards", () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - 5);
      const item = createQueueItem({
        schedule: {
          card_id: "card_001",
          state: CardState.REVIEW,
          due_at: dueDate.toISOString(),
          stability: 10.0,
          difficulty: 5.0,
          interval_days: 10,
          last_reviewed_at: new Date().toISOString(),
        },
        eligibility: {
          eligible: true,
          reason: PrimaryReason.DUE,
          context: {
            isOverdue: true,
            daysUntilDue: -5,
          },
        },
      });

      const explanation = explainQueueItem(item);

      expect(explanation.explanation).toContain("overdue");
      expect(explanation.explanation).toContain("5 day");
    });

    it("should explain difficult cards", () => {
      const item = createQueueItem({
        schedule: {
          card_id: "card_001",
          state: CardState.REVIEW,
          due_at: new Date().toISOString(),
          stability: 10.0,
          difficulty: 8.5, // High difficulty
          interval_days: 10,
          last_reviewed_at: new Date().toISOString(),
        },
      });

      const explanation = explainQueueItem(item);

      expect(explanation.explanation).toContain("difficult");
    });
  });

  describe("explainQueue", () => {
    it("should explain all items in queue", () => {
      const items = [
        createQueueItem({ card_id: "card_1" }),
        createQueueItem({ card_id: "card_2" }),
      ];

      const explanations = explainQueue(items);

      expect(explanations).toHaveLength(2);
      expect(explanations[0].card_id).toBe("card_1");
      expect(explanations[1].card_id).toBe("card_2");
    });
  });

  describe("explainQueueSummary", () => {
    it("should summarize queue", () => {
      const items = [
        createQueueItem({ card_id: "card_1" }),
        createQueueItem({ card_id: "card_2" }),
      ];

      const summary = explainQueueSummary(items);

      expect(summary).toContain("2 card");
    });

    it("should handle empty queue", () => {
      const summary = explainQueueSummary([]);

      expect(summary).toContain("No cards");
    });
  });

  describe("explainPriority", () => {
    it("should explain priority for new cards", () => {
      const item = createQueueItem();
      const explanation = explainPriority(item);

      expect(explanation).toContain("New cards");
    });

    it("should explain priority for overdue cards", () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - 3);
      const item = createQueueItem({
        schedule: {
          card_id: "card_001",
          state: CardState.REVIEW,
          due_at: dueDate.toISOString(),
          stability: 10.0,
          difficulty: 5.0,
          interval_days: 10,
          last_reviewed_at: new Date().toISOString(),
        },
        eligibility: {
          eligible: true,
          reason: PrimaryReason.DUE,
          context: {
            isOverdue: true,
            daysUntilDue: -3,
          },
        },
      });

      const explanation = explainPriority(item);

      expect(explanation).toContain("Overdue");
    });
  });
});

