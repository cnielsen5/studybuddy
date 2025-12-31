/**
 * FSRS v6 Parameter Optimization Helper
 * 
 * Provides utilities for optimizing FSRS v6 parameters based on review history.
 * This is a helper module - actual optimization should use the official FSRS Optimizer.
 * 
 * Rules:
 * - No I/O
 * - No side effects
 * - Functions in → functions out
 */

import { FSRSv6Parameters, DEFAULT_FSRS_V6_PARAMS } from "./fsrs";
import { ReviewGrade } from "./fsrs";

/**
 * Review history entry
 */
export interface ReviewHistoryEntry {
  /** Card ID */
  card_id: string;
  /** Review timestamp */
  timestamp: string;
  /** Review grade */
  grade: ReviewGrade;
  /** Elapsed days since last review */
  elapsedDays: number;
  /** Stability before review */
  stabilityBefore: number;
  /** Difficulty before review */
  difficultyBefore: number;
  /** Stability after review */
  stabilityAfter: number;
  /** Difficulty after review */
  difficultyAfter: number;
}

/**
 * Optimization metrics
 */
export interface OptimizationMetrics {
  /** Mean squared error of predicted vs actual retention */
  mse: number;
  /** Mean absolute error */
  mae: number;
  /** Correlation coefficient */
  correlation: number;
  /** Number of reviews analyzed */
  reviewCount: number;
}

/**
 * Calculates predicted retention for a review
 * 
 * @param stability - Current stability
 * @param elapsedDays - Days since last review
 * @param params - FSRS v6 parameters
 * @returns Predicted retention (0-1)
 */
export function predictRetention(
  stability: number,
  elapsedDays: number,
  params: FSRSv6Parameters = DEFAULT_FSRS_V6_PARAMS
): number {
  if (elapsedDays <= 0) return 1.0;
  if (stability <= 0) return 0.0;
  
  const decay = params.w19 + (params.w20 - params.w19) * Math.exp(-elapsedDays / stability);
  const retention = Math.pow(1 + elapsedDays / (9 * stability), -decay);
  return Math.max(0, Math.min(1, retention));
}

/**
 * Calculates optimization metrics for a set of parameters
 * 
 * @param reviewHistory - Array of review history entries
 * @param params - FSRS v6 parameters to evaluate
 * @returns Optimization metrics
 */
export function calculateOptimizationMetrics(
  reviewHistory: ReviewHistoryEntry[],
  params: FSRSv6Parameters = DEFAULT_FSRS_V6_PARAMS
): OptimizationMetrics {
  if (reviewHistory.length === 0) {
    return {
      mse: 0,
      mae: 0,
      correlation: 0,
      reviewCount: 0,
    };
  }

  const errors: number[] = [];
  const predicted: number[] = [];
  const actual: number[] = [];

  for (const review of reviewHistory) {
    // Predict retention based on stability and elapsed days
    const predictedRetention = predictRetention(
      review.stabilityBefore,
      review.elapsedDays,
      params
    );

    // Actual retention is 1.0 if grade is not "again", 0.0 if "again"
    const actualRetention = review.grade === "again" ? 0.0 : 1.0;

    const error = actualRetention - predictedRetention;
    errors.push(error);
    predicted.push(predictedRetention);
    actual.push(actualRetention);
  }

  // Calculate MSE (Mean Squared Error)
  const mse = errors.reduce((sum, e) => sum + e * e, 0) / errors.length;

  // Calculate MAE (Mean Absolute Error)
  const mae = errors.reduce((sum, e) => sum + Math.abs(e), 0) / errors.length;

  // Calculate correlation coefficient
  const correlation = calculateCorrelation(predicted, actual);

  return {
    mse,
    mae,
    correlation,
    reviewCount: reviewHistory.length,
  };
}

/**
 * Calculates Pearson correlation coefficient
 * 
 * @param x - First array
 * @param y - Second array
 * @returns Correlation coefficient (-1 to 1)
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Suggests parameter adjustments based on review patterns
 * 
 * This is a simple heuristic-based optimizer. For production, use the official FSRS Optimizer.
 * 
 * @param reviewHistory - Array of review history entries
 * @param currentParams - Current FSRS v6 parameters
 * @returns Suggested parameter adjustments
 */
