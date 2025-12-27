/**
 * CardPerformanceMetrics invariants (rich schema)
 * User-specific aggregated performance metrics for a card.
 * Must not contain scheduling state or raw attempt evidence.
 */

const validCardPerformanceMetrics = {
  user_id: "user_123",
  card_id: "card_0001",
  type: "card_performance_metrics",
  _comment:
    "User-specific, aggregated performance metrics for a card. Derived from attempts. Not raw evidence. Not scheduling.",

  graph_context: {
    library_id: "step1_usmle"
  },

  attempt_counts: {
    total_attempts: 8,
    correct_attempts: 6,
    incorrect_attempts: 2,
    skipped_attempts: 0,
    last_attempt_at: "2025-11-08T09:05:00Z"
  },

  accuracy: {
    accuracy_rate: 0.75,
    recent_accuracy_rate: 0.8,
    window_size_attempts: 5
  },

  timing: {
    avg_seconds: 12.5,
    my_avg_seconds: 14.0,
    ema_alpha: 0.2,
    last_seconds: 11.2,
    p50_seconds: 12.0,
    p90_seconds: 20.0
  },

  streaks: {
    current_correct_streak: 3,
    max_correct_streak: 5,
    current_incorrect_streak: 0,
    max_incorrect_streak: 2
  },

  error_profile: {
    misconception: 1,
    retrieval_failure: 0,
    misreading: 1,
    strategy_error: 0,
    time_pressure: 0
  },

  confidence: {
    avg_confidence: 0.62,
    confidence_mismatch_rate: 0.25,
    calibration_score: 0.14
  },

  flags: {
    is_struggling: false,
    is_consistently_fast: false,
    is_consistently_slow: false,
    high_variance_timing: true
  },

  provenance: {
    derived_from: {
      attempt_count: 8,
      last_attempt_id: "attempt_000089"
    },
    updated_at: "2025-11-08T09:06:00Z"
  },

  status: {
    valid: true,
    deprecated: false
  }
};

describe("CardPerformanceMetrics invariants — identity", () => {
  it("must identify user and card and declare type", () => {
    const m: any = validCardPerformanceMetrics;

    expect(typeof m.user_id).toBe("string");
    expect(typeof m.card_id).toBe("string");
    expect(m.type).toBe("card_performance_metrics");
  });
});

describe("CardPerformanceMetrics invariants — attempt counts", () => {
  it("must include attempt_counts with non-negative integers", () => {
    const a: any = validCardPerformanceMetrics.attempt_counts;

    expect(a).toBeDefined();
    for (const k of ["total_attempts", "correct_attempts", "incorrect_attempts", "skipped_attempts"]) {
      expect(typeof a[k]).toBe("number");
      expect(a[k]).toBeGreaterThanOrEqual(0);
    }
    expect(typeof a.last_attempt_at).toBe("string");
  });

  it("must maintain internal count consistency", () => {
    const a: any = validCardPerformanceMetrics.attempt_counts;

    expect(a.correct_attempts).toBeLessThanOrEqual(a.total_attempts);
    expect(a.incorrect_attempts).toBeLessThanOrEqual(a.total_attempts);
    expect(a.skipped_attempts).toBeLessThanOrEqual(a.total_attempts);

    // totals must reconcile
    expect(a.correct_attempts + a.incorrect_attempts + a.skipped_attempts).toBe(a.total_attempts);
  });
});

describe("CardPerformanceMetrics invariants — accuracy", () => {
  it("must include accuracy rates bounded in [0,1]", () => {
    const acc: any = validCardPerformanceMetrics.accuracy;

    expect(acc).toBeDefined();
    expect(typeof acc.accuracy_rate).toBe("number");
    expect(acc.accuracy_rate).toBeGreaterThanOrEqual(0);
    expect(acc.accuracy_rate).toBeLessThanOrEqual(1);

    expect(typeof acc.recent_accuracy_rate).toBe("number");
    expect(acc.recent_accuracy_rate).toBeGreaterThanOrEqual(0);
    expect(acc.recent_accuracy_rate).toBeLessThanOrEqual(1);

    expect(typeof acc.window_size_attempts).toBe("number");
    expect(acc.window_size_attempts).toBeGreaterThanOrEqual(0);
  });

  it("accuracy_rate should be consistent with attempt_counts (within tolerance)", () => {
    const a: any = validCardPerformanceMetrics.attempt_counts;
    const acc: any = validCardPerformanceMetrics.accuracy;

    const denom = a.total_attempts - a.skipped_attempts;
    const expected = denom === 0 ? 0 : a.correct_attempts / denom;

    // allow minor float differences
    expect(Math.abs(acc.accuracy_rate - expected)).toBeLessThan(1e-9);
  });
});

describe("CardPerformanceMetrics invariants — timing", () => {
  it("must include timing metrics as non-negative numbers", () => {
    const t: any = validCardPerformanceMetrics.timing;

    expect(t).toBeDefined();

    for (const k of ["avg_seconds", "my_avg_seconds", "last_seconds", "p50_seconds", "p90_seconds"]) {
      expect(typeof t[k]).toBe("number");
      expect(t[k]).toBeGreaterThanOrEqual(0);
    }

    expect(typeof t.ema_alpha).toBe("number");
    expect(t.ema_alpha).toBeGreaterThanOrEqual(0);
    expect(t.ema_alpha).toBeLessThanOrEqual(1);
  });

  it("percentiles must be ordered (p50 <= p90)", () => {
    const t: any = validCardPerformanceMetrics.timing;
    expect(t.p50_seconds).toBeLessThanOrEqual(t.p90_seconds);
  });
});

