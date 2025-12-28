const validCardScheduleState = {
  card_id: "card_0001",
  user_id: "user_123",
  type: "card_schedule_state",

  state: 2, // 0=New, 1=Learning, 2=Review, 3=Relearning

  due: "2025-12-20T14:00:00Z",
  last_review: "2025-11-08T09:00:00Z",

  stability: 45.5,
  difficulty: 7.2,

  elapsed_days: 12,
  scheduled_days: 45,

  reps: 5,
  lapses: 0
};

describe("CardScheduleState invariants — required structure", () => {
  it("must identify card and user and declare type", () => {
    const s: any = validCardScheduleState;

    expect(typeof s.card_id).toBe("string");
    expect(typeof s.user_id).toBe("string");
    expect(s.type).toBe("card_schedule_state");
  });

  it("must declare a valid state enum", () => {
    const s: any = validCardScheduleState;

    expect([0, 1, 2, 3]).toContain(s.state);
  });
});

describe("CardScheduleState invariants — scheduling fields", () => {
  it("must include due and last_review timestamps", () => {
    const s: any = validCardScheduleState;

    expect(typeof s.due).toBe("string");
    expect(typeof s.last_review).toBe("string");
  });

  it("must include stability and difficulty", () => {
    const s: any = validCardScheduleState;

    expect(typeof s.stability).toBe("number");
    expect(typeof s.difficulty).toBe("number");
  });

  it("must include interval counters", () => {
    const s: any = validCardScheduleState;

    expect(typeof s.elapsed_days).toBe("number");
    expect(typeof s.scheduled_days).toBe("number");
  });
});

describe("CardScheduleState invariants — repetition tracking", () => {
  it("must track reps and lapses", () => {
    const s: any = validCardScheduleState;

    expect(typeof s.reps).toBe("number");
    expect(typeof s.lapses).toBe("number");
  });
});

describe("CardScheduleState invariants — forbidden fields", () => {
  it("must not contain performance metrics", () => {
    const s: any = validCardScheduleState;

    expect(s.avg_seconds).toBeUndefined();
    expect(s.my_avg_seconds).toBeUndefined();
    expect(s.confidence).toBeUndefined();
  });

  it("must not contain question or attempt data", () => {
    const s: any = validCardScheduleState;

    expect(s.attempts).toBeUndefined();
    expect(s.last_attempt).toBeUndefined();
    expect(s.errorType).toBeUndefined();
  });

  it("must not contain pedagogical or semantic data", () => {
    const s: any = validCardScheduleState;

    expect(s.pedagogical_role).toBeUndefined();
    expect(s.card_type).toBeUndefined();
    expect(s.concept_id).toBeUndefined();
  });

  it("must not contain explanations or AI metadata", () => {
    const s: any = validCardScheduleState;

    expect(s.primary_reason).toBeUndefined();
    expect(s.explanation).toBeUndefined();
    expect(s.ai_notes).toBeUndefined();
  });
});

describe("CardScheduleState invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const s: any = validCardScheduleState;

    expect(s.update).toBeUndefined();
    expect(s.applyFSRS).toBeUndefined();
    expect(s.adjust).toBeUndefined();
  });

  it("must not contain functions", () => {
    for (const value of Object.values(validCardScheduleState)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
