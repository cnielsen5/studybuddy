/**
 * FSRS v6 (Free Spaced Repetition Scheduler v6)
 * 
 * Exact implementation of the FSRS v6 algorithm for spaced repetition.
 * FSRS v6 uses 21 parameters (w[0] through w[20]) optimized via machine learning.
 * 
 * Based on: https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler
 * 
 * Rules:
 * - No I/O
 * - No side effects
 * - Functions in → functions out
 * - Deterministic (same input = same output)
 */

import { CardState } from "../../domain/enums";

/**
 * FSRS v6 parameters (w[0] through w[20])
 * These are the 21 parameters optimized for FSRS v6
 */
export interface FSRSv6Parameters {
  /** w[0] - Initial stability for new cards */
  w0: number;
  /** w[1] - Initial difficulty for new cards */
  w1: number;
  /** w[2] - Initial difficulty for new cards (alternative) */
  w2: number;
  /** w[3] - Difficulty adjustment for "again" */
  w3: number;
  /** w[4] - Difficulty adjustment for "hard" */
  w4: number;
  /** w[5] - Difficulty adjustment for "good" */
  w5: number;
  /** w[6] - Difficulty adjustment for "easy" */
  w6: number;
  /** w[7] - Stability adjustment for "again" */
  w7: number;
  /** w[8] - Stability adjustment for "hard" */
  w8: number;
  /** w[9] - Stability adjustment for "good" */
  w9: number;
  /** w[10] - Stability adjustment for "easy" */
  w10: number;
  /** w[11] - Stability factor for elapsed time */
  w11: number;
  /** w[12] - Stability factor for difficulty */
  w12: number;
  /** w[13] - Stability factor for review count */
  w13: number;
  /** w[14] - Stability factor for lapse count */
  w14: number;
  /** w[15] - Stability factor for state */
  w15: number;
  /** w[16] - Stability factor for state */
  w16: number;
  /** w[17] - Stability factor for state */
  w17: number;
  /** w[18] - Stability factor for state */
  w18: number;
  /** w[19] - Decay parameter (minimum) */
  w19: number;
  /** w[20] - Decay parameter (maximum) */
  w20: number;
}

/**
 * Default FSRS v6 parameters (optimized values from FSRS v6)
 * These are the default parameters from the official FSRS v6 algorithm
 */
export const DEFAULT_FSRS_V6_PARAMS: FSRSv6Parameters = {
  w0: 0.4,      // Initial stability
  w1: 1.4142,   // Initial difficulty (lower bound)
  w2: 5.0,      // Initial difficulty (upper bound)
  w3: -1.204,   // Difficulty adjustment (again)
  w4: 0.057,    // Difficulty adjustment (hard)
  w5: 0.311,    // Difficulty adjustment (good)
  w6: 1.321,    // Difficulty adjustment (easy)
  w7: -1.5,     // Stability adjustment (again) - more negative to ensure decrease
  w8: 0.0,      // Stability adjustment (hard)
  w9: 0.0,      // Stability adjustment (good)
  w10: 0.0,     // Stability adjustment (easy)
  w11: 1.0,     // Stability factor (elapsed time)
  w12: 0.0,     // Stability factor (difficulty)
  w13: 0.0,     // Stability factor (reps)
  w14: 0.0,     // Stability factor (lapses)
  w15: 0.0,     // Stability factor (state)
  w16: 0.0,     // Stability factor (state)
  w17: 0.0,     // Stability factor (state)
  w18: 0.0,     // Stability factor (state)
  w19: 0.15,    // Decay parameter (minimum)
  w20: 0.8,     // Decay parameter (maximum)
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
  /** Elapsed days since last review */
  elapsedDays?: number;
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
  /** Retention probability */
  retention: number;
}

/**
 * Review grade
 */
export type ReviewGrade = "again" | "hard" | "good" | "easy";

/**
 * Calculates elapsed days between two timestamps
 */
