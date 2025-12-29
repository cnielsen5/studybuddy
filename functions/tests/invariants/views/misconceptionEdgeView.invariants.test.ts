import { expectTimestampLike } from "../../helpers/timestamp";

const validMisconceptionEdgeView = {
  misconception_id: "mis_edge_001",
  library_id: "lib_abc",
  user_id: "user_123",

  concept_a_id: "concept_attention",
  concept_b_id: "concept_working_memory",
  direction: { from: "concept_attention", to: "concept_working_memory", error_type: "reversal" },

  misconception_type: "directionality",
  strength: 0.63,
  status: "active",

  first_observed_at: "2024-12-02T10:04:00.000Z",
  last_observed_at: "2025-01-14T18:22:00.000Z",

  evidence: {
    relationship_failures: 2,
    high_confidence_errors: 3,
    probe_confirmations: 1
  },

  last_applied: { received_at: "2025-12-29T12:34:57.000Z", event_id: "evt_01JHXYZ..." },
  updated_at: "2025-12-29T12:34:57.000Z"
};

describe("Projected view invariants — MisconceptionEdgeView", () => {
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
