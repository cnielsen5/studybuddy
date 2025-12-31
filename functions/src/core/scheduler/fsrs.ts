/**
 * FSRS (Free Spaced Repetition Scheduler)
 * 
 * Pure implementation of the FSRS algorithm for spaced repetition.
 * This is a modern, optimized spaced repetition algorithm that uses
 * stability and difficulty parameters.
 * 
 * Rules:
 * - No I/O
 * - No side effects
 * - Functions in → functions out
 * - Deterministic (same input = same output)
 */

import { CardState } from "../../domain/enums";

/**
 * FSRS parameters (can be customized per user)
 */
export interface FSRSParameters {
  /** Initial stability for new cards */
  initialStability: number;
  /** Initial difficulty for new cards */
  initialDifficulty: number;
  /** Minimum stability threshold */
  minStability: number;
  /** Maximum stability threshold */
  maxStability: number;
  /** Minimum difficulty threshold */
  minDifficulty: number;
  /** Maximum difficulty threshold */
  maxDifficulty: number;
  /** Forgetting curve decay factor */
  decayFactor: number;
  /** Grade multipliers for stability updates */
  gradeMultipliers: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

/**
 * Default FSRS parameters (optimized for medical education)
 */
export const DEFAULT_FSRS_PARAMS: FSRSParameters = {
  initialStability: 1.0,
  initialDifficulty: 5.0,
  minStability: 0.1,
  maxStability: 365.0, // ~1 year max interval
  minDifficulty: 0.1,
  maxDifficulty: 10.0,
  decayFactor: 0.5,
  gradeMultipliers: {
    again: 0.4,
    hard: 0.6,
    good: 1.8,
    easy: 2.5,
  },
};

/**
 * Card schedule state (input to FSRS)
 */
export interface CardScheduleInput {
  /** Current stability */
  stability: number;
  /** Current difficulty */
  difficulty: number;
  /** Current state (NEW, LEARNING, REVIEW, RELEARNING) */
  state: CardState;
  /** Number of reviews */
  reps: number;
  /** Number of lapses */
  lapses: number;
  /** Last review timestamp */
  lastReviewAt: string;
  /** Current timestamp */
  currentTime: string;
}

/**
 * Card schedule result (output from FSRS)
 */
export interface CardScheduleResult {
  /** New stability after review */
  stability: number;
  /** New difficulty after review */
  difficulty: number;
  /** New state after review */
  state: CardState;
  /** Next interval in days */
  intervalDays: number;
  /** Next due date */
  dueAt: string;
  /** Updated review count */
  reps: number;
  /** Updated lapse count */
  lapses: number;
}

/**
 * Review grade
 */
export type ReviewGrade = "again" | "hard" | "good" | "easy";

/**
 * Calculates the next schedule state using FSRS algorithm
 * 
 * @param input - Current card schedule state
 * @param grade - Review grade (again, hard, good, easy)
 * @param params - FSRS parameters (optional, uses defaults)
 * @returns New schedule state
 */
export function calculateNextSchedule(
  input: CardScheduleInput,
  grade: ReviewGrade,
  params: FSRSParameters = DEFAULT_FSRS_PARAMS
): CardScheduleResult {
  let newStability = input.stability;
  let newDifficulty = input.difficulty;
  let newState = input.state;
  let newReps = input.reps;
  let newLapses = input.lapses;

  // Get grade multiplier
  const multiplier = params.gradeMultipliers[grade];

  // Handle "again" (lapse)
  if (grade === "again") {
    newLapses += 1;
    // Stability drops significantly on lapse
    newStability = Math.max(
      params.minStability,
      input.stability * params.decayFactor
    );
    // Difficulty increases on lapse
    newDifficulty = Math.min(
      params.maxDifficulty,
      input.difficulty + 0.2
    );
    // State transitions: move to RELEARNING or back to LEARNING
    if (input.state === CardState.NEW) {
      newState = CardState.LEARNING;
    } else if (input.state === CardState.REVIEW) {
      newState = CardState.RELEARNING;
    } else {
      newState = CardState.LEARNING; // LEARNING or RELEARNING stay in LEARNING
    }
  } else {
    // Successful review
    newReps += 1;
    
    // Update stability based on grade
    newStability = Math.min(
      params.maxStability,
      Math.max(
        params.minStability,
        input.stability * multiplier
      )
    );

    // Update difficulty based on grade
    if (grade === "hard") {
      newDifficulty = Math.min(
        params.maxDifficulty,
        input.difficulty + 0.15
      );
    } else if (grade === "good") {
      newDifficulty = Math.max(
        params.minDifficulty,
        input.difficulty - 0.15
      );
    } else if (grade === "easy") {
      newDifficulty = Math.max(
        params.minDifficulty,
        input.difficulty - 0.3
      );
    }

    // State transitions for successful reviews
    if (input.state === CardState.NEW) {
      newState = CardState.LEARNING;
    } else if (input.state === CardState.LEARNING) {
      // Move to REVIEW when stability is high enough
      if (newStability >= 7.0) {
        newState = CardState.REVIEW;
      }
    } else if (input.state === CardState.RELEARNING) {
      // Move back to REVIEW when stability recovers
      if (newStability >= 5.0) {
        newState = CardState.REVIEW;
      }
    }
    // REVIEW state stays REVIEW (until mastered, which is handled elsewhere)
  }

  // Calculate interval based on stability
  // For LEARNING and RELEARNING states, use shorter intervals
  let intervalDays: number;
  if (newState === CardState.LEARNING || newState === CardState.RELEARNING) {
    // Learning phase: intervals of 1-4 days
    intervalDays = Math.max(1, Math.min(4, Math.floor(newStability)));
  } else {
    // Review phase: intervals based on stability
    intervalDays = Math.max(1, Math.floor(newStability));
  }

  // Calculate next due date
  const currentDate = new Date(input.currentTime);
  const dueDate = new Date(currentDate);
  dueDate.setDate(dueDate.getDate() + intervalDays);

  return {
    stability: newStability,
    difficulty: newDifficulty,
    state: newState,
    intervalDays,
    dueAt: dueDate.toISOString(),
    reps: newReps,
    lapses: newLapses,
  };
}

/**
 * Calculates the retention probability for a card at a given time
 * 
 * @param stability - Current stability
 * @param elapsedDays - Days since last review
 * @param params - FSRS parameters (optional)
 * @returns Retention probability (0-1)
 */
export function calculateRetention(
  stability: number,
  elapsedDays: number,
  params: FSRSParameters = DEFAULT_FSRS_PARAMS
): number {
  if (elapsedDays <= 0) return 1.0;
  
  // Exponential decay model: R = e^(-t/S)
  // where R = retention, t = elapsed days, S = stability
  const retention = Math.exp(-elapsedDays / stability);
  return Math.max(0, Math.min(1, retention));
}

/**
 * Calculates the optimal interval for a card based on target retention
 * 
 * @param stability - Current stability
 * @param targetRetention - Target retention rate (0-1, default 0.9)
 * @param params - FSRS parameters (optional)
 * @returns Optimal interval in days
 */
export function calculateOptimalInterval(
  stability: number,
  targetRetention: number = 0.9,
  params: FSRSParameters = DEFAULT_FSRS_PARAMS
): number {
  if (targetRetention <= 0 || targetRetention >= 1) {
    throw new Error("Target retention must be between 0 and 1");
  }
  
  // Solve: targetRetention = e^(-t/S) for t
  // t = -S * ln(targetRetention)
  const interval = -stability * Math.log(targetRetention);
  return Math.max(1, Math.floor(interval));
}

/**
 * Initializes a new card's schedule state
 * 
 * @param params - FSRS parameters (optional)
 * @returns Initial schedule state
 */
export function initializeCardSchedule(
  params: FSRSParameters = DEFAULT_FSRS_PARAMS
): CardScheduleInput {
  return {
    stability: params.initialStability,
    difficulty: params.initialDifficulty,
    state: CardState.NEW,
    reps: 0,
    lapses: 0,
    lastReviewAt: new Date().toISOString(),
    currentTime: new Date().toISOString(),
  };
}

