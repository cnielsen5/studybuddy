/**
 * Normalization Tests
 */

import {
  normalizeStability,
  normalizeDifficulty,
  normalizeInterval,
  normalizeRetention,
  validateFSRSParameters,
  clamp,
  normalizePercentage,
  DEFAULT_FSRS_PARAMS,
} from "../../../src/core/scheduler/normalization";

describe("Normalization", () => {
  describe("normalizeStability", () => {
    it("should clamp stability to valid range", () => {
      const normalized = normalizeStability(1000.0);
      expect(normalized).toBeLessThanOrEqual(DEFAULT_FSRS_PARAMS.maxStability);
    });

    it("should handle negative values", () => {
      const normalized = normalizeStability(-10.0);
      expect(normalized).toBeGreaterThanOrEqual(DEFAULT_FSRS_PARAMS.minStability);
    });

    it("should handle NaN", () => {
      const normalized = normalizeStability(NaN);
      expect(normalized).toBe(DEFAULT_FSRS_PARAMS.initialStability);
    });

    it("should handle Infinity", () => {
      const normalized = normalizeStability(Infinity);
      expect(normalized).toBeLessThanOrEqual(DEFAULT_FSRS_PARAMS.maxStability);
    });
  });

  describe("normalizeDifficulty", () => {
    it("should clamp difficulty to valid range", () => {
      const normalized = normalizeDifficulty(100.0);
      expect(normalized).toBeLessThanOrEqual(DEFAULT_FSRS_PARAMS.maxDifficulty);
    });

    it("should handle negative values", () => {
      const normalized = normalizeDifficulty(-10.0);
      expect(normalized).toBeGreaterThanOrEqual(DEFAULT_FSRS_PARAMS.minDifficulty);
    });
  });

  describe("normalizeInterval", () => {
    it("should return at least 1 day", () => {
      expect(normalizeInterval(0)).toBe(1);
      expect(normalizeInterval(-5)).toBe(1);
    });

    it("should floor fractional days", () => {
      expect(normalizeInterval(5.9)).toBe(5);
    });
  });

  describe("normalizeRetention", () => {
    it("should clamp to 0-1 range", () => {
      expect(normalizeRetention(1.5)).toBe(1);
      expect(normalizeRetention(-0.5)).toBe(0);
      expect(normalizeRetention(0.75)).toBe(0.75);
    });
  });

  describe("validateFSRSParameters", () => {
    it("should validate correct parameters", () => {
      const result = validateFSRSParameters(DEFAULT_FSRS_PARAMS);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect invalid initialStability", () => {
      const params = { ...DEFAULT_FSRS_PARAMS, initialStability: -1 };
      const result = validateFSRSParameters(params);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should detect maxStability < minStability", () => {
      const params = { ...DEFAULT_FSRS_PARAMS, maxStability: 1, minStability: 10 };
      const result = validateFSRSParameters(params);
      expect(result.valid).toBe(false);
    });
  });

  describe("clamp", () => {
    it("should clamp values to range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("should handle NaN", () => {
      expect(clamp(NaN, 0, 10)).toBe(0);
    });
  });

  describe("normalizePercentage", () => {
    it("should handle 0-1 scale", () => {
      expect(normalizePercentage(0.75)).toBe(0.75);
    });

    it("should handle 0-100 scale", () => {
      expect(normalizePercentage(75)).toBe(0.75);
    });

    it("should clamp to 0-1", () => {
      expect(normalizePercentage(150)).toBe(1);
      expect(normalizePercentage(-50)).toBe(0);
    });
  });
});

