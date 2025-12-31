/**
 * Normalization Utilities
 * 
 * Functions to normalize and validate scheduling parameters.
 * Ensures values are within valid ranges and handles edge cases.
 * 
 * Rules:
 * - No I/O
 * - No side effects
 * - Functions in → functions out
 */

import { FSRSParameters, DEFAULT_FSRS_PARAMS } from "./fsrs";

/**
 * Normalizes stability value to valid range
 * 
 * @param stability - Stability value to normalize
 * @param params - FSRS parameters (optional)
 * @returns Normalized stability
 */
export function normalizeStability(
  stability: number,
  params: FSRSParameters = DEFAULT_FSRS_PARAMS
): number {
  if (!Number.isFinite(stability) || isNaN(stability)) {
    return params.initialStability;
  }
  return Math.max(
    params.minStability,
    Math.min(params.maxStability, stability)
  );
}

/**
 * Normalizes difficulty value to valid range
 * 
 * @param difficulty - Difficulty value to normalize
 * @param params - FSRS parameters (optional)
 * @returns Normalized difficulty
 */
export function normalizeDifficulty(
  difficulty: number,
  params: FSRSParameters = DEFAULT_FSRS_PARAMS
): number {
  if (!Number.isFinite(difficulty) || isNaN(difficulty)) {
    return params.initialDifficulty;
  }
  return Math.max(
    params.minDifficulty,
    Math.min(params.maxDifficulty, difficulty)
  );
}

/**
 * Normalizes interval to valid range (minimum 1 day)
 * 
 * @param intervalDays - Interval in days
 * @returns Normalized interval (at least 1 day)
 */
export function normalizeInterval(intervalDays: number): number {
  if (!Number.isFinite(intervalDays) || isNaN(intervalDays)) {
    return 1;
  }
  return Math.max(1, Math.floor(intervalDays));
}

/**
 * Normalizes retention probability to 0-1 range
 * 
 * @param retention - Retention value
 * @returns Normalized retention (0-1)
 */
export function normalizeRetention(retention: number): number {
  if (!Number.isFinite(retention) || isNaN(retention)) {
    return 0;
  }
  return Math.max(0, Math.min(1, retention));
}

/**
 * Validates FSRS parameters
 * 
 * @param params - Parameters to validate
 * @returns Validation result with errors if any
 */
export function validateFSRSParameters(params: FSRSParameters): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (params.initialStability <= 0) {
    errors.push("initialStability must be > 0");
  }
  if (params.minStability <= 0) {
    errors.push("minStability must be > 0");
  }
  if (params.maxStability <= params.minStability) {
    errors.push("maxStability must be > minStability");
  }
  if (params.initialDifficulty <= 0) {
    errors.push("initialDifficulty must be > 0");
  }
  if (params.minDifficulty <= 0) {
    errors.push("minDifficulty must be > 0");
  }
  if (params.maxDifficulty <= params.minDifficulty) {
    errors.push("maxDifficulty must be > minDifficulty");
  }
  if (params.decayFactor <= 0 || params.decayFactor >= 1) {
    errors.push("decayFactor must be between 0 and 1");
  }
  if (params.gradeMultipliers.again <= 0) {
    errors.push("gradeMultipliers.again must be > 0");
  }
  if (params.gradeMultipliers.hard <= 0) {
    errors.push("gradeMultipliers.hard must be > 0");
  }
  if (params.gradeMultipliers.good <= 0) {
    errors.push("gradeMultipliers.good must be > 0");
  }
  if (params.gradeMultipliers.easy <= 0) {
    errors.push("gradeMultipliers.easy must be > 0");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Clamps a value between min and max
 * 
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || isNaN(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

/**
 * Normalizes a percentage value to 0-1 range
 * 
 * @param percentage - Percentage value (0-100 or 0-1)
 * @returns Normalized value (0-1)
 */
export function normalizePercentage(percentage: number): number {
  if (!Number.isFinite(percentage) || isNaN(percentage)) {
    return 0;
  }
  // If value > 1, assume it's 0-100 scale
  if (percentage > 1) {
    return Math.max(0, Math.min(1, percentage / 100));
  }
  return Math.max(0, Math.min(1, percentage));
}

