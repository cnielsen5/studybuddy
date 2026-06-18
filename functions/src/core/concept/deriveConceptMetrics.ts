import {
  calculateRetention,
  elapsedDaysSince as elapsedDaysFromScheduler,
} from "../scheduler/retrievability";

export type ConceptState =
  | "unintroduced"
  | "fragile"
  | "forming"
  | "stable"
  | "robust";

export type CardStage = "new" | "learning" | "review" | "mastered";

export const CONCEPT_STATE_ORDER: ConceptState[] = [
  "unintroduced",
  "fragile",
  "forming",
  "stable",
  "robust",
];

export const STAGE_REVIEW_STABILITY_DAYS = 7;
export const STAGE_MASTERED_STABILITY_DAYS = 90;

export interface CardScheduleLike {
  card_id: string;
  state: number;
  stability: number;
  last_reviewed_at?: string;
}

export interface StudyCardLike {
  id: string;
  conceptId: string;
  cardTier?: string;
}

export interface QuestionPerformanceLike {
  question_id: string;
  correct_attempts: number;
  total_attempts: number;
  accuracy_rate: number;
}

export interface ConceptMasteryConfig {
  threshold: number;
  min_questions_correct?: number;
}

export interface ConceptLike {
  id: string;
  mastery_config?: ConceptMasteryConfig;
  linked_content?: { question_ids?: string[] };
}

export interface CardStageCounts {
  new: number;
  learning: number;
  review: number;
  mastered: number;
}

export interface ConceptDerivedMetrics {
  conceptState: ConceptState;
  retentionScore: number;
  stageCounts: CardStageCounts;
}

export function elapsedDaysSince(isoDate: string, now: Date = new Date()): number {
  return elapsedDaysFromScheduler(isoDate, now);
}

/** Card stage — organizer §5.3 (simplified on read from schedule snapshot). */
export function cardStage(schedule: CardScheduleLike | undefined): CardStage {
  if (!schedule) return "new";
  if (schedule.state < 2) return "learning";
  if (schedule.stability >= STAGE_MASTERED_STABILITY_DAYS) return "mastered";
  if (schedule.stability >= STAGE_REVIEW_STABILITY_DAYS) return "review";
  return "learning";
}

export function cardRetrievability(
  schedule: CardScheduleLike | undefined,
  now: Date = new Date()
): number {
  if (!schedule?.last_reviewed_at) return 0;
  const elapsed = elapsedDaysSince(schedule.last_reviewed_at, now);
  return calculateRetention(schedule.stability, elapsed);
}

function cardWeight(card: StudyCardLike): number {
  if (card.cardTier === "core") return 1.5;
  if (card.cardTier === "certification") return 1.2;
  if (card.cardTier === "remedial") return 1.1;
  return 1;
}

function scheduleMap(schedules: CardScheduleLike[]): Map<string, CardScheduleLike> {
  return new Map(schedules.map((s) => [s.card_id, s]));
}

function performanceMap(
  performances: QuestionPerformanceLike[]
): Map<string, QuestionPerformanceLike> {
  return new Map(performances.map((p) => [p.question_id, p]));
}

/** Core cards drive certification; fall back to all cards if none tagged core. */
function thresholdCards(conceptCards: StudyCardLike[]): StudyCardLike[] {
  const core = conceptCards.filter((c) => c.cardTier === "core");
  return core.length > 0 ? core : conceptCards;
}

/**
 * Robust ≈ full certification (organizer §11.5 A):
 * - all threshold (core) cards mastered
 * - min_questions_correct linked questions at ≥ threshold accuracy
 */
export function meetsRobustCertification(
  concept: ConceptLike,
  conceptCards: StudyCardLike[],
  schedules: Map<string, CardScheduleLike>,
  performances: Map<string, QuestionPerformanceLike>
): boolean {
  const cards = thresholdCards(conceptCards);
  if (cards.length === 0) return false;

  const allMastered = cards.every((c) => cardStage(schedules.get(c.id)) === "mastered");
  if (!allMastered) return false;

  const threshold = concept.mastery_config?.threshold ?? 0.8;
  const minCorrect = concept.mastery_config?.min_questions_correct ?? 1;
  const questionIds = concept.linked_content?.question_ids ?? [];

  let qualifying = 0;
  for (const qid of questionIds) {
    const perf = performances.get(qid);
    if (!perf || perf.correct_attempts < 1) continue;
    if (perf.accuracy_rate >= threshold) qualifying += 1;
  }

  return qualifying >= minCorrect;
}