describe("CardPerformanceMetrics invariants — streaks", () => {
  it("must include streak counters as non-negative numbers", () => {
    const s: any = validCardPerformanceMetrics.streaks;

    expect(s).toBeDefined();
    for (const k of [
      "current_correct_streak",
      "max_correct_streak",
      "current_incorrect_streak",
      "max_incorrect_streak"
    ]) {
      expect(typeof s[k]).toBe("number");
      expect(s[k]).toBeGreaterThanOrEqual(0);
    }

    expect(s.current_correct_streak).toBeLessThanOrEqual(s.max_correct_streak);
    expect(s.current_incorrect_streak).toBeLessThanOrEqual(s.max_incorrect_streak);
  });
});

describe("CardPerformanceMetrics invariants — error profile", () => {
  it("must include non-negative error type counts", () => {
    const e: any = validCardPerformanceMetrics.error_profile;

    expect(e).toBeDefined();
    for (const k of [
      "misconception",
      "retrieval_failure",
      "misreading",
      "strategy_error",
      "time_pressure"
    ]) {
      expect(typeof e[k]).toBe("number");
      expect(e[k]).toBeGreaterThanOrEqual(0);
    }
  });

  it("error_profile counts must reconcile with incorrect_attempts (recommended)", () => {
    const a: any = validCardPerformanceMetrics.attempt_counts;
    const e: any = validCardPerformanceMetrics.error_profile;

    const sum =
      e.misconception +
      e.retrieval_failure +
      e.misreading +
      e.strategy_error +
      e.time_pressure;

    expect(sum).toBe(a.incorrect_attempts);
  });
});

describe("CardPerformanceMetrics invariants — confidence (optional)", () => {
  it("if confidence exists, rates must be bounded in [0,1] and scores numeric", () => {
    const c: any = validCardPerformanceMetrics.confidence;
    if (c === undefined) return;

    expect(typeof c.avg_confidence).toBe("number");
    expect(c.avg_confidence).toBeGreaterThanOrEqual(0);
    expect(c.avg_confidence).toBeLessThanOrEqual(1);

    expect(typeof c.confidence_mismatch_rate).toBe("number");
    expect(c.confidence_mismatch_rate).toBeGreaterThanOrEqual(0);
    expect(c.confidence_mismatch_rate).toBeLessThanOrEqual(1);

    expect(typeof c.calibration_score).toBe("number");
  });
});

describe("CardPerformanceMetrics invariants — provenance & status", () => {
  it("must include provenance with updated_at and attempt_count", () => {
    const p: any = validCardPerformanceMetrics.provenance;

    expect(p).toBeDefined();
    expect(typeof p.updated_at).toBe("string");

    expect(p.derived_from).toBeDefined();
    expect(typeof p.derived_from.attempt_count).toBe("number");
    expect(p.derived_from.attempt_count).toBeGreaterThanOrEqual(0);
  });

  it("must include status flags", () => {
    const s: any = validCardPerformanceMetrics.status;

    expect(s).toBeDefined();
    expect(typeof s.valid).toBe("boolean");
    expect(typeof s.deprecated).toBe("boolean");
  });
});

describe("CardPerformanceMetrics invariants — forbidden fields", () => {
  it("must not contain scheduling state (anywhere)", () => {
    const m: any = validCardPerformanceMetrics;

    expect(m.state).toBeUndefined();
    expect(m.due).toBeUndefined();
    expect(m.stability).toBeUndefined();
    expect(m.difficulty).toBeUndefined();

    // also forbid them nested (common drift)
    expect(m.attempt_counts?.due).toBeUndefined();
    expect(m.provenance?.due).toBeUndefined();
  });

  it("must not contain raw attempts or answers", () => {
    const m: any = validCardPerformanceMetrics;

    expect(m.attempts).toBeUndefined();
    expect(m.answers).toBeUndefined();
    expect(m.last_answer).toBeUndefined();
    expect(m.raw).toBeUndefined();
    expect(m.events).toBeUndefined();
  });

  it("must not contain semantic or pedagogical ownership data", () => {
    const m: any = validCardPerformanceMetrics;

    expect(m.concept_id).toBeUndefined();
    expect(m.concept_ids).toBeUndefined();
    expect(m.card_type).toBeUndefined();
    expect(m.pedagogical_role).toBeUndefined();
  });

  it("must not contain PrimaryReason / AI explanations (those belong to attempts/session logs)", () => {
    const m: any = validCardPerformanceMetrics;

    expect(m.primary_reason).toBeUndefined();
    expect(m.explanation).toBeUndefined();
    expect(m.ai_notes).toBeUndefined();
  });
});

describe("CardPerformanceMetrics invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const m: any = validCardPerformanceMetrics;

    expect(m.update).toBeUndefined();
    expect(m.recalculate).toBeUndefined();
    expect(m.applyAttempt).toBeUndefined();
  });

  it("must not contain any functions", () => {
    for (const value of Object.values(validCardPerformanceMetrics)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
