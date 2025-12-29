import { expectTimestampLike } from "../../helpers/timestamp";
import { validCardPerformanceView } from "../../fixtures/views/cardPerformanceView.fixture.ts";
import {
  expectLastAppliedCursor,
  expectUpdatedAt,
  expectViewForbiddenFieldsAbsent
} from "../../helpers/invariantHelpers.ts";

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

  it("must include required last_applied cursor { received_at, event_id }", () => {
    expectLastAppliedCursor(validCardPerformanceView.last_applied, "CardPerformanceView.last_applied");
  });

  it("must include required updated_at field", () => {
    expectUpdatedAt(validCardPerformanceView, "CardPerformanceView");
  });

  it("must not embed Golden Master content, event lists, embeddings, or narratives", () => {
    expectViewForbiddenFieldsAbsent(validCardPerformanceView, "CardPerformanceView");
  });
});
