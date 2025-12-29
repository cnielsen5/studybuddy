import { expectTimestampLike } from "../../helpers/timestamp";
import { validMisconceptionEdgeView } from "../../fixtures/views/misconceptionEdgeView.fixture.ts";

describe("Projected view invariants — MisconceptionEdgeView", () => {
  it("must declare type === 'misconception_edge_view'", () => {
    const v: any = validMisconceptionEdgeView;
    expect(v.type).toBe("misconception_edge_view");
  });

  it("must identify user/library/misconception", () => {
    const v: any = validMisconceptionEdgeView;

    expect(typeof v.user_id).toBe("string");
    expect(typeof v.library_id).toBe("string");
    expect(typeof v.misconception_id).toBe("string");
  });

  it("must include concept endpoints and directed error info", () => {
    const v: any = validMisconceptionEdgeView;

    expect(typeof v.concept_a_id).toBe("string");
    expect(typeof v.concept_b_id).toBe("string");
    expect(v.concept_a_id).not.toBe(v.concept_b_id);

    expect(v.direction).toBeDefined();
    expect(typeof v.direction.from).toBe("string");
    expect(typeof v.direction.to).toBe("string");
    expect(["reversal", "inversion", "swapped_endpoints"]).toContain(v.direction.error_type);
  });

  it("must include strength bounds and status enum", () => {
    const v: any = validMisconceptionEdgeView;

    expect(typeof v.strength).toBe("number");
    expect(v.strength).toBeGreaterThanOrEqual(0);
    expect(v.strength).toBeLessThanOrEqual(1);

    expect(["active", "weakening", "resolved"]).toContain(v.status);
  });

  it("must include observed timestamps and last_applied cursor", () => {
    const v: any = validMisconceptionEdgeView;

    expectTimestampLike(v.first_observed_at);
    expectTimestampLike(v.last_observed_at);

    expectTimestampLike(v.last_applied.received_at);
    expect(typeof v.last_applied.event_id).toBe("string");
  });

  it("must not embed raw event lists, attempts, or narratives", () => {
    const v: any = validMisconceptionEdgeView;

    expect(v.events).toBeUndefined();
    expect(v.event_ids).toBeUndefined();
    expect(v.question_attempt_ids).toBeUndefined(); // refs belong in events/logs, not views

    expect(v.explanation).toBeUndefined();
    expect(v.ai_reasoning).toBeUndefined();
    expect(v.narrative).toBeUndefined();
  });

  it("must not embed Golden Master content or graph metrics", () => {
    const v: any = validMisconceptionEdgeView;

    expect(v.content).toBeUndefined();
    expect(v.semantic_embedding).toBeUndefined();
    expect(v.graph_context).toBeUndefined();
  });
});