export function deriveConceptState(
  concept: ConceptLike,
  conceptCards: StudyCardLike[],
  schedules: Map<string, CardScheduleLike>,
  performances: Map<string, QuestionPerformanceLike>
): ConceptState {
  if (conceptCards.length === 0) return "unintroduced";

  const scheduleByCard = schedules;
  let reviewedCount = 0;
  const stages: CardStageCounts = { new: 0, learning: 0, review: 0, mastered: 0 };

  for (const card of conceptCards) {
    const stage = cardStage(scheduleByCard.get(card.id));
    stages[stage] += 1;
    if (stage !== "new") reviewedCount += 1;
  }

  if (reviewedCount === 0) return "unintroduced";

  if (meetsRobustCertification(concept, conceptCards, schedules, performances)) {
    return "robust";
  }

  const thresholdCards_ = thresholdCards(conceptCards);
  const threshold = concept.mastery_config?.threshold ?? 0.8;
  const masteredCount = thresholdCards_.filter(
    (c) => cardStage(scheduleByCard.get(c.id)) === "mastered"
  ).length;
  const reviewPlusMastered = thresholdCards_.filter((c) => {
    const s = cardStage(scheduleByCard.get(c.id));
    return s === "review" || s === "mastered";
  }).length;

  const masteredFrac = masteredCount / thresholdCards_.length;
  const reviewFrac = reviewPlusMastered / thresholdCards_.length;

  let stabilitySum = 0;
  let stabilityN = 0;
  for (const card of thresholdCards_) {
    const sched = scheduleByCard.get(card.id);
    if (sched && cardStage(sched) !== "new") {
      stabilitySum += sched.stability;
      stabilityN += 1;
    }
  }
  const avgStability = stabilityN > 0 ? stabilitySum / stabilityN : 0;

  if (
    masteredFrac >= threshold ||
    (reviewFrac >= threshold && avgStability >= STAGE_REVIEW_STABILITY_DAYS)
  ) {
    return "stable";
  }

  if (stages.learning > 0 || stages.review > 0 || stages.mastered > 0) return "forming";
  return "fragile";
}

export function deriveConceptMetrics(
  concept: ConceptLike,
  allCards: StudyCardLike[],
  schedules: CardScheduleLike[],
  performances: QuestionPerformanceLike[] = [],
  now: Date = new Date()
): ConceptDerivedMetrics {
  const scheduleByCard = scheduleMap(schedules);
  const perfById = performanceMap(performances);
  const conceptCards = allCards.filter((c) => c.conceptId === concept.id);

  const stageCounts: CardStageCounts = { new: 0, learning: 0, review: 0, mastered: 0 };
  let retentionWeightedSum = 0;
  let retentionWeightTotal = 0;

  for (const card of conceptCards) {
    const schedule = scheduleByCard.get(card.id);
    const stage = cardStage(schedule);
    stageCounts[stage] += 1;

    const w = cardWeight(card);
    retentionWeightedSum += cardRetrievability(schedule, now) * w;
    retentionWeightTotal += w;
  }

  const retentionScore =
    retentionWeightTotal > 0 ? retentionWeightedSum / retentionWeightTotal : 0;

  const conceptState = deriveConceptState(
    concept,
    conceptCards,
    scheduleByCard,
    perfById
  );

  return { conceptState, retentionScore, stageCounts };
}

export function deriveAggregateMetrics(
  conceptIds: string[],
  concepts: ConceptLike[],
  allCards: StudyCardLike[],
  schedules: CardScheduleLike[],
  performances: QuestionPerformanceLike[] = [],
  now?: Date
): ConceptDerivedMetrics {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const metrics = conceptIds
    .map((id) => {
      const concept = byId.get(id);
      if (!concept) return null;
      return deriveConceptMetrics(concept, allCards, schedules, performances, now);
    })
    .filter((m): m is ConceptDerivedMetrics => m !== null);

  if (metrics.length === 0) {
    return {
      conceptState: "unintroduced",
      retentionScore: 0,
      stageCounts: { new: 0, learning: 0, review: 0, mastered: 0 },
    };
  }

  const conceptState = metrics.reduce(
    (weakest, m) =>
      CONCEPT_STATE_ORDER.indexOf(m.conceptState) < CONCEPT_STATE_ORDER.indexOf(weakest)
        ? m.conceptState
        : weakest,
    metrics[0].conceptState
  );

  const stageCounts = metrics.reduce(
    (acc, m) => ({
      new: acc.new + m.stageCounts.new,
      learning: acc.learning + m.stageCounts.learning,
      review: acc.review + m.stageCounts.review,
      mastered: acc.mastered + m.stageCounts.mastered,
    }),
    { new: 0, learning: 0, review: 0, mastered: 0 }
  );

  const retentionScore =
    metrics.reduce((sum, m) => sum + m.retentionScore, 0) / metrics.length;

  return { conceptState, retentionScore, stageCounts };
}

export function formatStageCounts(counts: CardStageCounts): string {
  const parts: string[] = [];
  if (counts.new > 0) parts.push(`${counts.new} new`);
  if (counts.learning > 0) parts.push(`${counts.learning} learning`);
  if (counts.review > 0) parts.push(`${counts.review} review`);
  if (counts.mastered > 0) parts.push(`${counts.mastered} mastered`);
  return parts.length > 0 ? parts.join(" · ") : "no cards";
}
