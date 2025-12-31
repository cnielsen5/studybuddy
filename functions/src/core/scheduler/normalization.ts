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

import { FSRSv6Parameters, DEFAULT_FSRS_V6_PARAMS } from "./fsrs";

/**
 * Normalizes stability value to valid range
 * 
 * @param stability - Stability value to normalize
 * @param params - FSRS parameters (optional)
 * @returns Normalized stability
 */
export function normalizeStability(
  stability: number,
  params: FSRSv6Parameters = DEFAULT_FSRS_V6_PARAMS
): number {
  if (!Number.isFinite(stability) || isNaN(stability)) {
    return params.w0; // Initial stability
  }
  return Math.max(0.1, Math.min(365.0, stability)); // Clamp to reasonable range
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
  params: FSRSv6Parameters = DEFAULT_FSRS_V6_PARAMS
): number {
  if (!Number.isFinite(difficulty) || isNaN(difficulty)) {
    return params.w1; // Initial difficulty
  }
  return Math.max(0.1, Math.min(10.0, difficulty)); // Clamp to reasonable range
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
 * Validates FSRS v6 parameters
 * 
 * @param params - Parameters to validate
 * @returns Validation result with errors if any
 */
export function validateFSRSParameters(params: FSRSv6Parameters): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate key parameters
  if (params.w0 <= 0) {
    errors.push("w0 (initial stability) must be > 0");
  }
  if (params.w1 <= 0) {
    errors.push("w1 (initial difficulty) must be > 0");
  }
  if (params.w19 < 0 || params.w19 > 1) {
    errors.push("w19 (decay parameter) must be between 0 and 1");
  }
  if (params.w20 < 0 || params.w20 > 1) {
    errors.push("w20 (decay parameter) must be between 0 and 1");
  }
  if (params.w19 > params.w20) {
    errors.push("w19 must be <= w20");
  }

  // Check that all parameters are finite numbers
  const paramKeys: (keyof FSRSv6Parameters)[] = [
    'w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9',
    'w10', 'w11', 'w12', 'w13', 'w14', 'w15', 'w16', 'w17', 'w18', 'w19', 'w20'
  ];
  
  for (const key of paramKeys) {
    if (!Number.isFinite(params[key])) {
      errors.push(`${key} must be a finite number`);
    }
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

