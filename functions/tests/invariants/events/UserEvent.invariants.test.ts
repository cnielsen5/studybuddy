/**
 * UserEvent invariants — envelope (event-sourced truth)
 * - Immutable, append-only
 * - User-scoped
 * - No aggregates, no scheduler state, no embedded content
 */

const validUserEvent = {
  event_id: "evt_01JHXYZABCDEF1234567890", // ULID/UUIDv7 as string
  type: "card_reviewed",

  user_id: "user_123",
  library_id: "lib_abc",

  occurred_at: "2025-12-29T12:34:56.000Z",  // client timestamp
  received_at: "2025-12-29T12:34:57.000Z",  // server timestamp string in tests
  device_id: "dev_001",

  entity: { kind: "card", id: "card_0001" },

  payload: { grade: "good", seconds_spent: 18 },

  schema_version: "1.0"
};

describe("UserEvent invariants — required structure", () => {
  it("must identify event, user, library, and device", () => {
    const e: any = validUserEvent;

    expect(typeof e.event_id).toBe("string");
    expect(typeof e.user_id).toBe("string");
    expect(typeof e.library_id).toBe("string");
    expect(typeof e.device_id).toBe("string");
  });

  it("must include type and schema_version", () => {
    const e: any = validUserEvent;

    expect(typeof e.type).toBe("string");
    expect(typeof e.schema_version).toBe("string");
  });

  it("must include occurred_at and received_at timestamps (strings)", () => {
    const e: any = validUserEvent;

    expect(typeof e.occurred_at).toBe("string");
    expect(typeof e.received_at).toBe("string");

    // light ISO sanity checks (not full validation)
    expect(e.occurred_at.includes("T")).toBe(true);
    expect(e.occurred_at.endsWith("Z")).toBe(true);
  });

  it("must include entity {kind, id}", () => {
    const ent: any = validUserEvent.entity;

    expect(ent).toBeDefined();
    expect(typeof ent.kind).toBe("string");
    expect(typeof ent.id).toBe("string");
  });

  it("must include payload object", () => {
    const e: any = validUserEvent;
    expect(e.payload).toBeDefined();
    expect(typeof e.payload).toBe("object");
    expect(Array.isArray(e.payload)).toBe(false);
  });
});

describe("UserEvent invariants — forbidden cross-domain fields", () => {
  it("must not contain scheduler state or derived performance aggregates", () => {
    const e: any = validUserEvent;

    // scheduler fields
    expect(e.due).toBeUndefined();
    expect(e.stability).toBeUndefined();
    expect(e.state).toBeUndefined();
    expect(e.interval_days).toBeUndefined();

    // aggregates
    expect(e.accuracy_rate).toBeUndefined();
    expect(e.avg_seconds).toBeUndefined();
    expect(e.total_attempts).toBeUndefined();
    expect(e.streak).toBeUndefined();
  });

  it("must not embed Golden Master content or graph analytics", () => {
    const e: any = validUserEvent;

    // GM content
    expect(e.stem).toBeUndefined();
    expect(e.options).toBeUndefined();
    expect(e.explanations).toBeUndefined();
    expect(e.definition).toBeUndefined();

    // graph metrics / embeddings
    expect(e.semantic_embedding).toBeUndefined();
    expect(e.graph_context).toBeUndefined();
    expect(e.centrality).toBeUndefined();
    expect(e.degrees).toBeUndefined();
  });

  it("must not contain free-text AI reasoning or narrative fields", () => {
    const e: any = validUserEvent;

    expect(e.explanation).toBeUndefined();
    expect(e.ai_reasoning).toBeUndefined();
    expect(e.narrative).toBeUndefined();
  });
});

describe("UserEvent invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const e: any = validUserEvent;

    expect(e.update).toBeUndefined();
    expect(e.mutate).toBeUndefined();
    expect(e.rewrite).toBeUndefined();
  });

  it("must not contain any functions (top-level)", () => {
    for (const value of Object.values(validUserEvent)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
