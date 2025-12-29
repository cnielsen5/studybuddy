import { expectTimestampLike } from "../../helpers/timestamp";

const validCardScheduleView = {
  card_id: "card_0001",
  library_id: "lib_abc",
  user_id: "user_123",

  due_at: "2025-12-30T09:00:00.000Z",
  stability: 3.2,
  difficulty: 5.1,
  interval_days: 3,
  state: "review",

  last_reviewed_at: "2025-12-29T12:34:56.000Z",
  last_grade: "good",

  last_applied: { received_at: "2025-12-29T12:34:57.000Z", event_id: "evt_01JHXYZ..." },
  updated_at: "2025-12-29T12:34:57.000Z"
};

describe("Projected view invariants — CardScheduleView", () => {
  it("must identify user/library/card", () => {
    const v: any = validCardScheduleView;
    expect(typeof v.user_id).toBe("string");
    expect(typeof v.library_id).toBe("string");
    expect(typeof v.card_id).toBe("string");
  });

  it("must include schedule fields with valid types", () => {
    const v: any = validCardScheduleView;

    expectTimestampLike(v.due_at);
    expect(typeof v.stability).toBe("number");
    expect(typeof v.difficulty).toBe("number");
    expect(typeof v.interval_days).toBe("number");
    expect(["new", "learning", "review", "relearning"]).toContain(v.state);

    expectTimestampLike(v.last_reviewed_at);
    expect(["again", "hard", "good", "easy"]).toContain(v.last_grade);
  });

  it("must include last_applied cursor", () => {
    const c: any = validCardScheduleView.last_applied;
    expect(c).toBeDefined();
    expectTimestampLike(c.received_at);
    expect(typeof c.event_id).toBe("string");
  });

  it("must not embed Golden Master content or event lists", () => {
    const v: any = validCardScheduleView;

    expect(v.front).toBeUndefined();
    expect(v.back).toBeUndefined();
    expect(v.content).toBeUndefined();

    expect(v.events).toBeUndefined();
    expect(v.event_ids).toBeUndefined();
    expect(v.attempt_ids).toBeUndefined();
  });

  it("must not include embeddings/graph metrics", () => {
    const v: any = validCardScheduleView;
    expect(v.semantic_embedding).toBeUndefined();
    expect(v.graph_context).toBeUndefined();
  });
});
