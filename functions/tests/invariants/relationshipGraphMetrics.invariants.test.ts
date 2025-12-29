/**
 * RelationshipGraphMetrics invariants
 * Derived/regenerable analytics for a Relationship edge. Not user-specific.
 * Must include provenance and numeric-only derived signals.
 */

import { validRelationshipGraphMetrics } from "../fixtures/relationshipGraphMetrics.fixture.ts";

describe("RelationshipGraphMetrics invariants — identity", () => {
  it("must identify relationship and declare type", () => {
    const m: any = validRelationshipGraphMetrics;

    expect(typeof m.relationship_id).toBe("string");
    expect(m.type).toBe("relationship_graph_metrics");
  });
});

describe("RelationshipGraphMetrics invariants — graph context provenance", () => {
  it("must include graph_context with required provenance fields", () => {
    const gc: any = validRelationshipGraphMetrics.graph_context;

    expect(gc).toBeDefined();
    expect(typeof gc.library_id).toBe("string");
    expect(typeof gc.graph_version).toBe("string");
    expect(typeof gc.computed_at).toBe("string");
  });

  it("must not include user/session fields in graph_context", () => {
    const gc: any = validRelationshipGraphMetrics.graph_context;

    expect(gc.user_id).toBeUndefined();
    expect(gc.session_id).toBeUndefined();
  });
});

describe("RelationshipGraphMetrics invariants — embedding", () => {
  it("must include embedding with constrained kind and numeric vector", () => {
    const e: any = validRelationshipGraphMetrics.embedding;

    expect(e).toBeDefined();
    expect(["endpoint_mean", "endpoint_diff", "endpoint_concat"]).toContain(e.kind);

    expect(Array.isArray(e.vector)).toBe(true);
    expect(e.vector.length).toBeGreaterThan(0);
    for (const v of e.vector) {
      expect(typeof v).toBe("number");
    }
  });

  it("must not embed endpoint concept objects in embedding", () => {
    const e: any = validRelationshipGraphMetrics.embedding;

    expect(e.from_concept).toBeUndefined();
    expect(e.to_concept).toBeUndefined();
  });
});

describe("RelationshipGraphMetrics invariants — endpoints", () => {
  it("must include two distinct endpoint concept IDs", () => {
    const e: any = validRelationshipGraphMetrics.endpoints;

    expect(typeof e.from_concept_id).toBe("string");
    expect(typeof e.to_concept_id).toBe("string");
    expect(e.from_concept_id).not.toBe(e.to_concept_id);
  });
});

describe("RelationshipGraphMetrics invariants — edge topology", () => {
  it("must include descriptive edge topology fields", () => {
    const t: any = validRelationshipGraphMetrics.edge_topology;

    expect(["prerequisite", "unlocks", "reinforces", "contrasts", "causes", "associated_with"]).toContain(
      t.edge_type
    );
    expect(["forward", "bidirectional"]).toContain(t.directionality);

    expect(typeof t.from_node_degree).toBe("number");
    expect(typeof t.to_node_degree).toBe("number");
    expect(typeof t.bridge_score).toBe("number");
  });

  it("must not include queue actions or priorities", () => {
    const t: any = validRelationshipGraphMetrics.edge_topology;

    expect(t.priority).toBeUndefined();
    expect(t.bury).toBeUndefined();
    expect(t.delay_days).toBeUndefined();
  });
});

describe("RelationshipGraphMetrics invariants — semantic neighbors", () => {
  it("may include semantic_neighbors as references only with similarity in [0,1]", () => {
    const n: any = validRelationshipGraphMetrics.semantic_neighbors;

    expect(Array.isArray(n)).toBe(true);

    for (const neighbor of n) {
      expect(typeof neighbor.relationship_id).toBe("string");
      expect(typeof neighbor.similarity).toBe("number");
      expect(neighbor.similarity).toBeGreaterThanOrEqual(0);
      expect(neighbor.similarity).toBeLessThanOrEqual(1);

      // No embeddings/content nested
      expect((neighbor as any).embedding).toBeUndefined();
      expect((neighbor as any).relationship).toBeUndefined();
    }
  });
});

describe("RelationshipGraphMetrics invariants — status flags", () => {
  it("must include status.valid and status.deprecated as booleans", () => {
    const s: any = validRelationshipGraphMetrics.status;

    expect(s).toBeDefined();
    expect(typeof s.valid).toBe("boolean");
    expect(typeof s.deprecated).toBe("boolean");
  });
});

describe("RelationshipGraphMetrics invariants — forbidden cross-domain fields", () => {
  it("must not contain user, scheduling, performance, evidence, or AI narrative fields", () => {
    const m: any = validRelationshipGraphMetrics;

    // user/session identifiers
    expect(m.user_id).toBeUndefined();
    expect(m.session_id).toBeUndefined();

    // scheduling / mastery
    expect(m.state).toBeUndefined();
    expect(m.due).toBeUndefined();
    expect(m.stability).toBeUndefined();
    expect(m.mastery).toBeUndefined();

    // performance aggregates
    expect(m.my_avg_seconds).toBeUndefined();
    expect(m.avg_seconds).toBeUndefined();
    expect(m.accuracy_rate).toBeUndefined();

    // evidence/attempts
    expect(m.attempt_ids).toBeUndefined();
    expect(m.attempts).toBeUndefined();

    // AI narratives / explanations
    expect(m.explanation).toBeUndefined();
    expect(m.ai_reasoning).toBeUndefined();
    expect(m.narrative).toBeUndefined();
  });
});

describe("RelationshipGraphMetrics invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const m: any = validRelationshipGraphMetrics;

    expect(m.update).toBeUndefined();
    expect(m.recompute).toBeUndefined();
    expect(m.mutate).toBeUndefined();
  });

  it("must not contain any functions", () => {
    for (const value of Object.values(validRelationshipGraphMetrics)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
