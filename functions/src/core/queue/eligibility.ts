/**
 * Card Eligibility Checker
 * 
 * Determines if a card is eligible to be shown in a study session.
 * Considers scheduling state, prerequisites, and user preferences.
 * 
 * Rules:
 * - No I/O
 * - No side effects
 * - Functions in → functions out
 */

import { CardState } from "../../domain/enums";
import { PrimaryReason } from "../../domain/enums";

/**
 * Card schedule view (from projection)
 * Note: state is a number (0=NEW, 1=LEARNING, 2=REVIEW, 3=RELEARNING)
 */
export interface CardScheduleView {
  card_id: string;
  state: CardState | number; // Support both enum and number for flexibility
  due_at: string;
  stability: number;
  difficulty: number;
  interval_days: number;
  last_reviewed_at: string;
}

/**
 * Eligibility check result
 */
export interface EligibilityResult {
  /** Whether the card is eligible */
  eligible: boolean;
  /** Primary reason for eligibility/ineligibility */
  reason: PrimaryReason | null;
  /** Additional context */
  context?: {
    /** Days until due (negative if overdue) */
    daysUntilDue?: number;
    /** Estimated retention probability */
    retentionProbability?: number;
    /** Whether card is new */
    isNew?: boolean;
    /** Whether card is overdue */
    isOverdue?: boolean;
  };
}

/**
 * Eligibility options
 */
export interface EligibilityOptions {
  /** Current time (ISO string) */
  currentTime: string;
  /** Include new cards */
  includeNew: boolean;
  /** Include learning cards */
  includeLearning: boolean;
  /** Include review cards */
  includeReview: boolean;
  /** Include relearning cards */
  includeRelearning: boolean;
  /** Maximum days overdue to include */
  maxOverdueDays?: number;
  /** Minimum stability threshold */
  minStability?: number;
  /** Maximum stability threshold */
  maxStability?: number;
  /** Whether to check prerequisites (requires concept graph) */
  checkPrerequisites?: boolean;
  /** Prerequisite concept IDs that must be mastered */
  requiredPrerequisites?: string[];
}

/**
 * Default eligibility options
 */
export const DEFAULT_ELIGIBILITY_OPTIONS: EligibilityOptions = {
  currentTime: new Date().toISOString(),
  includeNew: true,
  includeLearning: true,
  includeReview: true,
  includeRelearning: true,
  maxOverdueDays: 30,
  checkPrerequisites: false,
};

/**
 * Checks if a card is eligible for review
 * 
 * @param schedule - Card schedule view
 * @param options - Eligibility options
 * @returns Eligibility result
 */
export function checkEligibility(
  schedule: CardScheduleView,
  options: EligibilityOptions = DEFAULT_ELIGIBILITY_OPTIONS
): EligibilityResult {
  const currentTime = new Date(options.currentTime);
  const dueAt = new Date(schedule.due_at);
  const daysUntilDue = Math.floor(
    (dueAt.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysUntilDue < 0;
  
  // Normalize state to number (0=NEW, 1=LEARNING, 2=REVIEW, 3=RELEARNING)
  const stateNum = typeof schedule.state === 'number' 
    ? schedule.state 
    : schedule.state === CardState.NEW ? 0
    : schedule.state === CardState.LEARNING ? 1
    : schedule.state === CardState.REVIEW ? 2
    : schedule.state === CardState.RELEARNING ? 3
    : 0;
  
  const isNew = stateNum === 0 || schedule.state === CardState.NEW;

  // Check state inclusion
  let stateEligible = false;
  let stateReason: PrimaryReason | null = null;

  if (isNew && options.includeNew) {
    stateEligible = true;
    stateReason = PrimaryReason.NEW_CARD;
  } else if ((stateNum === 1 || schedule.state === CardState.LEARNING) && options.includeLearning) {
    stateEligible = true;
    stateReason = PrimaryReason.DUE;
  } else if ((stateNum === 2 || schedule.state === CardState.REVIEW) && options.includeReview) {
    stateEligible = true;
    stateReason = isOverdue ? PrimaryReason.DUE : PrimaryReason.DUE;
  } else if ((stateNum === 3 || schedule.state === CardState.RELEARNING) && options.includeRelearning) {
    stateEligible = true;
    stateReason = PrimaryReason.DUE;
  }

  if (!stateEligible) {
    return {
      eligible: false,
      reason: null,
      context: {
        daysUntilDue,
        isNew,
        isOverdue,
      },
    };
  }

  // Check overdue limit
  if (isOverdue && options.maxOverdueDays !== undefined) {
    const overdueDays = Math.abs(daysUntilDue);
    if (overdueDays > options.maxOverdueDays) {
      return {
        eligible: false,
        reason: null,
        context: {
          daysUntilDue,
          isNew,
          isOverdue: true,
        },
      };
    }
  }

  // Check stability bounds
  if (options.minStability !== undefined && schedule.stability < options.minStability) {
    return {
      eligible: false,
      reason: null,
      context: {
        daysUntilDue,
        isNew,
        isOverdue,
      },
    };
  }

  if (options.maxStability !== undefined && schedule.stability > options.maxStability) {
    return {
      eligible: false,
      reason: null,
      context: {
        daysUntilDue,
        isNew,
        isOverdue,
      },
    };
  }

  // Check prerequisites (if enabled)
  if (options.checkPrerequisites && options.requiredPrerequisites) {
    // This would require concept graph data - for now, we'll skip
    // In a full implementation, you'd check if prerequisite concepts are mastered
  }

  // Calculate retention probability (for context)
  const retentionProbability = isOverdue
    ? Math.exp(-Math.abs(daysUntilDue) / schedule.stability)
    : 1.0;

  return {
    eligible: true,
    reason: stateReason,
    context: {
      daysUntilDue,
      retentionProbability,
      isNew,
      isOverdue,
    },
  };
}

/**
 * Checks if a card is due (simplified check)
 * 
 * @param schedule - Card schedule view
 * @param currentTime - Current time (ISO string)
 * @returns true if card is due
 */
export function isDue(
  schedule: CardScheduleView,
  currentTime: string = new Date().toISOString()
): boolean {
  const dueAt = new Date(schedule.due_at);
  const now = new Date(currentTime);
  return now >= dueAt;
}

/**
 * Checks if a card is new
 * 
 * @param schedule - Card schedule view
 * @returns true if card is new
 */
export function isNew(schedule: CardScheduleView): boolean {
  const stateNum = typeof schedule.state === 'number' ? schedule.state : 
    schedule.state === CardState.NEW ? 0 : -1;
  return stateNum === 0 || schedule.state === CardState.NEW;
}

/**
 * Checks if a card is in learning phase
 * 
 * @param schedule - Card schedule view
 * @returns true if card is in learning
 */
export function isLearning(schedule: CardScheduleView): boolean {
  const stateNum = typeof schedule.state === 'number' ? schedule.state : -1;
  return stateNum === 1 || stateNum === 3 || 
    schedule.state === CardState.LEARNING || schedule.state === CardState.RELEARNING;
}

/**
 * Checks if a card is in review phase
 * 
 * @param schedule - Card schedule view
 * @returns true if card is in review
 */
export function isReview(schedule: CardScheduleView): boolean {
  const stateNum = typeof schedule.state === 'number' ? schedule.state : -1;
  return stateNum === 2 || schedule.state === CardState.REVIEW;
}

