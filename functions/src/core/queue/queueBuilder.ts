/**
 * Queue Builder
 * 
 * Builds study queues from eligible cards.
 * Implements prioritization, balancing, and queue construction logic.
 * 
 * Rules:
 * - No I/O
 * - No side effects
 * - Functions in → functions out
 */

import { CardScheduleView } from "./eligibility";
import { checkEligibility, EligibilityResult, EligibilityOptions } from "./eligibility";

/**
 * Queue item with priority and metadata
 */
export interface QueueItem {
  /** Card ID */
  card_id: string;
  /** Schedule view */
  schedule: CardScheduleView;
  /** Eligibility result */
  eligibility: EligibilityResult;
  /** Priority score (higher = more important) */
  priority: number;
  /** Queue position */
  position: number;
}

/**
 * Queue building options
 */
export interface QueueBuilderOptions extends EligibilityOptions {
  /** Maximum queue size */
  maxSize?: number;
  /** Prioritization strategy */
  strategy?: "due_first" | "new_first" | "balanced" | "difficulty" | "stability";
  /** Balance new vs review cards */
  balanceNewAndReview?: boolean;
  /** Target ratio of new:review cards (e.g., 0.3 = 30% new, 70% review) */
  newCardRatio?: number;
  /** Whether to shuffle queue */
  shuffle?: boolean;
}

/**
 * Default queue builder options
 */
export const DEFAULT_QUEUE_OPTIONS: QueueBuilderOptions = {
  ...{
    currentTime: new Date().toISOString(),
    includeNew: true,
    includeLearning: true,
    includeReview: true,
    includeRelearning: true,
  },
  maxSize: 50,
  strategy: "balanced",
  balanceNewAndReview: true,
  newCardRatio: 0.3,
  shuffle: false,
};

/**
 * Builds a study queue from eligible cards
 * 
 * @param schedules - Array of card schedule views
 * @param options - Queue building options
 * @returns Array of queue items, sorted by priority
 */
export function buildQueue(
  schedules: CardScheduleView[],
  options: QueueBuilderOptions = DEFAULT_QUEUE_OPTIONS
): QueueItem[] {
  // Filter eligible cards
  const eligibleCards: Array<{ schedule: CardScheduleView; eligibility: EligibilityResult }> = [];
  
  for (const schedule of schedules) {
    const eligibility = checkEligibility(schedule, options);
    if (eligibility.eligible) {
      eligibleCards.push({ schedule, eligibility });
    }
  }

  if (eligibleCards.length === 0) {
    return [];
  }

  // Calculate priorities
  const itemsWithPriority = eligibleCards.map(({ schedule, eligibility }) => ({
    card_id: schedule.card_id,
    schedule,
    eligibility,
    priority: calculatePriority(schedule, eligibility, options),
  }));

  // Sort by priority (descending)
  itemsWithPriority.sort((a, b) => b.priority - a.priority);

  // Apply balancing if enabled
  let finalItems = itemsWithPriority;
  if (options.balanceNewAndReview) {
    finalItems = balanceQueue(itemsWithPriority, options);
  }

  // Limit queue size
  if (options.maxSize !== undefined && finalItems.length > options.maxSize) {
    finalItems = finalItems.slice(0, options.maxSize);
  }

  // Shuffle if requested (after prioritization)
  if (options.shuffle) {
    finalItems = shuffleArray(finalItems);
  }

  // Assign positions
  return finalItems.map((item, index) => ({
    ...item,
    position: index + 1,
  }));
}

/**
 * Calculates priority score for a card
 * 
 * @param schedule - Card schedule view
 * @param eligibility - Eligibility result
 * @param options - Queue options
 * @returns Priority score
 */
