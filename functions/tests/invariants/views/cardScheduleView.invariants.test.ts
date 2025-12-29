import { expectTimestampLike } from "../../helpers/timestamp";
import { validCardScheduleView } from "../../fixtures/views/cardScheduleView.fixture.ts";
import {
  expectLastAppliedCursor,
  expectUpdatedAt,
  expectViewForbiddenFieldsAbsent
} from "../../helpers/invariantHelpers.ts";

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

  it("must include required last_applied cursor { received_at, event_id }", () => {
    expectLastAppliedCursor(validCardScheduleView.last_applied, "CardScheduleView.last_applied");
  });

  it("must include required updated_at field", () => {
    expectUpdatedAt(validCardScheduleView, "CardScheduleView");
  });

  it("must not embed Golden Master content, event lists, embeddings, or narratives", () => {
    expectViewForbiddenFieldsAbsent(validCardScheduleView, "CardScheduleView");
  });
});
