/**
 * Learning Science v1 library — cross-entity integrity checks
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { expectIdPrefix, expectIdPrefixes, ID_PREFIXES } from "../helpers/ids";
import {
  ALLOWED_CARD_TIERS,
  ALLOWED_PEDAGOGICAL_ROLES,
  ALLOWED_RELATIONSHIP_TYPES,
  ALLOWED_DIRECTIONALITY,
  ALLOWED_USAGE_ROLES,
  findOrphanDependencyPrerequisites,
  findPrerequisiteMismatches,
  findUnlockMismatches,
} from "../helpers/libraryConformance";

interface LibraryBundle {
  manifest: { id: string; name: string; version: string };
  concepts: Array<{
    id: string;
    type: string;
    dependency_graph: {
      prerequisites: string[];
      unlocks: string[];
      related_concepts: string[];
    };
    linked_content: { card_ids: string[]; question_ids: string[] };
  }>;
  relationships: Array<{
    relationship_id: string;
    endpoints: { from_concept_id: string; to_concept_id: string };
    relation: { relationship_type: string; directionality: string };
    linked_content: { relationship_card_ids: string[]; question_ids: string[] };
  }>;
  cards: Array<{
    id: string;
    type: string;
    relations: Record<string, unknown>;
    config: { card_type: string; pedagogical_role: string; card_tier?: string };
    content: { front: string; back: string };
  }>;
  questions: Array<{
    id: string;
    relations: { concept_ids: string[]; related_card_ids: string[] };
    content: { options: Array<{ id: string }>; correct_option_id: string };
    classification: { usage_role: string };
  }>;
}

const libraryPath = resolve(
  __dirname,
  "../../../content/libraries/learning-science-v1/library.json"
);

function loadLibrary(): LibraryBundle {
  const raw = readFileSync(libraryPath, "utf8");
  return JSON.parse(raw) as LibraryBundle;
}

describe("Learning Science v1 library bundle", () => {
  const lib = loadLibrary();
  const conceptIds = new Set(lib.concepts.map((c) => c.id));
  const cardIds = new Set(lib.cards.map((c) => c.id));
  const questionIds = new Set(lib.questions.map((q) => q.id));
  const relationshipIds = new Set(lib.relationships.map((r) => r.relationship_id));

  it("has expected scale", () => {
    expect(lib.manifest.id).toBe("lib_learning_science_v1");
    expect(lib.concepts).toHaveLength(7);
    expect(lib.relationships).toHaveLength(7);
    expect(lib.cards.length).toBeGreaterThanOrEqual(19);
    expect(lib.questions.length).toBeGreaterThanOrEqual(8);
  });

  it("all concept IDs use concept_ prefix", () => {
    for (const c of lib.concepts) {
      expectIdPrefix(c.id, ID_PREFIXES.CONCEPT, "Concept.id");
      expect(c.type).toBe("concept");
    }
  });

  it("concept linked_content references exist", () => {
    for (const c of lib.concepts) {
      expectIdPrefixes(c.linked_content.card_ids, ID_PREFIXES.CARD, `${c.id} card_ids`);
      expectIdPrefixes(c.linked_content.question_ids, ID_PREFIXES.QUESTION, `${c.id} question_ids`);
      for (const cardId of c.linked_content.card_ids) {
        expect(cardIds.has(cardId)).toBe(true);
      }
      for (const qId of c.linked_content.question_ids) {
        expect(questionIds.has(qId)).toBe(true);
      }
    }
  });

  it("dependency_graph references valid concepts", () => {
    for (const c of lib.concepts) {
      const dg = c.dependency_graph;
      for (const id of [...dg.prerequisites, ...dg.unlocks, ...dg.related_concepts]) {
        expect(conceptIds.has(id)).toBe(true);
      }
    }
  });

  it("relationship endpoints reference valid concepts", () => {
    for (const r of lib.relationships) {
      expectIdPrefix(r.relationship_id, ID_PREFIXES.RELATIONSHIP, "Relationship.id");
      expect(conceptIds.has(r.endpoints.from_concept_id)).toBe(true);
      expect(conceptIds.has(r.endpoints.to_concept_id)).toBe(true);
      for (const cardId of r.linked_content.relationship_card_ids) {
        expect(cardIds.has(cardId)).toBe(true);
      }
      for (const qId of r.linked_content.question_ids) {
        expect(questionIds.has(qId)).toBe(true);
      }
    }
  });

  it("cards reference valid concepts or relationships", () => {
    for (const card of lib.cards) {
      expectIdPrefix(card.id, ID_PREFIXES.CARD, "Card.id");
      const rel = card.relations as Record<string, string | string[] | undefined>;
      if (card.type === "card") {
        expect(typeof rel.concept_id).toBe("string");
        expect(conceptIds.has(rel.concept_id as string)).toBe(true);
      }
      if (card.type === "relationship_card") {
        expect(relationshipIds.has(rel.relationship_id as string)).toBe(true);
        expect(conceptIds.has(rel.from_concept_id as string)).toBe(true);
        expect(conceptIds.has(rel.to_concept_id as string)).toBe(true);
      }
      expect(card.content.front.length).toBeGreaterThan(0);
      expect(card.content.back.length).toBeGreaterThan(0);
    }
  });

  it("questions reference valid concepts and options", () => {
    for (const q of lib.questions) {
      expectIdPrefix(q.id, ID_PREFIXES.QUESTION, "Question.id");
      for (const cid of q.relations.concept_ids) {
        expect(conceptIds.has(cid)).toBe(true);
      }
      for (const cardId of q.relations.related_card_ids) {
        expect(cardIds.has(cardId)).toBe(true);
      }
      const optionIds = q.content.options.map((o) => o.id);
      expectIdPrefixes(optionIds, ID_PREFIXES.OPTION, `${q.id} options`);
      expect(optionIds).toContain(q.content.correct_option_id);
    }
  });

  it("every card is linked from at least one concept or relationship", () => {
    const linked = new Set<string>();
    for (const c of lib.concepts) {
      for (const id of c.linked_content.card_ids) linked.add(id);
    }
    for (const r of lib.relationships) {
      for (const id of r.linked_content.relationship_card_ids) linked.add(id);
    }
    for (const card of lib.cards) {
      expect(linked.has(card.id)).toBe(true);
    }
  });

  it("manifest has required identity fields", () => {
    expect(lib.manifest.id).toMatch(/^lib_/);
    expect(lib.manifest.name.length).toBeGreaterThan(0);
    expect(lib.manifest.version.length).toBeGreaterThan(0);
    const m = lib.manifest as Record<string, unknown>;
    expect(typeof m.description).toBe("string");
    expect(typeof m.domain).toBe("string");
    expect(typeof m.status).toBe("string");
  });

  it("relationship types and directionality use allowed enums", () => {
    for (const r of lib.relationships) {
      expect(ALLOWED_RELATIONSHIP_TYPES).toContain(r.relation.relationship_type);
      expect(ALLOWED_DIRECTIONALITY).toContain(r.relation.directionality);
    }
  });

  it("dependency_graph stays consistent with prerequisite relationships", () => {
    const prereqMismatches = findPrerequisiteMismatches(lib.concepts, lib.relationships);
    const orphanPrereqs = findOrphanDependencyPrerequisites(lib.concepts, lib.relationships);
    const unlockMismatches = findUnlockMismatches(lib.concepts, lib.relationships);
    expect(prereqMismatches).toEqual([]);
    expect(orphanPrereqs).toEqual([]);
    expect(unlockMismatches).toEqual([]);
  });

  it("every card has a valid card_tier and pedagogical_role", () => {
    for (const card of lib.cards) {
      expect(card.config.card_tier).toBeDefined();
      expect(ALLOWED_CARD_TIERS).toContain(card.config.card_tier);
      expect(ALLOWED_PEDAGOGICAL_ROLES).toContain(card.config.pedagogical_role);
    }
  });

  it("questions use allowed usage_role values", () => {
    for (const q of lib.questions) {
      expect(ALLOWED_USAGE_ROLES).toContain(q.classification.usage_role);
    }
  });
});
