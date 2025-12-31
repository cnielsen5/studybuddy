/**
 * Concept Graph Tests
 */

import {
  buildConceptGraph,
  getAllPrerequisites,
  getAllUnlocks,
  hasPrerequisitesMastered,
  findReadyConcepts,
  findLearningPath,
  hasCycle,
  ConceptGraph,
} from "../../../src/core/graph/conceptGraph";
import { Concept } from "../../../src/domain/concept";

describe("Concept Graph", () => {
  const createConcept = (overrides: Partial<Concept> = {}): Concept => ({
    id: "concept_001",
    type: "concept",
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "user_001",
      last_updated_by: "user_001",
      version: 1,
      status: "published",
      tags: [],
      difficulty: "basic",
      high_yield_score: 0.5,
    },
    hierarchy: {
      library_id: "lib_001",
      domain: "domain",
      category: "category",
      subcategory: "subcategory",
      topic: "topic",
    },
    content: {
      title: "Concept",
      definition: "Definition",
      summary: "Summary",
    },
    dependency_graph: {
      prerequisites: [],
      unlocks: [],
      related_concepts: [],
      child_concepts: [],
    },
    mastery_config: {
      threshold: 0.8,
      decay_rate: "standard",
      min_questions_correct: 3,
    },
    linked_content: {
      card_ids: [],
      question_ids: [],
    },
    ...overrides,
  });

  describe("buildConceptGraph", () => {
    it("should build graph from concepts", () => {
      const concepts = [
        createConcept({ id: "concept_1" }),
        createConcept({ id: "concept_2" }),
      ];

      const graph = buildConceptGraph(concepts);

      expect(graph.nodes.size).toBe(2);
      expect(graph.nodes.has("concept_1")).toBe(true);
      expect(graph.nodes.has("concept_2")).toBe(true);
    });

    it("should build reverse edges for unlocks", () => {
      const concepts = [
        createConcept({
          id: "concept_1",
          dependency_graph: {
            prerequisites: ["concept_2"],
            unlocks: [],
            related_concepts: [],
            child_concepts: [],
          },
        }),
        createConcept({ id: "concept_2" }),
      ];

      const graph = buildConceptGraph(concepts);

      const node2 = graph.nodes.get("concept_2");
      expect(node2?.unlocks).toContain("concept_1");
    });
  });

  describe("getAllPrerequisites", () => {
    it("should get transitive prerequisites", () => {
      const concepts = [
        createConcept({
          id: "concept_1",
          dependency_graph: {
            prerequisites: ["concept_2"],
            unlocks: [],
            related_concepts: [],
            child_concepts: [],
          },
        }),
        createConcept({
          id: "concept_2",
          dependency_graph: {
            prerequisites: ["concept_3"],
            unlocks: [],
            related_concepts: [],
            child_concepts: [],
          },
        }),
        createConcept({ id: "concept_3" }),
      ];

      const graph = buildConceptGraph(concepts);
      const prerequisites = getAllPrerequisites(graph, "concept_1");

      expect(prerequisites).toContain("concept_2");
      expect(prerequisites).toContain("concept_3");
    });
  });

  describe("hasPrerequisitesMastered", () => {
    it("should return true when all prerequisites are mastered", () => {
      const concepts = [
        createConcept({
          id: "concept_1",
          dependency_graph: {
            prerequisites: ["concept_2"],
            unlocks: [],
            related_concepts: [],
            child_concepts: [],
          },
        }),
        createConcept({ id: "concept_2" }),
      ];

      const graph = buildConceptGraph(concepts);
      const mastered = new Set(["concept_2"]);

      expect(hasPrerequisitesMastered(graph, "concept_1", mastered)).toBe(true);
    });

    it("should return false when prerequisites are not mastered", () => {
      const concepts = [
        createConcept({
          id: "concept_1",
          dependency_graph: {
            prerequisites: ["concept_2"],
            unlocks: [],
            related_concepts: [],
            child_concepts: [],
          },
        }),
        createConcept({ id: "concept_2" }),
      ];

      const graph = buildConceptGraph(concepts);
      const mastered = new Set<string>();

      expect(hasPrerequisitesMastered(graph, "concept_1", mastered)).toBe(false);
    });
  });

  describe("findReadyConcepts", () => {
    it("should find concepts with mastered prerequisites", () => {
      const concepts = [
        createConcept({
          id: "concept_1",
          dependency_graph: {
            prerequisites: ["concept_2"],
            unlocks: [],
            related_concepts: [],
            child_concepts: [],
          },
        }),
        createConcept({ id: "concept_2" }),
        createConcept({ id: "concept_3" }),
      ];

      const graph = buildConceptGraph(concepts);
      const mastered = new Set(["concept_2"]);

      const ready = findReadyConcepts(graph, mastered);

      expect(ready).toContain("concept_1");
      expect(ready).toContain("concept_3");
    });
  });

  describe("hasCycle", () => {
    it("should detect cycles", () => {
      const concepts = [
        createConcept({
          id: "concept_1",
          dependency_graph: {
            prerequisites: ["concept_2"],
            unlocks: [],
            related_concepts: [],
            child_concepts: [],
          },
        }),
        createConcept({
          id: "concept_2",
          dependency_graph: {
            prerequisites: ["concept_1"], // Cycle!
            unlocks: [],
            related_concepts: [],
            child_concepts: [],
          },
        }),
      ];

      const graph = buildConceptGraph(concepts);

      expect(hasCycle(graph)).toBe(true);
    });

    it("should return false for acyclic graph", () => {
      const concepts = [
        createConcept({
          id: "concept_1",
          dependency_graph: {
            prerequisites: ["concept_2"],
            unlocks: [],
            related_concepts: [],
            child_concepts: [],
          },
        }),
        createConcept({ id: "concept_2" }),
      ];

      const graph = buildConceptGraph(concepts);

      expect(hasCycle(graph)).toBe(false);
    });
  });
});

