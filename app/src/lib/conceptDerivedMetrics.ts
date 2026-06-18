import type { CardScheduleView, QuestionPerformanceView } from "./types";
import type { LibraryConcept } from "./libraryTypes";
import {
  CONCEPT_STATE_ORDER,
  deriveAggregateMetrics as deriveAggregateCore,
  deriveConceptMetrics as deriveConceptCore,
  formatStageCounts,
  type ConceptDerivedMetrics,
  type ConceptState,
  type CardStageCounts,
} from "@socrates/concept-metrics";

export type { ConceptState, ConceptDerivedMetrics, CardStageCounts };
export { CONCEPT_STATE_ORDER, formatStageCounts };

const STATE_COLORS: Record<ConceptState, string> = {
  unintroduced: "hsl(0, 72%, 48%)",
  fragile: "hsl(18, 78%, 50%)",
  forming: "hsl(42, 85%, 52%)",
  stable: "hsl(85, 70%, 48%)",
  robust: "hsl(120, 65%, 42%)",
};

const STATE_STROKE: Record<ConceptState, string> = {
  unintroduced: "hsl(0, 55%, 32%)",
  fragile: "hsl(18, 55%, 34%)",
  forming: "hsl(42, 55%, 34%)",
  stable: "hsl(85, 50%, 32%)",
  robust: "hsl(120, 50%, 28%)",
};

const STATE_LABELS: Record<ConceptState, string> = {
  unintroduced: "Unintroduced",
  fragile: "Fragile",
  forming: "Forming",
  stable: "Stable",
  robust: "Robust",
};

function toConceptLike(concept: LibraryConcept) {
  return {
    id: concept.id,
    mastery_config: concept.mastery_config,
    linked_content: concept.linked_content,
  };
}

function toScheduleLike(s: CardScheduleView) {
  return {
    card_id: s.card_id,
    state: s.state,
    stability: s.stability,
    last_reviewed_at: s.last_reviewed_at,
  };
}

function toPerformanceLike(p: QuestionPerformanceView) {
  return {
    question_id: p.question_id,
    correct_attempts: p.correct_attempts,
    total_attempts: p.total_attempts,
    accuracy_rate: p.accuracy_rate,
  };
}

export function deriveConceptMetrics(
  concept: LibraryConcept,
  studyCards: Array<{ id: string; conceptId: string; cardTier?: string }>,
  schedules: CardScheduleView[],
  performances: QuestionPerformanceView[] = [],
  now?: Date
): ConceptDerivedMetrics {
  return deriveConceptCore(
    toConceptLike(concept),
    studyCards,
    schedules.map(toScheduleLike),
    performances.map(toPerformanceLike),
    now
  );
}

export function deriveAggregateMetrics(
  conceptIds: string[],
  concepts: LibraryConcept[],
  studyCards: Array<{ id: string; conceptId: string; cardTier?: string }>,
  schedules: CardScheduleView[],
  performances: QuestionPerformanceView[] = [],
  now?: Date
): ConceptDerivedMetrics {
  return deriveAggregateCore(
    conceptIds,
    concepts.map(toConceptLike),
    studyCards,
    schedules.map(toScheduleLike),
    performances.map(toPerformanceLike),
    now
  );
}

export function conceptStateColor(state: ConceptState): string {
  return STATE_COLORS[state];
}

export function conceptStateStroke(state: ConceptState): string {
  return STATE_STROKE[state];
}

export function conceptStateLabel(state: ConceptState): string {
  return STATE_LABELS[state];
}
