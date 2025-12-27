import { Concept } from "../../src/domain/concept";

// ------------------------
// Concept (Golden Master)
// ------------------------

const VALID_CONCEPT: Concept = {
  id: "concept_0001",
  type: "concept",

  metadata: {
    created_at: "2025-11-03T00:00:00Z",
    updated_at: "2025-11-17T12:00:00Z",
    created_by: "system_admin",
    last_updated_by: "system_admin",
    version: "1.1",
    status: "published",
    tags: ["pathology"],
    search_keywords: ["fatty streak"],
    version_history: []
  },

  editorial: {
    difficulty: "basic",
    high_yield_score: 9
  },

  hierarchy: {
    library_id: "step1_usmle",
    domain: "Pathology",
    category: "Cardiovascular",
    subcategory: "Atherosclerosis",
    topic: "Pathogenesis",
    subtopic: "Early Lesions"
  },

  content: {
    title: "Fatty streak formation",
    definition: "Earliest lesion of atherosclerosis",
    summary: "Initial reversible lesion"
  },

  dependency_graph: {
    prerequisites: [],
    unlocks: [],
    child_concepts: [],
    semantic_relations: []
  },

  mastery_config: {
    threshold: 0.8,
    decay_rate: "standard",
    min_questions_correct: 1
  },

  media: [],
  references: [],
  linked_content: {
    card_ids: [],
    question_ids: []
  }
};

// Structural invariants
describe("Concept invariants — required structure", () => {
  it("must declare type === 'concept' and include id", () => {
    expect(typeof VALID_CONCEPT.id).toBe("string");
    expect(VALID_CONCEPT.type).toBe("concept");
  });

  it("must contain all top-level sections", () => {
    const c: any = VALID_CONCEPT;

    expect(c.metadata).toBeDefined();
    expect(c.editorial).toBeDefined();
    expect(c.hierarchy).toBeDefined();
    expect(c.content).toBeDefined();
    expect(c.dependency_graph).toBeDefined();
    expect(c.mastery_config).toBeDefined();
    expect(c.linked_content).toBeDefined();
  });
});

// Metadata invariants
describe("Concept invariants — metadata", () => {
  it("must include required metadata fields", () => {
    const m: any = VALID_CONCEPT.metadata;

    expect(typeof m.created_at).toBe("string");
    expect(typeof m.updated_at).toBe("string");
    expect(typeof m.created_by).toBe("string");
    expect(typeof m.last_updated_by).toBe("string");
    expect(typeof m.version).toBe("string");
    expect(typeof m.status).toBe("string");

    expect(Array.isArray(m.tags)).toBe(true);
    expect(Array.isArray(m.search_keywords)).toBe(true);
    expect(Array.isArray(m.version_history)).toBe(true);
  });

  it("version_history entries must have required shape", () => {
    const vh: any[] = VALID_CONCEPT.metadata.version_history;

    for (const entry of vh) {
      expect(typeof entry.version).toBe("string");
      expect(typeof entry.change_type).toBe("string");
      expect(typeof entry.changes).toBe("string");
      expect(typeof entry.date).toBe("string");
    }
  });

  it("must not store editorial fields inside metadata", () => {
    const meta: any = VALID_CONCEPT.metadata;
    expect(meta.difficulty).toBeUndefined();
    expect(meta.high_yield_score).toBeUndefined();
  });
});

// Editorial invariants
describe("Concept invariants — editorial", () => {
  it("contains only advisory fields", () => {
    const e: any = VALID_CONCEPT.editorial;

    expect(typeof e.difficulty).toBe("string");
    expect(typeof e.high_yield_score).toBe("number");

    // no structure/mastery/scheduling state
    expect(e.prerequisites).toBeUndefined();
    expect(e.threshold).toBeUndefined();
    expect(e.mastery).toBeUndefined();
    expect(e.due).toBeUndefined();
    expect(e.stability).toBeUndefined();
  });
});

