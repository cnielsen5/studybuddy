import {
  cardStage,
  deriveConceptMetrics,
  deriveConceptState,
  elapsedDaysSince,
  meetsRobustCertification,
  type ConceptLike,
  type QuestionPerformanceLike,
  type StudyCardLike,
} from "../../../src/core/concept/deriveConceptMetrics";
import { calculateRetention, elapsedDaysSince as elapsedFromScheduler } from "../../../src/core/scheduler/retrievability";

const CONCEPT: ConceptLike = {
  id: "concept_test",
  mastery_config: { threshold: 0.8, min_questions_correct: 2 },
  linked_content: { question_ids: ["q_01", "q_02", "q_03"] },
};

const CARDS: StudyCardLike[] = [
  { id: "card_a", conceptId: "concept_test", cardTier: "core" },
  { id: "card_b", conceptId: "concept_test", cardTier: "core" },
  { id: "card_c", conceptId: "concept_test", cardTier: "extension" },
];

function sched(
  cardId: string,
  state: number,
  stability: number,
  lastReviewed = "2026-06-01T12:00:00Z"
): CardScheduleLike {
  return {
    card_id: cardId,
    state,
    stability,
    last_reviewed_at: lastReviewed,
  };
}

describe("deriveConceptMetrics", () => {
  it("returns unintroduced when no cards have been reviewed", () => {
    const m = deriveConceptMetrics(CONCEPT, CARDS, []);
    expect(m.conceptState).toBe("unintroduced");
    expect(m.retentionScore).toBe(0);
    expect(m.stageCounts.new).toBe(3);
  });

  it("returns fragile when only one card has been seen", () => {
    const m = deriveConceptMetrics(CONCEPT, CARDS, [sched("card_a", 1, 3)]);
    expect(m.conceptState).toBe("forming");
    expect(m.stageCounts.learning).toBe(1);
    expect(m.stageCounts.new).toBe(2);
  });

  it("returns stable when core cards meet mastery threshold in review", () => {
    const schedules = [
      sched("card_a", 2, 30),
      sched("card_b", 2, 25),
      sched("card_c", 1, 4),
    ];
    const m = deriveConceptMetrics(CONCEPT, CARDS, schedules);
    expect(m.conceptState).toBe("stable");
  });

  it("returns robust when core cards mastered and certification questions pass", () => {
    const schedules = [
      sched("card_a", 2, 95),
      sched("card_b", 2, 120),
      sched("card_c", 2, 40),
    ];
    const performances: QuestionPerformanceLike[] = [
      { question_id: "q_01", correct_attempts: 2, total_attempts: 2, accuracy_rate: 1 },
      { question_id: "q_02", correct_attempts: 1, total_attempts: 1, accuracy_rate: 1 },
    ];
    const m = deriveConceptMetrics(CONCEPT, CARDS, schedules, performances);
    expect(m.conceptState).toBe("robust");
    expect(meetsRobustCertification(CONCEPT, CARDS, new Map(schedules.map((s) => [s.card_id, s])), new Map(performances.map((p) => [p.question_id, p])))).toBe(true);
  });

  it("stays stable not robust when questions below min_questions_correct", () => {
    const schedules = [
      sched("card_a", 2, 95),
      sched("card_b", 2, 120),
    ];
    const performances: QuestionPerformanceLike[] = [
      { question_id: "q_01", correct_attempts: 1, total_attempts: 1, accuracy_rate: 1 },
    ];
    const state = deriveConceptState(
      CONCEPT,
      CARDS,
      new Map(schedules.map((s) => [s.card_id, s])),
      new Map(performances.map((p) => [p.question_id, p]))
    );
    expect(state).toBe("stable");
  });

  it("classifies card stages from stability thresholds", () => {
    expect(cardStage(undefined)).toBe("new");
    expect(cardStage(sched("x", 1, 5))).toBe("learning");
    expect(cardStage(sched("x", 2, 10))).toBe("review");
    expect(cardStage(sched("x", 2, 95))).toBe("mastered");
  });

  it("computes retention score from retrievability", () => {
    const now = new Date("2026-06-10T12:00:00Z");
    const m = deriveConceptMetrics(
      CONCEPT,
      CARDS,
      [sched("card_a", 2, 45, "2026-06-08T12:00:00Z")],
      [],
      now
    );
    expect(m.retentionScore).toBeGreaterThan(0);
    expect(m.retentionScore).toBeLessThanOrEqual(1);
    const elapsed = elapsedFromScheduler("2026-06-08T12:00:00Z", now);
    expect(calculateRetention(45, elapsed)).toBeGreaterThan(0);
  });
});
