const validCardPerformanceView = {
  card_id: "card_0001",
  library_id: "lib_abc",
  user_id: "user_123",

  total_reviews: 8,
  correct_reviews: 6,
  accuracy_rate: 0.75,
  avg_seconds: 12.5,

  streak: 3,
  max_streak: 5,

  last_reviewed_at: "2025-12-29T12:34:56.000Z",

  last_applied: { received_at: "2025-12-29T12:34:57.000Z", event_id: "evt_01JHXYZ..." },
  updated_at: "2025-12-29T12:34:57.000Z"
};

describe("Projected view invariants — CardPerformanceView", () => {
  it("must identify user/library/card", () => {
    const v: any = validCardPerformanceView;
    expect(typeof v.user_id).toBe("string");
    expect(typeof v.library_id).toBe("string");
    expect(typeof v.card_id).toBe("string");
  });

  it("must include derived aggregates with valid bounds", () => {
    const v: any = validCardPerformanceView;

    expect(typeof v.total_reviews).toBe("number");
    expect(typeof v.correct_reviews).toBe("number");
    expect(v.correct_reviews).toBeLessThanOrEqual(v.total_reviews);

    expect(typeof v.accuracy_rate).toBe("number");
    expect(v.accuracy_rate).toBeGreaterThanOrEqual(0);
    expect(v.accuracy_rate).toBeLessThanOrEqual(1);

    expect(typeof v.avg_seconds).toBe("number");
    expect(v.avg_seconds).toBeGreaterThanOrEqual(0);

    expect(typeof v.streak).toBe("number");
    expect(typeof v.max_streak).toBe("number");
    expect(v.max_streak).toBeGreaterThanOrEqual(v.streak);

    expectTimestampLike(v.last_reviewed_at);
  });

  it("must include last_applied cursor", () => {
    const c: any = validCardPerformanceView.last_applied;
    expectTimestampLike(c.received_at);
    expect(typeof c.event_id).toBe("string");
  });

  it("must not embed attempts or event logs", () => {
    const v: any = validCardPerformanceView;
    expect(v.attempts).toBeUndefined();
    expect(v.attempt_ids).toBeUndefined();
    expect(v.events).toBeUndefined();
  });

  it("must not embed Golden Master content", () => {
    const v: any = validCardPerformanceView;
    expect(v.front).toBeUndefined();
    expect(v.back).toBeUndefined();
    expect(v.content).toBeUndefined();
  });
});
