import { expectTimestampLike } from "../../helpers/timestamp";
import { validCardScheduleView } from "../../fixtures/views/cardScheduleView.fixture.ts";

describe("Projected view invariants — CardScheduleView", () => {
  it("must declare type === 'card_schedule_view'", () => {
    const v: any = validCardScheduleView;
    expect(v.type).toBe("card_schedule_view");
  });

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
