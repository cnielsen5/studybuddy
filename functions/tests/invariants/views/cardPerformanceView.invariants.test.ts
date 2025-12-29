import { expectTimestampLike } from "../../helpers/timestamp";
import { validCardPerformanceView } from "../../fixtures/views/cardPerformanceView.fixture.ts";

describe("Projected view invariants — CardPerformanceView", () => {
  it("must declare type === 'card_performance_view'", () => {
    const v: any = validCardPerformanceView;
    expect(v.type).toBe("card_performance_view");
  });

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
