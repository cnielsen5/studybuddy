const validCardPerformanceMetrics = {
  card_id: "card_0001",
  user_id: "user_123",

  total_attempts: 8,
  correct_attempts: 6,

  accuracy_rate: 0.75,

  avg_seconds: 12.5,
  my_avg_seconds: 14.0,

  last_attempt_at: "2025-11-08T09:05:00Z",

  streak: 3,
  max_streak: 5
};

describe("CardPerformanceMetrics invariants — required structure", () => {
  it("must identify card and user", () => {
    const m: any = validCardPerformanceMetrics;

    expect(typeof m.card_id).toBe("string");
    expect(typeof m.user_id).toBe("string");
  });
});

describe("CardPerformanceMetrics invariants — aggregate metrics", () => {
  it("must track total and correct attempts", () => {
    const m: any = validCardPerformanceMetrics;

    expect(typeof m.total_attempts).toBe("number");
    expect(typeof m.correct_attempts).toBe("number");
  });

  it("must include an accuracy rate", () => {
    const m: any = validCardPerformanceMetrics;

    expect(typeof m.accuracy_rate).toBe("number");
    expect(m.accuracy_rate).toBeGreaterThanOrEqual(0);
    expect(m.accuracy_rate).toBeLessThanOrEqual(1);
  });
});

describe("CardPerformanceMetrics invariants — timing metrics", () => {
  it("may include average timing metrics", () => {
    const m: any = validCardPerformanceMetrics;

    expect(typeof m.avg_seconds).toBe("number");
    expect(typeof m.my_avg_seconds).toBe("number");
  });
});

describe("CardPerformanceMetrics invariants — recency & streaks", () => {
  it("may include recency and streak information", () => {
    const m: any = validCardPerformanceMetrics;

    expect(typeof m.last_attempt_at).toBe("string");
    expect(typeof m.streak).toBe("number");
    expect(typeof m.max_streak).toBe("number");
  });
});

describe("CardPerformanceMetrics invariants — forbidden fields", () => {
  it("must not contain scheduling state", () => {
    const m: any = validCardPerformanceMetrics;

    expect(m.state).toBeUndefined();
    expect(m.due).toBeUndefined();
    expect(m.stability).toBeUndefined();
    expect(m.difficulty).toBeUndefined();
  });

  it("must not contain raw attempts or answers", () => {
    const m: any = validCardPerformanceMetrics;

    expect(m.attempts).toBeUndefined();
    expect(m.answers).toBeUndefined();
    expect(m.last_answer).toBeUndefined();
  });

  it("must not contain semantic or pedagogical data", () => {
    const m: any = validCardPerformanceMetrics;

    expect(m.card_type).toBeUndefined();
    expect(m.pedagogical_role).toBeUndefined();
    expect(m.concept_id).toBeUndefined();
  });

  it("must not contain explanations or AI reasoning", () => {
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
