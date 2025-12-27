/**
 * Question invariants (Golden Master)
 * Purpose: Freeze static, read-only questions used for assessment.
 * Must be: global (shared), content-only (no user runtime state), structurally valid.
 */

const VALID_QUESTION = {
  id: "q_0001",
  type: "question",

  relations: {
    concept_ids: ["concept_0001", "concept_0099_pharmacology"],
    related_card_ids: ["card_0001"]
  },

  source: {
    origin: "validated", // public | validated | ai_generated
    provider: "Step1_Internal",
    subscription_required: false
  },

  classification: {
    question_type: "mcq", // mcq | select_all | matching
    usage_role: "generic", // generic | diagnostic | establishment | targeted | misconception_directed
    cognitive_level: "diagnosis" // pathophysiology | diagnosis | management | mechanism
  },

  content: {
    stem: "A 15-year-old boy’s autopsy reveals lipid-laden macrophages...",
    options: [
      { id: "opt_A", text: "Fibrous cap formation" },
      { id: "opt_B", text: "Fatty streak" }
    ],
    correct_option_id: "opt_B"
  },

  explanations: {
    general: "Fatty streaks are the earliest visible lesions...",
    distractors: {
      opt_A: "Fibrous caps appear later..."
    }
  },

  editorial: {
    difficulty: "easy",
    tags: ["pathology", "cardio"]
  },

  media: [],
  references: [],

  metadata: {
    created_at: "2025-11-03T00:00:00Z",
    updated_at: "2025-11-03T00:00:00Z",
    created_by: "system_admin",
    last_updated_by: "system_admin",
    version: "1.0",
    status: "published"
  }
};

describe("Question invariants — required structure", () => {
  it("must identify question and declare type === 'question'", () => {
    const q: any = VALID_QUESTION;
    expect(typeof q.id).toBe("string");
    expect(q.type).toBe("question");
  });

  it("must contain all top-level sections", () => {
    const q: any = VALID_QUESTION;
    expect(q.relations).toBeDefined();
    expect(q.source).toBeDefined();
    expect(q.classification).toBeDefined();
    expect(q.content).toBeDefined();
    expect(q.explanations).toBeDefined();
    expect(q.editorial).toBeDefined();
    expect(q.metadata).toBeDefined();
  });
});

describe("Question invariants — relations", () => {
  it("must include concept_ids and related_card_ids as arrays of strings", () => {
    const r: any = VALID_QUESTION.relations;

    expect(Array.isArray(r.concept_ids)).toBe(true);
    for (const id of r.concept_ids) expect(typeof id).toBe("string");

    expect(Array.isArray(r.related_card_ids)).toBe(true);
    for (const id of r.related_card_ids) expect(typeof id).toBe("string");
  });

  it("must not embed concept or card objects", () => {
    const r: any = VALID_QUESTION.relations;
    expect(r.concepts).toBeUndefined();
    expect(r.cards).toBeUndefined();
  });
});

describe("Question invariants — source", () => {
  it("must include provenance fields and valid origin enum", () => {
    const s: any = VALID_QUESTION.source;

    expect(["public", "validated", "ai_generated"]).toContain(s.origin);
    expect(typeof s.provider).toBe("string");
    expect(typeof s.subscription_required).toBe("boolean");
  });

  it("must not include user/session context", () => {
    const s: any = VALID_QUESTION.source;
    expect(s.user_id).toBeUndefined();
    expect(s.session_id).toBeUndefined();
  });
});

describe("Question invariants — classification", () => {
  it("must include valid classification enums", () => {
    const c: any = VALID_QUESTION.classification;

    expect(["mcq", "select_all", "matching"]).toContain(c.question_type);
    expect([
      "generic",
      "diagnostic",
      "establishment",
      "targeted",
      "misconception_directed"
    ]).toContain(c.usage_role);
    expect(["pathophysiology", "diagnosis", "management", "mechanism"]).toContain(
      c.cognitive_level
    );
  });

  it("must not include scheduling or mastery directives", () => {
    const c: any = VALID_QUESTION.classification;
    expect(c.priority).toBeUndefined();
    expect(c.bury).toBeUndefined();
    expect(c.delay_days).toBeUndefined();
    expect(c.mastery).toBeUndefined();
  });
});

