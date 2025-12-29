/**
 * Card invariants (Golden Master)
 * - Enforces editorial vs metadata separation
 * - Enforces conditional cloze_data rules
 * - Prevents scheduling/performance/evidence leakage
 */

import { validCard, validBasicCard, validClozeCard } from "../fixtures/card.fixture.ts";

describe("Card invariants — required structure", () => {
  it("must contain all top-level sections", () => {
    const c: any = validCard;

    expect(c.id).toBeDefined();
    expect(c.type).toBe("card");
    expect(c.relations).toBeDefined();
    expect(c.config).toBeDefined();
    expect(c.content).toBeDefined();
    expect(c.media).toBeDefined();
    expect(c.metadata).toBeDefined();
    expect(c.editorial).toBeDefined();
  });

  it("metadata must include governance fields", () => {
    const m: any = validCard.metadata;

    expect(typeof m.created_at).toBe("string");
    expect(typeof m.updated_at).toBe("string");
    expect(typeof m.created_by).toBe("string");
    expect(typeof m.status).toBe("string");
    expect(typeof m.version).toBe("string");
  });

  it("editorial must include advisory fields", () => {
    const e: any = validCard.editorial;

    expect(Array.isArray(e.tags)).toBe(true);
    expect(typeof e.difficulty).toBe("string");
  });
});

describe("Card invariants — relations", () => {
  it("must belong to exactly one concept", () => {
    const r: any = validCard.relations;

    expect(typeof r.concept_id).toBe("string");
  });

  it("may reference related questions by ID only", () => {
    const r: any = validCard.relations;

    expect(Array.isArray(r.related_question_ids)).toBe(true);
    for (const id of r.related_question_ids) {
      expect(typeof id).toBe("string");
    }
  });

  it("must not embed concept or question objects", () => {
    const r: any = validCard.relations;

    expect(r.concept).toBeUndefined();
    expect(r.concepts).toBeUndefined();
    expect(r.questions).toBeUndefined();
    expect(r.related_questions).toBeUndefined();
  });
});

describe("Card invariants — config", () => {
  it("must declare a valid card_type", () => {
    const type = validCard.config.card_type;
    expect(["basic", "cloze", "image_occlusion", "relationship"]).toContain(type);
  });

  it("must declare a valid pedagogical_role", () => {
    const role = validCard.config.pedagogical_role;
    expect([
      "recognition",
      "recall",
      "synthesis",
      "application",
      "analysis",
      "integration"
    ]).toContain(role);
  });

  it("must not contain scheduling directives", () => {
    const cfg: any = validCard.config;

    expect(cfg.due).toBeUndefined();
    expect(cfg.interval).toBeUndefined();
    expect(cfg.priority).toBeUndefined();
    expect(cfg.state).toBeUndefined();
  });
});

describe("Card invariants — content", () => {
  it("must define front and back strings", () => {
    const c: any = validCard.content;

    expect(typeof c.front).toBe("string");
    expect(typeof c.back).toBe("string");
  });

  it("must not embed logic or functions", () => {
    for (const value of Object.values(validCard.content)) {
      expect(typeof value).not.toBe("function");
    }
  });
});

describe("Card invariants — conditional cloze_data rules", () => {
  it("if card_type === 'cloze', content.cloze_data must be present and well-formed", () => {
    const c: any = validClozeCard;

    expect(c.config.card_type).toBe("cloze");

    // must exist
    expect(c.content.cloze_data).toBeDefined();
    expect(c.content.cloze_data).not.toBeNull();

    // must have template_text
    expect(typeof c.content.cloze_data.template_text).toBe("string");
    expect(c.content.cloze_data.template_text.length).toBeGreaterThan(0);

    // must have cloze_fields array
    expect(Array.isArray(c.content.cloze_data.cloze_fields)).toBe(true);
    expect(c.content.cloze_data.cloze_fields.length).toBeGreaterThan(0);

    const fields = c.content.cloze_data.cloze_fields;
    const fieldIds = new Set(fields.map((x: any) => x.field_id));

    // each cloze field must have a field_id and either answer or link_to
    for (const f of fields) {
      expect(typeof f.field_id).toBe("string");
      expect(f.field_id.length).toBeGreaterThan(0);

      const hasAnswer = typeof f.answer === "string" && f.answer.length > 0;
      const hasLink = typeof f.link_to === "string" && f.link_to.length > 0;

      expect(hasAnswer || hasLink).toBe(true);

      if (hasLink) {
        // must not self-link
        expect(f.link_to).not.toBe(f.field_id);
        // must link to an existing field_id
        expect(fieldIds.has(f.link_to)).toBe(true);
      }
    }
  });

  it("if card_type !== 'cloze', content.cloze_data must be null or undefined", () => {
    const c: any = validBasicCard;

    expect(c.config.card_type).not.toBe("cloze");
    expect(c.content.cloze_data === null || c.content.cloze_data === undefined).toBe(true);
  });

  it("if card_type !== 'cloze', cloze-only fields must not appear elsewhere", () => {
    const c: any = validBasicCard;

    expect(c.config.card_type).not.toBe("cloze");

    expect(c.content.template_text).toBeUndefined();
    expect(c.content.cloze_fields).toBeUndefined();
  });
});

describe("Card invariants — metadata vs editorial separation", () => {
  it("metadata must not contain editorial fields", () => {
    const m: any = validCard.metadata;

    expect(m.tags).toBeUndefined();
    expect(m.difficulty).toBeUndefined();
    expect(m.high_yield_score).toBeUndefined();
  });

  it("editorial must not contain governance fields", () => {
    const e: any = validCard.editorial;

    expect(e.created_at).toBeUndefined();
    expect(e.updated_at).toBeUndefined();
    expect(e.created_by).toBeUndefined();
    expect(e.status).toBeUndefined();
    expect(e.version).toBeUndefined();
  });
});

describe("Card invariants — forbidden runtime state", () => {
  it("must not contain scheduling state", () => {
    const c: any = validCard;

    expect(c.state).toBeUndefined();
    expect(c.due).toBeUndefined();
    expect(c.stability).toBeUndefined();
    expect(c.difficulty).toBeUndefined();
  });

  it("must not contain performance metrics", () => {
    const c: any = validCard;

    expect(c.reps).toBeUndefined();
    expect(c.lapses).toBeUndefined();
    expect(c.avg_seconds).toBeUndefined();
    expect(c.my_avg_seconds).toBeUndefined();
    expect(c.accuracy_rate).toBeUndefined();
  });

  it("must not contain attempt history", () => {
    const c: any = validCard;

    expect(c.attempts).toBeUndefined();
    expect(c.history).toBeUndefined();
    expect(c.attempt_ids).toBeUndefined();
  });
});

describe("Card invariants — metadata discipline", () => {
  it("metadata must not contain scheduling or performance data", () => {
    const m: any = validCard.metadata;

    expect(m.state).toBeUndefined();
    expect(m.due).toBeUndefined();
    expect(m.reps).toBeUndefined();
    expect(m.lapses).toBeUndefined();
    expect(m.avg_seconds).toBeUndefined();
    expect(m.my_avg_seconds).toBeUndefined();
  });

  it("metadata must not contain semantic content", () => {
    const m: any = validCard.metadata;

    expect(m.front).toBeUndefined();
    expect(m.back).toBeUndefined();
    expect(m.content).toBeUndefined();
  });
});

describe("Card invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const c: any = validCard;

    expect(c.update).toBeUndefined();
    expect(c.setContent).toBeUndefined();
    expect(c.mutate).toBeUndefined();
  });

  it("must not contain any functions at top level", () => {
    for (const value of Object.values(validCard)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
