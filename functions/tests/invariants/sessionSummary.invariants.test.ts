const validSessionSummary = {
  session_id: "session_0001",
  user_id: "user_123",
  type: "session_summary",

  started_at: "2025-11-08T09:00:00Z",
  ended_at: "2025-11-08T09:30:00Z",

  activity: {
    cards_reviewed: 24,
    questions_attempted: 12
  },

  outcomes: {
    correct_answers: 9,
    incorrect_answers: 3
  },

  timing: {
    total_seconds: 1800,
    avg_seconds_per_item: 50
  },

  references: {
    card_ids: ["card_0001", "card_0002"],
    question_ids: ["q_0001"],
    attempt_ids: ["attempt_0001", "attempt_0002"]
  }
};

describe("SessionSummary invariants — required structure", () => {
  it("must identify session and user and declare type", () => {
    const s: any = validSessionSummary;

    expect(typeof s.session_id).toBe("string");
    expect(typeof s.user_id).toBe("string");
    expect(s.type).toBe("session_summary");
  });

  it("must define session time window", () => {
    const s: any = validSessionSummary;

    expect(typeof s.started_at).toBe("string");
    expect(typeof s.ended_at).toBe("string");
  });
});

describe("SessionSummary invariants — activity & outcomes", () => {
  it("must summarize activity counts", () => {
    const a: any = validSessionSummary.activity;

    expect(typeof a.cards_reviewed).toBe("number");
    expect(typeof a.questions_attempted).toBe("number");
  });

  it("must summarize outcomes", () => {
    const o: any = validSessionSummary.outcomes;

    expect(typeof o.correct_answers).toBe("number");
    expect(typeof o.incorrect_answers).toBe("number");
  });
});

describe("SessionSummary invariants — timing aggregates", () => {
  it("may include timing aggregates", () => {
    const t: any = validSessionSummary.timing;

    expect(typeof t.total_seconds).toBe("number");
    expect(typeof t.avg_seconds_per_item).toBe("number");
  });

  it("must not include per-item timing", () => {
    const t: any = validSessionSummary.timing;

    expect(t.seconds_spent).toBeUndefined();
    expect(t.per_attempt).toBeUndefined();
  });
});

describe("SessionSummary invariants — references", () => {
  it("must reference interacted entities by ID only", () => {
    const r: any = validSessionSummary.references;

    expect(Array.isArray(r.card_ids)).toBe(true);
    expect(Array.isArray(r.question_ids)).toBe(true);
    expect(Array.isArray(r.attempt_ids)).toBe(true);
  });

  it("must not embed cards, questions, or attempts", () => {
    const s: any = validSessionSummary;

    expect(s.cards).toBeUndefined();
    expect(s.questions).toBeUndefined();
    expect(s.attempts).toBeUndefined();
  });
});

describe("SessionSummary invariants — forbidden fields", () => {
  it("must not contain scheduling or mastery state", () => {
    const s: any = validSessionSummary;

    expect(s.state).toBeUndefined();
    expect(s.due).toBeUndefined();
    expect(s.stability).toBeUndefined();
    expect(s.mastery).toBeUndefined();
  });

  it("must not contain performance or misconception objects", () => {
    const s: any = validSessionSummary;

    expect(s.performance).toBeUndefined();
    expect(s.misconceptions).toBeUndefined();
  });

  it("must not contain AI narratives or explanations", () => {
    const s: any = validSessionSummary;

    expect(s.explanation).toBeUndefined();
    expect(s.ai_summary).toBeUndefined();
    expect(s.narrative).toBeUndefined();
  });
});

describe("SessionSummary invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const s: any = validSessionSummary;

    expect(s.update).toBeUndefined();
    expect(s.recompute).toBeUndefined();
    expect(s.append).toBeUndefined();
  });

  it("must not contain any functions", () => {
    for (const value of Object.values(validSessionSummary)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