describe("Question invariants — content (mcq)", () => {
  it("must include stem/options/correct_option_id", () => {
    const c: any = VALID_QUESTION.content;

    expect(typeof c.stem).toBe("string");
    expect(Array.isArray(c.options)).toBe(true);
    expect(typeof c.correct_option_id).toBe("string");
  });

  it("options must be objects with id/text strings", () => {
    const opts: any[] = VALID_QUESTION.content.options;

    expect(opts.length).toBeGreaterThanOrEqual(2);
    for (const opt of opts) {
      expect(typeof opt.id).toBe("string");
      expect(typeof opt.text).toBe("string");
    }
  });

  it("correct_option_id must match an option.id", () => {
    const c: any = VALID_QUESTION.content;
    const ids = new Set((c.options as any[]).map((o) => o.id));
    expect(ids.has(c.correct_option_id)).toBe(true);
  });

  it("must not contain user answers or attempt history", () => {
    const c: any = VALID_QUESTION.content;
    expect(c.selected_option_id).toBeUndefined();
    expect(c.user_answer).toBeUndefined();
    expect(c.attempt_ids).toBeUndefined();
  });
});

describe("Question invariants — explanations", () => {
  it("must include general explanation", () => {
    const e: any = VALID_QUESTION.explanations;
    expect(typeof e.general).toBe("string");
  });

  it("distractors, if present, must be a map of option_id -> string", () => {
    const e: any = VALID_QUESTION.explanations;
    if (e.distractors !== undefined) {
      expect(typeof e.distractors).toBe("object");
      for (const [k, v] of Object.entries(e.distractors)) {
        expect(typeof k).toBe("string");
        expect(typeof v).toBe("string");
      }
    }
  });

  it("must not include AI chain-of-thought or user-specific rationale fields", () => {
    const e: any = VALID_QUESTION.explanations;
    expect(e.ai_reasoning).toBeUndefined();
    expect(e.user_rationale).toBeUndefined();
  });
});

describe("Question invariants — editorial", () => {
  it("contains only advisory fields", () => {
    const e: any = VALID_QUESTION.editorial;

    expect(typeof e.difficulty).toBe("string");
    expect(Array.isArray(e.tags)).toBe(true);

    // no mastery/scheduling
    expect(e.due).toBeUndefined();
    expect(e.stability).toBeUndefined();
    expect(e.mastery).toBeUndefined();
  });
});

describe("Question invariants — media/references", () => {
  it("media entries, if present, must have id/type/url/caption", () => {
    const m: any[] = VALID_QUESTION.media;
    expect(Array.isArray(m)).toBe(true);

    for (const item of m) {
      expect(typeof item.id).toBe("string");
      expect(typeof item.type).toBe("string");
      expect(typeof item.url).toBe("string");
      if (item.caption !== undefined) expect(typeof item.caption).toBe("string");
    }
  });

  it("references entries, if present, must be objects", () => {
    const r: any[] = VALID_QUESTION.references;
    expect(Array.isArray(r)).toBe(true);

    for (const ref of r) {
      expect(typeof ref).toBe("object");
      expect(ref.user_id).toBeUndefined();
      expect(ref.session_id).toBeUndefined();
    }
  });
});

describe("Question invariants — metadata", () => {
  it("must include required metadata fields", () => {
    const m: any = VALID_QUESTION.metadata;

    expect(typeof m.created_at).toBe("string");
    expect(typeof m.updated_at).toBe("string");
    expect(typeof m.created_by).toBe("string");
    expect(typeof m.last_updated_by).toBe("string");
    expect(typeof m.version).toBe("string");
    expect(typeof m.status).toBe("string");
  });

  it("must not contain performance or runtime state", () => {
    const m: any = VALID_QUESTION.metadata;
    expect(m.accuracy_rate).toBeUndefined();
    expect(m.avg_seconds).toBeUndefined();
    expect(m.last_attempt_at).toBeUndefined();
    expect(m.user_id).toBeUndefined();
  });
});

describe("Question invariants — forbidden fields & immutability", () => {
  it("must not contain any user-specific or runtime state", () => {
    const q: any = VALID_QUESTION;

    expect(q.user_id).toBeUndefined();
    expect(q.session_id).toBeUndefined();

    expect(q.schedule).toBeUndefined();
    expect(q.performance).toBeUndefined();
    expect(q.mastery).toBeUndefined();

    expect(q.attempts).toBeUndefined();
    expect(q.attempt_ids).toBeUndefined();
  });

  it("must not define mutator methods and contain no functions at all (top-level)", () => {
    const q: any = VALID_QUESTION;

    expect(q.update).toBeUndefined();
    expect(q.mutate).toBeUndefined();

    for (const value of Object.values(q)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
