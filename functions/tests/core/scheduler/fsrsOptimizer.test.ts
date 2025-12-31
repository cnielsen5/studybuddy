/**
 * FSRS Optimizer Tests
 */

import {
  predictRetention,
  calculateOptimizationMetrics,
  suggestParameterAdjustments,
  applyParameterAdjustments,
  validateParameterBounds,
  exportParameters,
  importParameters,
  ReviewHistoryEntry,
} from "../../../src/core/scheduler/fsrsOptimizer";
import { DEFAULT_FSRS_V6_PARAMS, FSRSv6Parameters } from "../../../src/core/scheduler/fsrs";
import { ReviewGrade } from "../../../src/core/scheduler/fsrs";

describe("FSRS Optimizer", () => {
  describe("predictRetention", () => {
    it("should return 1.0 for elapsedDays = 0", () => {
      const retention = predictRetention(10.0, 0);
      expect(retention).toBe(1.0);
    });

    it("should decrease retention as elapsed days increase", () => {
      const stability = 10.0;
      const retention1 = predictRetention(stability, 1);
      const retention5 = predictRetention(stability, 5);
      const retention10 = predictRetention(stability, 10);

      expect(retention1).toBeGreaterThan(retention5);
      expect(retention5).toBeGreaterThan(retention10);
    });

    it("should return values between 0 and 1", () => {
      const retention = predictRetention(10.0, 100);
      expect(retention).toBeGreaterThanOrEqual(0);
      expect(retention).toBeLessThanOrEqual(1);
    });
  });

  describe("calculateOptimizationMetrics", () => {
    it("should calculate metrics for review history", () => {
      const history: ReviewHistoryEntry[] = [
        {
          card_id: "card_001",
          timestamp: new Date().toISOString(),
          grade: "good",
          elapsedDays: 5,
          stabilityBefore: 10.0,
          difficultyBefore: 5.0,
          stabilityAfter: 12.0,
          difficultyAfter: 4.5,
        },
        {
          card_id: "card_002",
          timestamp: new Date().toISOString(),
          grade: "again",
          elapsedDays: 3,
          stabilityBefore: 8.0,
          difficultyBefore: 6.0,
          stabilityAfter: 4.0,
          difficultyAfter: 7.0,
        },
      ];

      const metrics = calculateOptimizationMetrics(history);

      expect(metrics.reviewCount).toBe(2);
      expect(metrics.mse).toBeGreaterThanOrEqual(0);
      expect(metrics.mae).toBeGreaterThanOrEqual(0);
      expect(metrics.correlation).toBeGreaterThanOrEqual(-1);
      expect(metrics.correlation).toBeLessThanOrEqual(1);
    });

    it("should handle empty history", () => {
      const metrics = calculateOptimizationMetrics([]);

      expect(metrics.reviewCount).toBe(0);
      expect(metrics.mse).toBe(0);
      expect(metrics.mae).toBe(0);
      expect(metrics.correlation).toBe(0);
    });
  });

  describe("suggestParameterAdjustments", () => {
    it("should suggest adjustments for high 'again' rate", () => {
      const history: ReviewHistoryEntry[] = Array.from({ length: 10 }, (_, i) => ({
        card_id: `card_${i}`,
        timestamp: new Date().toISOString(),
        grade: "again" as ReviewGrade,
        elapsedDays: 5,
        stabilityBefore: 10.0,
        difficultyBefore: 5.0,
        stabilityAfter: 5.0,
        difficultyAfter: 6.0,
      }));

      const suggestions = suggestParameterAdjustments(history);

      // Should suggest increasing initial stability if again rate is high
      expect(suggestions.w0).toBeDefined();
      expect(suggestions.w0).toBeGreaterThan(DEFAULT_FSRS_V6_PARAMS.w0);
    });

    it("should suggest adjustments for high 'easy' rate", () => {
      const history: ReviewHistoryEntry[] = Array.from({ length: 10 }, (_, i) => ({
        card_id: `card_${i}`,
        timestamp: new Date().toISOString(),
        grade: "easy" as ReviewGrade,
        elapsedDays: 5,
        stabilityBefore: 10.0,
        difficultyBefore: 5.0,
        stabilityAfter: 15.0,
        difficultyAfter: 4.0,
      }));

      const suggestions = suggestParameterAdjustments(history);

      // Should suggest decreasing initial difficulty if easy rate is high
      if (suggestions.w1) {
        expect(suggestions.w1).toBeLessThan(DEFAULT_FSRS_V6_PARAMS.w1);
      }
    });

    it("should handle empty history", () => {
      const suggestions = suggestParameterAdjustments([]);
      expect(Object.keys(suggestions)).toHaveLength(0);
    });
  });

  describe("applyParameterAdjustments", () => {
    it("should apply adjustments to base parameters", () => {
      const base = DEFAULT_FSRS_V6_PARAMS;
      const adjustments = { w0: 0.5, w1: 2.0 };

      const result = applyParameterAdjustments(base, adjustments);

      expect(result.w0).toBe(0.5);
      expect(result.w1).toBe(2.0);
      expect(result.w2).toBe(base.w2); // Unchanged
    });
  });

  describe("validateParameterBounds", () => {
    it("should validate correct parameters", () => {
      const result = validateParameterBounds(DEFAULT_FSRS_V6_PARAMS);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it("should warn about invalid w0", () => {
      const params: FSRSv6Parameters = {
        ...DEFAULT_FSRS_V6_PARAMS,
        w0: 20.0, // Too high
      };

      const result = validateParameterBounds(params);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("should warn if w1 >= w2", () => {
      const params: FSRSv6Parameters = {
        ...DEFAULT_FSRS_V6_PARAMS,
        w1: 5.0,
        w2: 4.0, // w2 < w1
      };

      const result = validateParameterBounds(params);
      expect(result.warnings.some((w) => w.includes("w1 should be < w2"))).toBe(true);
    });

    it("should warn about invalid decay parameters", () => {
      const params: FSRSv6Parameters = {
        ...DEFAULT_FSRS_V6_PARAMS,
        w19: 0.2,
        w20: 0.1, // w20 < w19
      };

      const result = validateParameterBounds(params);
      expect(result.warnings.some((w) => w.includes("w19 should be <= w20"))).toBe(true);
    });
  });

  describe("exportParameters", () => {
    it("should export parameters as array", () => {
      const exported = exportParameters(DEFAULT_FSRS_V6_PARAMS);

      expect(exported).toHaveLength(21);
      expect(exported[0]).toBe(DEFAULT_FSRS_V6_PARAMS.w0);
      expect(exported[20]).toBe(DEFAULT_FSRS_V6_PARAMS.w20);
    });
  });

  describe("importParameters", () => {
    it("should import parameters from array", () => {
      const values = Array.from({ length: 21 }, (_, i) => i * 0.1);
      const imported = importParameters(values);

      expect(imported.w0).toBe(0);
      expect(imported.w1).toBe(0.1);
      expect(imported.w20).toBe(2.0);
    });

    it("should throw error for wrong array length", () => {
      expect(() => importParameters([1, 2, 3])).toThrow();
      expect(() => importParameters(Array.from({ length: 20 }, () => 0))).toThrow();
    });
  });
});