// Hierarchy invariants
describe("Concept invariants — hierarchy", () => {
  it("must include full taxonomy fields", () => {
    const h: any = VALID_CONCEPT.hierarchy;

    expect(typeof h.library_id).toBe("string");
    expect(typeof h.domain).toBe("string");
    expect(typeof h.category).toBe("string");
    expect(typeof h.subcategory).toBe("string");
    expect(typeof h.topic).toBe("string");
    expect(typeof h.subtopic).toBe("string");
  });
});

// Content invariants
describe("Concept invariants — content", () => {
  it("must have title, definition, and summary", () => {
    const c: any = VALID_CONCEPT.content;

    expect(typeof c.title).toBe("string");
    expect(typeof c.definition).toBe("string");
    expect(typeof c.summary).toBe("string");
  });
});

// Dependency graph invariants
describe("Concept invariants — dependency graph", () => {
  it("contains only structural relationships", () => {
    const g: any = VALID_CONCEPT.dependency_graph;

    expect(Array.isArray(g.prerequisites)).toBe(true);
    expect(Array.isArray(g.unlocks)).toBe(true);
    expect(Array.isArray(g.child_concepts)).toBe(true);
    expect(Array.isArray(g.semantic_relations)).toBe(true);
  });

  it("does not contain scheduling or mastery state", () => {
    const g: any = VALID_CONCEPT.dependency_graph;

    expect(g.mastery).toBeUndefined();
    expect(g.due).toBeUndefined();
    expect(g.stability).toBeUndefined();
    expect(g.session_id).toBeUndefined();
    expect(g.user_id).toBeUndefined();
  });
});

// Mastery config invariants
describe("Concept invariants — mastery config", () => {
  it("contains only normative defaults", () => {
    const m: any = VALID_CONCEPT.mastery_config;

    expect(typeof m.threshold).toBe("number");
    expect(m.threshold).toBeGreaterThanOrEqual(0);
    expect(m.threshold).toBeLessThanOrEqual(1);

    expect(["fast", "standard", "slow"]).toContain(m.decay_rate);
    expect(typeof m.min_questions_correct).toBe("number");
    expect(m.min_questions_correct).toBeGreaterThanOrEqual(0);
  });

  it("must not contain user mastery or performance data", () => {
    const m: any = VALID_CONCEPT.mastery_config;

    expect(m.current_mastery).toBeUndefined();
    expect(m.confidence).toBeUndefined();
    expect(m.last_review).toBeUndefined();
    expect(m.user_id).toBeUndefined();
  });
});

// Linked content invariants
describe("Concept invariants — linked content", () => {
  it("explicitly lists linked cards and questions", () => {
    const l: any = VALID_CONCEPT.linked_content;

    expect(Array.isArray(l.card_ids)).toBe(true);
    expect(Array.isArray(l.question_ids)).toBe(true);
  });

  it("does not embed card or question objects", () => {
    const l: any = VALID_CONCEPT.linked_content;

    expect(l.cards).toBeUndefined();
    expect(l.questions).toBeUndefined();
  });
});

// Forbidden fields + immutability
describe("Concept invariants — forbidden fields & immutability", () => {
  it("must not contain any user-specific or runtime state", () => {
    const c: any = VALID_CONCEPT;

    expect(c.schedule).toBeUndefined();
    expect(c.performance).toBeUndefined();
    expect(c.mastery).toBeUndefined();
    expect(c.primary_reason).toBeUndefined();
    expect(c.session_id).toBeUndefined();
    expect(c.user_id).toBeUndefined();
  });

  it("must not define any mutator methods and contain no functions at all", () => {
    const c: any = VALID_CONCEPT;

    expect(c.setTitle).toBeUndefined();
    expect(c.update).toBeUndefined();
    expect(c.mutate).toBeUndefined();

    for (const value of Object.values(c)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
