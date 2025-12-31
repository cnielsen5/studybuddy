/**
 * Graph Metrics Calculator
 * 
 * Computes mastery metrics for concepts based on card performance.
 * Pure functions for calculating concept-level statistics.
 * 
 * Rules:
 * - No I/O
 * - No side effects
 * - Functions in → functions out
 */

import { Concept } from "../../domain/concept";
import { CardScheduleView } from "../queue/eligibility";

/**
 * Card performance view (minimal interface for metrics calculation)
 */
export interface CardPerformanceView {
  card_id: string;
  accuracy_rate: number;
}

/**
 * Concept mastery metrics
 */
export interface ConceptMasteryMetrics {
  /** Concept ID */
  concept_id: string;
  /** Overall mastery score (0-1) */
  masteryScore: number;
  /** Number of cards linked to this concept */
  totalCards: number;
  /** Number of mastered cards */
  masteredCards: number;
  /** Average stability across all cards */
  averageStability: number;
  /** Average difficulty across all cards */
  averageDifficulty: number;
  /** Average accuracy rate */
  averageAccuracy: number;
  /** Cards in learning phase */
  learningCards: number;
  /** Cards in review phase */
  reviewCards: number;
  /** Cards that are new */
  newCards: number;
}

/**
 * Options for calculating metrics
 */
export interface MetricsOptions {
  /** Stability threshold for "mastered" (default: 30 days) */
  masteryStabilityThreshold?: number;
  /** Minimum accuracy for mastery (default: 0.8) */
  masteryAccuracyThreshold?: number;
  /** Weight for stability in mastery score (default: 0.6) */
  stabilityWeight?: number;
  /** Weight for accuracy in mastery score (default: 0.4) */
  accuracyWeight?: number;
}

/**
 * Default metrics options
 */
export const DEFAULT_METRICS_OPTIONS: MetricsOptions = {
  masteryStabilityThreshold: 30.0,
  masteryAccuracyThreshold: 0.8,
  stabilityWeight: 0.6,
  accuracyWeight: 0.4,
};

/**
 * Maps cards to concepts (via concept_ids in card relations)
 */
export interface CardConceptMapping {
  /** Card ID */
  card_id: string;
  /** Concept IDs this card is linked to */
  concept_ids: string[];
}

/**
 * Calculates mastery metrics for a concept
 * 
 * @param concept - Concept
 * @param cardMappings - Card to concept mappings
 * @param scheduleViews - Card schedule views
 * @param performanceViews - Card performance views
 * @param options - Metrics options
 * @returns Mastery metrics
 */
export function calculateConceptMastery(
  concept: Concept,
  cardMappings: CardConceptMapping[],
  scheduleViews: Map<string, CardScheduleView>,
  performanceViews: Map<string, CardPerformanceView>,
  options: MetricsOptions = DEFAULT_METRICS_OPTIONS
): ConceptMasteryMetrics {
  // Find cards linked to this concept
  const linkedCards = cardMappings.filter((mapping) =>
    mapping.concept_ids.includes(concept.id)
  );

  if (linkedCards.length === 0) {
    return {
      concept_id: concept.id,
      masteryScore: 0,
      totalCards: 0,
      masteredCards: 0,
      averageStability: 0,
      averageDifficulty: 0,
      averageAccuracy: 0,
      learningCards: 0,
      reviewCards: 0,
      newCards: 0,
    };
  }

  const masteryThreshold = options.masteryStabilityThreshold || 30.0;
  const accuracyThreshold = options.masteryAccuracyThreshold || 0.8;

  let totalStability = 0;
  let totalDifficulty = 0;
  let totalAccuracy = 0;
  let masteredCount = 0;
  let learningCount = 0;
  let reviewCount = 0;
  let newCount = 0;
  let cardsWithData = 0;

  for (const mapping of linkedCards) {
    const schedule = scheduleViews.get(mapping.card_id);
    const performance = performanceViews.get(mapping.card_id);

    if (schedule) {
      totalStability += schedule.stability;
      totalDifficulty += schedule.difficulty;
      cardsWithData++;

      // Count by state
      if (schedule.state === 0) newCount++;
      else if (schedule.state === 1 || schedule.state === 3) learningCount++;
      else if (schedule.state === 2) reviewCount++;

      // Check if mastered
      const isMastered =
        schedule.stability >= masteryThreshold &&
        (!performance || performance.accuracy_rate >= accuracyThreshold);

      if (isMastered) {
        masteredCount++;
      }
    }

    if (performance) {
      totalAccuracy += performance.accuracy_rate;
    }
  }

  const cardCount = linkedCards.length;
  const avgStability = cardsWithData > 0 ? totalStability / cardsWithData : 0;
  const avgDifficulty = cardsWithData > 0 ? totalDifficulty / cardsWithData : 0;
  const avgAccuracy =
    linkedCards.filter((m) => performanceViews.has(m.card_id)).length > 0
      ? totalAccuracy /
        linkedCards.filter((m) => performanceViews.has(m.card_id)).length
      : 0;

  // Calculate mastery score (weighted combination of stability and accuracy)
  const stabilityWeight = options.stabilityWeight || 0.6;
  const accuracyWeight = options.accuracyWeight || 0.4;

  // Normalize stability (0-1 scale, assuming max ~365 days)
  const normalizedStability = Math.min(1, avgStability / 365);
  const masteryScore =
    normalizedStability * stabilityWeight + avgAccuracy * accuracyWeight;

  return {
    concept_id: concept.id,
    masteryScore: Math.max(0, Math.min(1, masteryScore)),
    totalCards: cardCount,
    masteredCards: masteredCount,
    averageStability: avgStability,
    averageDifficulty: avgDifficulty,
    averageAccuracy: avgAccuracy,
    learningCards: learningCount,
    reviewCards: reviewCount,
    newCards: newCount,
  };
}

/**
 * Calculates mastery metrics for all concepts
 * 
 * @param concepts - Array of concepts
 * @param cardMappings - Card to concept mappings
 * @param scheduleViews - Card schedule views
 * @param performanceViews - Card performance views
 * @param options - Metrics options
 * @returns Map of concept ID to mastery metrics
 */
export function calculateAllConceptMastery(
  concepts: Concept[],
  cardMappings: CardConceptMapping[],
  scheduleViews: Map<string, CardScheduleView>,
  performanceViews: Map<string, CardPerformanceView>,
  options: MetricsOptions = DEFAULT_METRICS_OPTIONS
): Map<string, ConceptMasteryMetrics> {
  const metrics = new Map<string, ConceptMasteryMetrics>();

  for (const concept of concepts) {
    const metric = calculateConceptMastery(
      concept,
      cardMappings,
      scheduleViews,
      performanceViews,
      options
    );
    metrics.set(concept.id, metric);
  }

  return metrics;
}

/**
 * Checks if a concept is mastered
 * 
 * @param metrics - Concept mastery metrics
 * @param threshold - Mastery threshold (default: 0.8)
 * @returns true if concept is mastered
 */
export function isConceptMastered(
  metrics: ConceptMasteryMetrics,
  threshold: number = 0.8
): boolean {
  return metrics.masteryScore >= threshold;
}

/**
 * Gets concepts sorted by mastery score (ascending = needs most work)
 * 
 * @param metrics - Map of concept metrics
 * @returns Array of concept IDs sorted by mastery (lowest first)
 */
export function getConceptsByMastery(
  metrics: Map<string, ConceptMasteryMetrics>
): string[] {
  return Array.from(metrics.entries())
    .sort((a, b) => a[1].masteryScore - b[1].masteryScore)
    .map(([conceptId]) => conceptId);
}