export function suggestParameterAdjustments(
  reviewHistory: ReviewHistoryEntry[],
  currentParams: FSRSv6Parameters = DEFAULT_FSRS_V6_PARAMS
): Partial<FSRSv6Parameters> {
  if (reviewHistory.length === 0) {
    return {};
  }

  const suggestions: Partial<FSRSv6Parameters> = {};
  const metrics = calculateOptimizationMetrics(reviewHistory, currentParams);

  // Analyze grade distribution
  const gradeCounts = {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  };

  for (const review of reviewHistory) {
    gradeCounts[review.grade]++;
  }

  const totalReviews = reviewHistory.length;
  const againRate = gradeCounts.again / totalReviews;
  const easyRate = gradeCounts.easy / totalReviews;

  // If "again" rate is too high, suggest increasing initial stability
  if (againRate > 0.3) {
    suggestions.w0 = currentParams.w0 * 1.1; // Increase by 10%
  }

  // If "easy" rate is very high, suggest decreasing initial difficulty
  if (easyRate > 0.4) {
    suggestions.w1 = currentParams.w1 * 0.95; // Decrease by 5%
    suggestions.w2 = currentParams.w2 * 0.95;
  }

  // Adjust difficulty parameters based on grade distribution
  if (gradeCounts.again > gradeCounts.good) {
    // Too many "again" - difficulty might be too high
    suggestions.w3 = currentParams.w3 * 0.9; // Make "again" less impactful
  }

  // Adjust stability parameters if retention is poor
  if (metrics.mse > 0.1) {
    // High error - stability might need adjustment
    suggestions.w7 = currentParams.w7 * 1.1; // Increase stability recovery after "again"
    suggestions.w9 = currentParams.w9 * 1.05; // Slightly increase stability growth on "good"
  }

  return suggestions;
}

/**
 * Applies parameter adjustments to create new parameter set
 * 
 * @param baseParams - Base parameters
 * @param adjustments - Adjustments to apply
 * @returns New parameter set
 */
export function applyParameterAdjustments(
  baseParams: FSRSv6Parameters,
  adjustments: Partial<FSRSv6Parameters>
): FSRSv6Parameters {
  return {
    ...baseParams,
    ...adjustments,
  };
}

/**
 * Validates that parameters are within reasonable bounds
 * 
 * @param params - Parameters to validate
 * @returns Validation result
 */
export function validateParameterBounds(params: FSRSv6Parameters): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check initial stability
  if (params.w0 < 0.1 || params.w0 > 10) {
    warnings.push("w0 (initial stability) should be between 0.1 and 10");
  }

  // Check initial difficulty range
  if (params.w1 >= params.w2) {
    warnings.push("w1 should be < w2 (initial difficulty range)");
  }
  if (params.w1 < 1 || params.w2 > 10) {
    warnings.push("Initial difficulty (w1-w2) should be between 1 and 10");
  }

  // Check decay parameters
  if (params.w19 < 0 || params.w19 > 1) {
    warnings.push("w19 (decay min) should be between 0 and 1");
  }
  if (params.w20 < 0 || params.w20 > 1) {
    warnings.push("w20 (decay max) should be between 0 and 1");
  }
  if (params.w19 > params.w20) {
    warnings.push("w19 should be <= w20");
  }

  // Check difficulty adjustments
  if (params.w3 > 0) {
    warnings.push("w3 (again difficulty) should typically be negative");
  }
  if (params.w6 < 0) {
    warnings.push("w6 (easy difficulty) should typically be positive");
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Exports parameters to a format compatible with FSRS Optimizer
 * 
 * @param params - FSRS v6 parameters
 * @returns Array of 21 parameter values
 */
export function exportParameters(params: FSRSv6Parameters): number[] {
  return [
    params.w0, params.w1, params.w2, params.w3, params.w4, params.w5, params.w6,
    params.w7, params.w8, params.w9, params.w10, params.w11, params.w12, params.w13,
    params.w14, params.w15, params.w16, params.w17, params.w18, params.w19, params.w20,
  ];
}

/**
 * Imports parameters from FSRS Optimizer format
 * 
 * @param values - Array of 21 parameter values
 * @returns FSRS v6 parameters
 */
export function importParameters(values: number[]): FSRSv6Parameters {
  if (values.length !== 21) {
    throw new Error("Parameter array must have exactly 21 values");
  }

  return {
    w0: values[0],
    w1: values[1],
    w2: values[2],
    w3: values[3],
    w4: values[4],
    w5: values[5],
    w6: values[6],
    w7: values[7],
    w8: values[8],
    w9: values[9],
    w10: values[10],
    w11: values[11],
    w12: values[12],
    w13: values[13],
    w14: values[14],
    w15: values[15],
    w16: values[16],
    w17: values[17],
    w18: values[18],
    w19: values[19],
    w20: values[20],
  };
}