function calculatePriority(
  schedule: CardScheduleView,
  eligibility: EligibilityResult,
  options: QueueBuilderOptions
): number {
  const strategy = options.strategy || "balanced";
  const currentTime = new Date(options.currentTime || new Date().toISOString());
  const dueAt = new Date(schedule.due_at);
  const daysUntilDue = Math.floor(
    (dueAt.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24)
  );

  switch (strategy) {
    case "due_first":
      // Prioritize most overdue cards
      return -daysUntilDue; // Negative because overdue = higher priority

    case "new_first":
      // Prioritize new cards
      return eligibility.context?.isNew ? 1000 : -daysUntilDue;

    case "difficulty":
      // Prioritize difficult cards (higher difficulty = higher priority)
      return schedule.difficulty * 100 - daysUntilDue;

    case "stability":
      // Prioritize low-stability cards (need more practice)
      return (1 / schedule.stability) * 100 - daysUntilDue;

    case "balanced":
    default:
      // Balanced: consider overdue, new cards, and difficulty
      let priority = 0;
      
      // Overdue penalty (more overdue = higher priority)
      if (daysUntilDue < 0) {
        priority += Math.abs(daysUntilDue) * 10;
      }
      
      // New card bonus
      if (eligibility.context?.isNew) {
        priority += 500;
      }
      
      // Difficulty bonus (harder cards need more practice)
      priority += schedule.difficulty * 5;
      
      // Low stability bonus (unstable cards need reinforcement)
      priority += (1 / (schedule.stability + 1)) * 20;
      
      return priority;
  }
}

/**
 * Balances queue between new and review cards
 * 
 * @param items - Queue items with priorities
 * @param options - Queue options
 * @returns Balanced queue items
 */
function balanceQueue(
  items: Array<{ card_id: string; schedule: CardScheduleView; eligibility: EligibilityResult; priority: number }>,
  options: QueueBuilderOptions
): Array<{ card_id: string; schedule: CardScheduleView; eligibility: EligibilityResult; priority: number }> {
  const newCardRatio = options.newCardRatio || 0.3;
  const newCards = items.filter((item) => item.eligibility.context?.isNew);
  const reviewCards = items.filter((item) => !item.eligibility.context?.isNew);

  // Calculate target counts
  const maxSize = options.maxSize || items.length;
  const targetNewCount = Math.floor(maxSize * newCardRatio);
  const targetReviewCount = maxSize - targetNewCount;

  // Take new cards (up to target)
  const selectedNew = newCards.slice(0, Math.min(targetNewCount, newCards.length));
  
  // Take review cards (up to target)
  const selectedReview = reviewCards.slice(0, Math.min(targetReviewCount, reviewCards.length));

  // Combine and re-sort by priority
  const combined = [...selectedNew, ...selectedReview];
  combined.sort((a, b) => b.priority - a.priority);

  return combined;
}

/**
 * Shuffles an array (Fisher-Yates algorithm)
 * 
 * @param array - Array to shuffle
 * @returns Shuffled array (new array, doesn't mutate original)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Gets queue statistics
 * 
 * @param queue - Queue items
 * @returns Statistics about the queue
 */
export function getQueueStats(queue: QueueItem[]): {
  total: number;
  new: number;
  learning: number;
  review: number;
  relearning: number;
  overdue: number;
  averagePriority: number;
  averageDifficulty: number;
  averageStability: number;
} {
  if (queue.length === 0) {
    return {
      total: 0,
      new: 0,
      learning: 0,
      review: 0,
      relearning: 0,
      overdue: 0,
      averagePriority: 0,
      averageDifficulty: 0,
      averageStability: 0,
    };
  }

  const stats = {
    total: queue.length,
    new: 0,
    learning: 0,
    review: 0,
    relearning: 0,
    overdue: 0,
    totalPriority: 0,
    totalDifficulty: 0,
    totalStability: 0,
  };

  for (const item of queue) {
    if (item.eligibility.context?.isNew) stats.new++;
    if (item.schedule.state === 1) stats.learning++;
    if (item.schedule.state === 2) stats.review++;
    if (item.schedule.state === 3) stats.relearning++;
    if (item.eligibility.context?.isOverdue) stats.overdue++;
    
    stats.totalPriority += item.priority;
    stats.totalDifficulty += item.schedule.difficulty;
    stats.totalStability += item.schedule.stability;
  }

  return {
    total: stats.total,
    new: stats.new,
    learning: stats.learning,
    review: stats.review,
    relearning: stats.relearning,
    overdue: stats.overdue,
    averagePriority: stats.totalPriority / stats.total,
    averageDifficulty: stats.totalDifficulty / stats.total,
    averageStability: stats.totalStability / stats.total,
  };
}