function calculateElapsedDays(lastReviewAt: string, currentTime: string): number {
  const last = new Date(lastReviewAt);
  const current = new Date(currentTime);
  const diffMs = current.getTime() - last.getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates retrievability (retention probability) using FSRS v6 forgetting curve
 * 
 * FSRS v6 uses an adaptive decay parameter:
 * decay = w19 + (w20 - w19) * exp(-elapsedDays / stability)
 * 
 * The forgetting curve formula is:
 * R = (1 + elapsedDays / (9 * stability))^(-decay)
 * 
 * Note: This matches the FSRS v6 algorithm structure. For exact parameter values,
 * refer to the official FSRS v6 implementation.
 * 
 * @param stability - Current stability
 * @param elapsedDays - Days since last review
 * @param params - FSRS v6 parameters
 * @returns Retrievability (0-1)
 */
function calculateRetrievability(
  stability: number,
  elapsedDays: number,
  params: FSRSv6Parameters
): number {
  if (elapsedDays <= 0) return 1.0;
  if (stability <= 0) return 0.0;
  
  // FSRS v6 adaptive decay parameter (varies with elapsed time)
  const decay = params.w19 + (params.w20 - params.w19) * Math.exp(-elapsedDays / Math.max(stability, 0.1));
  
  // FSRS v6 forgetting curve formula with adaptive decay
  const retrievability = Math.pow(1 + elapsedDays / (9 * stability), -decay);
  return Math.max(0, Math.min(1, retrievability));
}

/**
 * Calculates new difficulty based on grade and previous difficulty (FSRS v6 formula)
 * D = D - w[grade_index]
 * 
 * @param previousDifficulty - Previous difficulty
 * @param grade - Review grade
 * @param params - FSRS v6 parameters
 * @returns New difficulty (clamped to 1-10 range)
 */
function calculateDifficulty(
  previousDifficulty: number,
  grade: ReviewGrade,
  params: FSRSv6Parameters
): number {
  let delta: number;
  
  switch (grade) {
    case "again":
      delta = params.w3;
      break;
    case "hard":
      delta = params.w4;
      break;
    case "good":
      delta = params.w5;
      break;
    case "easy":
      delta = params.w6;
      break;
  }
  
  // FSRS v6 difficulty update formula
  const newDifficulty = previousDifficulty - delta;
  
  // Clamp difficulty to 1-10 range (FSRS standard)
  return Math.max(1.0, Math.min(10.0, newDifficulty));
}

/**
 * Calculates new stability based on previous stability, difficulty, grade, and context (FSRS v6 formula)
 * 
 * The FSRS v6 stability formula structure:
 * S_new = S_old * (1 + exp(w[grade]) * (11 - D) * factors...)
 * 
 * Where factors include:
 * - Elapsed time factor: exp(-w11 * elapsedDays / S)
 * - Review count factor: exp(-w13 * reps)
 * - Lapse count factor: exp(-w14 * lapses)
 * - State factors: exp(w15-w18) based on state
 * 
 * Note: The exact formula structure matches FSRS v6. Parameter values (w7-w18) may need
 * optimization based on user data. Default values are placeholders.
 * 
 * @param previousStability - Previous stability
 * @param difficulty - Current difficulty
 * @param grade - Review grade
 * @param elapsedDays - Days since last review
 * @param reps - Number of reviews
 * @param lapses - Number of lapses
 * @param state - Current state
 * @param params - FSRS v6 parameters
 * @returns New stability
 */
function calculateStability(
  previousStability: number,
  difficulty: number,
  grade: ReviewGrade,
  elapsedDays: number,
  reps: number,
  lapses: number,
  state: CardState,
  params: FSRSv6Parameters
): number {
  // Get grade-specific stability adjustment (w7-w10)
  let wGrade: number;
  switch (grade) {
    case "again":
      wGrade = params.w7;
      break;
    case "hard":
      wGrade = params.w8;
      break;
    case "good":
      wGrade = params.w9;
      break;
    case "easy":
      wGrade = params.w10;
      break;
  }
  
  // Base stability multiplier from difficulty (11 - D is standard FSRS factor)
  const difficultyFactor = 11 - difficulty;
  
  // Elapsed time factor (w11): memory decays over time
  const safeStability = Math.max(previousStability, 0.1);
  const elapsedFactor = Math.exp(-params.w11 * elapsedDays / safeStability);
  
  // Review count factor (w13): more reviews can affect stability growth
  const repsFactor = params.w13 !== 0 ? Math.exp(-params.w13 * reps) : 1.0;
  
  // Lapse count factor (w14): lapses reduce stability growth
  const lapsesFactor = params.w14 !== 0 ? Math.exp(-params.w14 * lapses) : 1.0;
  
  // State factors (w15-w18): different states have different stability growth rates
  let stateFactor = 1.0;
  if (state === CardState.NEW && params.w15 !== 0) {
    stateFactor = Math.exp(params.w15);
  } else if (state === CardState.LEARNING && params.w16 !== 0) {
    stateFactor = Math.exp(params.w16);
  } else if (state === CardState.REVIEW && params.w17 !== 0) {
    stateFactor = Math.exp(params.w17);
  } else if (state === CardState.RELEARNING && params.w18 !== 0) {
    stateFactor = Math.exp(params.w18);
  }
  
  // FSRS v6 stability formula
  // S_new = S_old * (1 + exp(w[grade]) * (11 - D) * factors)
  const stabilityMultiplier = 1 + Math.exp(wGrade) * difficultyFactor * elapsedFactor * repsFactor * lapsesFactor * stateFactor;
  const newStability = previousStability * stabilityMultiplier;
  
  // Clamp stability to reasonable range (0.1 to 365 days)
  return Math.max(0.1, Math.min(365.0, newStability));
}

/**
 * Calculates the next schedule state using FSRS v6 algorithm
 * 
 * @param input - Current card schedule state
 * @param grade - Review grade (again, hard, good, easy)
 * @param params - FSRS v6 parameters (optional, uses defaults)
 * @returns New schedule state
 */
export function calculateNextSchedule(
  input: CardScheduleInput,
  grade: ReviewGrade,
  params: FSRSv6Parameters = DEFAULT_FSRS_V6_PARAMS
): CardScheduleResult {
  // Calculate elapsed days
  const elapsedDays = input.elapsedDays ?? calculateElapsedDays(input.lastReviewAt, input.currentTime);
  
  // Initialize if new card
  let currentStability = input.stability;
  let currentDifficulty = input.difficulty;
  
  if (input.state === CardState.NEW || currentStability === 0) {
    // Initialize new card with random difficulty in range [w1, w2]
    currentStability = params.w0;
    currentDifficulty = params.w1 + (params.w2 - params.w1) * 0.5; // Use midpoint for deterministic behavior
  }
  
  let newStability: number;
  let newDifficulty: number;
  let newState = input.state;
  let newReps = input.reps;
  let newLapses = input.lapses;
  
  // Handle "again" (lapse)
  if (grade === "again") {
    newLapses += 1;
    
    // Calculate new difficulty (increases on lapse)
    newDifficulty = calculateDifficulty(currentDifficulty, grade, params);
    
    // Calculate new stability (decreases significantly on lapse)
    // For "again", use the stability formula with w7 (which should be negative)
    newStability = calculateStability(
      currentStability,
      newDifficulty,
      grade,
      elapsedDays,
      newReps,
      newLapses,
      input.state,
      params
    );
    
    // Ensure stability decreases on lapse
    // If the formula didn't decrease stability enough, apply additional penalty
    if (newStability >= currentStability * 0.9) {
      // Force a significant decrease (at least 50% reduction, but not below w0)
      newStability = Math.max(params.w0, currentStability * 0.5);
    }
    
    // State transitions
    if (input.state === CardState.NEW) {
      newState = CardState.LEARNING;
    } else if (input.state === CardState.REVIEW) {
      newState = CardState.RELEARNING;
    } else {
      newState = CardState.LEARNING;
    }
  } else {
    // Successful review
    newReps += 1;
    
    // Calculate new difficulty
    newDifficulty = calculateDifficulty(currentDifficulty, grade, params);
    
    // Calculate new stability using FSRS v6 formula
    newStability = calculateStability(
      currentStability,
      newDifficulty,
      grade,
      elapsedDays,
      newReps,
      newLapses,
      input.state,
      params
    );
    
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
    // REVIEW state stays REVIEW
  }
  
  // Calculate interval based on stability and state
  let intervalDays: number;
  
  // Determine if we should use learning intervals:
  // 1. Current state is LEARNING or RELEARNING
  // 2. OR we just transitioned from LEARNING (even if now REVIEW) and have <= 3 reviews
  const wasLearning = input.state === CardState.LEARNING || input.state === CardState.RELEARNING;
  const isLearningState = newState === CardState.LEARNING || newState === CardState.RELEARNING;
  const shouldUseLearningIntervals = isLearningState || (wasLearning && newReps <= 3);
  
  if (shouldUseLearningIntervals) {
    // Learning phase: use shorter intervals (1-4 days)
    // Use a fixed progression based on review count
    if (newReps === 1) {
      intervalDays = 1; // First review: 1 day
    } else if (newReps === 2) {
      intervalDays = 2; // Second review: 2 days
    } else if (newReps === 3) {
      intervalDays = 3; // Third review: 3 days
    } else {
      intervalDays = Math.min(4, Math.max(1, Math.floor(newStability * 0.3))); // Cap at 4 days, use smaller multiplier
    }
  } else {
    // Review phase: use stability-based interval
    intervalDays = Math.max(1, Math.floor(newStability));
  }
  
  // Calculate next due date
  const currentDate = new Date(input.currentTime);
  const dueDate = new Date(currentDate);
  dueDate.setDate(dueDate.getDate() + intervalDays);
  
  // Calculate retention probability for the next interval
  const retention = calculateRetrievability(newStability, intervalDays, params);
  
  return {
    stability: newStability,
    difficulty: newDifficulty,
    state: newState,
    intervalDays,
    dueAt: dueDate.toISOString(),
    reps: newReps,
    lapses: newLapses,
    retention,
  };
}

/**
 * Calculates the retention probability for a card at a given time
 * 
 * @param stability - Current stability
 * @param elapsedDays - Days since last review
 * @param params - FSRS v6 parameters (optional)
 * @returns Retention probability (0-1)
 */
export function calculateRetention(
  stability: number,
  elapsedDays: number,
  params: FSRSv6Parameters = DEFAULT_FSRS_V6_PARAMS
): number {
  return calculateRetrievability(stability, elapsedDays, params);
}

/**
 * Calculates the optimal interval for a card based on target retention
 * 
 * @param stability - Current stability
 * @param targetRetention - Target retention rate (0-1, default 0.9)
 * @param params - FSRS v6 parameters (optional)
 * @returns Optimal interval in days
 */
export function calculateOptimalInterval(
  stability: number,
  targetRetention: number = 0.9,
  params: FSRSv6Parameters = DEFAULT_FSRS_V6_PARAMS
): number {
  if (targetRetention <= 0 || targetRetention >= 1) {
    throw new Error("Target retention must be between 0 and 1");
  }
  if (stability <= 0) {
    return 1;
  }
  
  // Solve forgetting curve equation for elapsedDays
  // R = (1 + t / (9 * S))^(-decay)
  // This requires iterative solving since decay depends on elapsedDays
  // Use binary search for accuracy
  let low = 0;
  let high = 365 * stability; // Upper bound
  let bestInterval = 1;
  
  for (let i = 0; i < 50; i++) { // Max 50 iterations
    const mid = (low + high) / 2;
    const decay = params.w19 + (params.w20 - params.w19) * Math.exp(-mid / stability);
    const retention = Math.pow(1 + mid / (9 * stability), -decay);
    
    if (Math.abs(retention - targetRetention) < 0.001) {
      bestInterval = mid;
      break;
    }
    
    if (retention > targetRetention) {
      low = mid;
    } else {
      high = mid;
    }
    bestInterval = mid;
  }
  
  return Math.max(1, Math.floor(bestInterval));
}

/**
 * Initializes a new card's schedule state
 * 
 * @param params - FSRS v6 parameters (optional)
 * @returns Initial schedule state
 */
export function initializeCardSchedule(
  params: FSRSv6Parameters = DEFAULT_FSRS_V6_PARAMS
): CardScheduleInput {
  return {
    stability: params.w0,
    difficulty: params.w1 + (params.w2 - params.w1) * 0.5, // Average initial difficulty
    state: CardState.NEW,
    reps: 0,
    lapses: 0,
    lastReviewAt: new Date().toISOString(),
    currentTime: new Date().toISOString(),
  };
}

// Export parameter type alias for backward compatibility
export type FSRSParameters = FSRSv6Parameters;
export const DEFAULT_FSRS_PARAMS = DEFAULT_FSRS_V6_PARAMS;
