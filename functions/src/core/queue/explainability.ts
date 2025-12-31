/**
 * Queue Explainability
 * 
 * Provides human-readable explanations for why cards are in the queue
 * and why they're prioritized in a certain order.
 * 
 * Rules:
 * - No I/O
 * - No side effects
 * - Functions in → functions out
 */

import { QueueItem } from "./queueBuilder";
import { PrimaryReason } from "../../domain/enums";
import { CardState } from "../../domain/enums";

/**
 * Explanation for a queue item
 */
export interface QueueExplanation {
  /** Card ID */
  card_id: string;
  /** Primary reason for inclusion */
  reason: PrimaryReason | string;
  /** Human-readable explanation */
  explanation: string;
  /** Priority score */
  priority: number;
  /** Additional context */
  context: {
    /** Days until due (negative if overdue) */
    daysUntilDue?: number;
    /** Current stability */
    stability?: number;
    /** Current difficulty */
    difficulty?: number;
    /** Current state */
    state?: string;
  };
}

/**
 * Generates an explanation for a queue item
 * 
 * @param item - Queue item to explain
 * @returns Explanation
 */
export function explainQueueItem(item: QueueItem): QueueExplanation {
  const eligibility = item.eligibility;
  const schedule = item.schedule;
  const context = eligibility.context || {};
  const daysUntilDue = context.daysUntilDue || 0;

  let reason: PrimaryReason | string = eligibility.reason || PrimaryReason.DUE;
  let explanation = "";

  // Generate explanation based on reason and context
  if (context.isNew) {
    reason = PrimaryReason.NEW_CARD;
    explanation = "This is a new card that hasn't been reviewed yet.";
  } else if (daysUntilDue < 0) {
    const overdueDays = Math.abs(daysUntilDue);
    reason = PrimaryReason.DUE;
    explanation = `This card is ${overdueDays} day${overdueDays !== 1 ? "s" : ""} overdue and needs review.`;
  } else if (daysUntilDue === 0) {
    reason = PrimaryReason.DUE;
    explanation = "This card is due today.";
  } else if (daysUntilDue <= 1) {
    reason = PrimaryReason.DUE;
    explanation = "This card is due soon.";
  } else {
    reason = PrimaryReason.DUE;
    explanation = `This card is due in ${daysUntilDue} days.`;
  }

  // Add state-specific context
  const stateName = getStateName(schedule.state);
  if (stateName) {
    explanation += ` It's currently in ${stateName} phase.`;
  }

  // Add difficulty context
  if (schedule.difficulty > 7) {
    explanation += " This is a difficult card that needs extra practice.";
  } else if (schedule.difficulty < 3) {
    explanation += " This is an easier card.";
  }

  // Add stability context
  if (schedule.stability < 2) {
    explanation += " The memory is still unstable and needs reinforcement.";
  } else if (schedule.stability > 30) {
    explanation += " The memory is well-established.";
  }

  // Add retention probability context
  if (context.retentionProbability !== undefined) {
    const retentionPercent = Math.round(context.retentionProbability * 100);
    if (retentionPercent < 50) {
      explanation += ` Estimated retention is low (${retentionPercent}%).`;
    }
  }

  return {
    card_id: item.card_id,
    reason,
    explanation,
    priority: item.priority,
    context: {
      daysUntilDue,
      stability: schedule.stability,
      difficulty: schedule.difficulty,
      state: stateName,
    },
  };
}

/**
 * Generates explanations for all items in a queue
 * 
 * @param queue - Queue items
 * @returns Array of explanations
 */
export function explainQueue(queue: QueueItem[]): QueueExplanation[] {
  return queue.map(explainQueueItem);
}

/**
 * Generates a summary explanation for the entire queue
 * 
 * @param queue - Queue items
 * @returns Summary explanation
 */
export function explainQueueSummary(queue: QueueItem[]): string {
  if (queue.length === 0) {
    return "No cards are currently due for review.";
  }

  const newCount = queue.filter((item) => item.eligibility.context?.isNew).length;
  const overdueCount = queue.filter((item) => item.eligibility.context?.isOverdue).length;
  const dueCount = queue.length - newCount - overdueCount;

  const parts: string[] = [];

  parts.push(`You have ${queue.length} card${queue.length !== 1 ? "s" : ""} in your queue.`);

  if (newCount > 0) {
    parts.push(`${newCount} ${newCount === 1 ? "is" : "are"} new card${newCount !== 1 ? "s" : ""}.`);
  }

  if (overdueCount > 0) {
    parts.push(`${overdueCount} ${overdueCount === 1 ? "is" : "are"} overdue.`);
  }

  if (dueCount > 0) {
    parts.push(`${dueCount} ${dueCount === 1 ? "is" : "are"} due soon.`);
  }

  return parts.join(" ");
}

/**
 * Gets human-readable state name
 * 
 * @param state - Card state enum value or number
 * @returns State name
 */
function getStateName(state: CardState | number): string {
  // Normalize to number first
  const stateNum = typeof state === 'number' 
    ? state 
    : state === CardState.NEW ? 0
    : state === CardState.LEARNING ? 1
    : state === CardState.REVIEW ? 2
    : state === CardState.RELEARNING ? 3
    : -1;
  
  switch (stateNum) {
    case 0:
      return "new";
    case 1:
      return "learning";
    case 2:
      return "review";
    case 3:
      return "relearning";
    default:
      return "unknown";
  }
}

/**
 * Explains why a card has a specific priority
 * 
 * @param item - Queue item
 * @returns Priority explanation
 */
export function explainPriority(item: QueueItem): string {
  const schedule = item.schedule;
  const context = item.eligibility.context || {};
  const daysUntilDue = context.daysUntilDue || 0;

  const reasons: string[] = [];

  if (context.isNew) {
    reasons.push("New cards get high priority");
  }

  if (daysUntilDue < 0) {
    reasons.push(`Overdue by ${Math.abs(daysUntilDue)} days`);
  }

  if (schedule.difficulty > 7) {
    reasons.push("High difficulty requires more practice");
  }

  if (schedule.stability < 2) {
    reasons.push("Low stability needs reinforcement");
  }

  if (reasons.length === 0) {
    return "Standard priority based on due date.";
  }

  return `High priority because: ${reasons.join(", ")}.`;
}

