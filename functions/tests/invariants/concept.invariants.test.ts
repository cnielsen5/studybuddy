import { Concept } from "../../src/domain/concept";

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
    topic: "Pathogenesis"
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

//Structural Invariants
describe("Concept invariants — required structure", () => {
  it("must contain all top-level sections", () => {
    const c = VALID_CONCEPT;

    expect(c.metadata).toBeDefined();
    expect(c.editorial).toBeDefined();
    expect(c.hierarchy).toBeDefined();
    expect(c.content).toBeDefined();
    expect(c.dependency_graph).toBeDefined();
    expect(c.mastery_config).toBeDefined();
    expect(c.linked_content).toBeDefined();
  });

  it("must declare type === 'concept'", () => {
    expect(VALID_CONCEPT.type).toBe("concept");
  });
});

//Metadata Invariants
describe("Concept invariants — metadata", () => {
  it("must include version history", () => {
    expect(Array.isArray(VALID_CONCEPT.metadata.version_history)).toBe(true);
  });

  it("must not store difficulty or yield in metadata", () => {
    const meta: any = VALID_CONCEPT.metadata;

    expect(meta.difficulty).toBeUndefined();
    expect(meta.high_yield_score).toBeUndefined();
  });
});

//Editorial Invariants
describe("Concept invariants — editorial", () => {
  it("contains only advisory fields", () => {
    const e: any = VALID_CONCEPT.editorial;

    expect(e.difficulty).toBeDefined();
    expect(e.high_yield_score).toBeDefined();

    expect(e.prerequisites).toBeUndefined();
    expect(e.threshold).toBeUndefined();
    expect(e.mastery).toBeUndefined();
  });
});

//Dependency Graph Invariants
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
  });
});

//Mastery Config Invariants
describe("Concept invariants — mastery config", () => {
  it("contains only normative defaults", () => {
    const m: any = VALID_CONCEPT.mastery_config;

    expect(typeof m.threshold).toBe("number");
    expect(["fast", "standard", "slow"]).toContain(m.decay_rate);
    expect(typeof m.min_questions_correct).toBe("number");
  });

  it("must not contain user mastery or performance data", () => {
    const m: any = VALID_CONCEPT.mastery_config;

    expect(m.current_mastery).toBeUndefined();
    expect(m.confidence).toBeUndefined();
    expect(m.last_review).toBeUndefined();
  });
});

//Content Invariants
describe("Concept invariants — content", () => {
  it("must have title, definition, and summary", () => {
    const c = VALID_CONCEPT.content;

    expect(typeof c.title).toBe("string");
    expect(typeof c.definition).toBe("string");
    expect(typeof c.summary).toBe("string");
  });
});

//Linked Content Invariants
describe("Concept invariants — linked content", () => {
  it("explicitly lists linked cards and questions", () => {
    const l = VALID_CONCEPT.linked_content;

    expect(Array.isArray(l.card_ids)).toBe(true);
    expect(Array.isArray(l.question_ids)).toBe(true);
  });

  it("does not embed card or question objects", () => {
    const l: any = VALID_CONCEPT.linked_content;

    expect(l.cards).toBeUndefined();
    expect(l.questions).toBeUndefined();
  });
});

//Forbidden Fields
describe("Concept invariants — forbidden fields", () => {
  it("must not contain any user-specific or runtime state", () => {
    const c: any = VALID_CONCEPT;

    expect(c.schedule).toBeUndefined();
    expect(c.performance).toBeUndefined();
    expect(c.mastery).toBeUndefined();
    expect(c.primary_reason).toBeUndefined();
    expect(c.session_id).toBeUndefined();
  });
});

//Mutability Invariant
describe("Concept invariants — immutability", () => {
  it("must not define any mutator methods", () => {
    const c: any = VALID_CONCEPT;

    expect(c.setTitle).toBeUndefined();
    expect(c.update).toBeUndefined();
    expect(c.mutate).toBeUndefined();
  });
  
  it("contains no functions at all", () => {
  const c: any = VALID_CONCEPT;

  for (const value of Object.values(c)) {
    expect(typeof value).not.toBe("function");
  }
});

});

