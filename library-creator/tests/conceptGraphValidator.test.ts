import {
  removeConceptFromDraft,
  validateConceptGraphDraft,
} from "../src/extraction/conceptGraphValidator.js";
import { extractConceptGraphHeuristic } from "../src/extraction/heuristicConceptExtractor.js";
import { loadDomainProfile } from "../src/profiles/loadProfile.js";
import type { LibraryCreationIntent } from "../src/types/intent.js";
import { normalizeParsedSection } from "../src/types/parsedSource.js";

const baseIntent: LibraryCreationIntent = {
  libraryTitle: "Anatomy Chapter 1",
  domain: "Anatomy and Physiology",
  purpose: "exam_prep",
  audience: {
    level: "undergrad",
    priorKnowledge: ["basic biology"],
    targetDepth: "working",
  },
  scopeBoundaries: [],
  externalAugmentationAllowed: false,
  similarityThreshold: 0.9,
};

function makeDraft() {
  return extractConceptGraphHeuristic(
    {
      sourceType: "website",
      sections: [
        normalizeParsedSection({
          title: "Define homeostasis",
          body: "Define homeostasis and explain its importance to normal human functioning.",
          sequence: 1,
          level: 0,
          blockType: "objective_item",
          structuralHeadingTrail: ["Introduction"],
        }),
        normalizeParsedSection({
          title: "Feedback loops",
          body: "Feedback loops regulate homeostasis through sensors, control centers, and effectors.",
          sequence: 2,
          level: 0,
          blockType: "objective_item",
          structuralHeadingTrail: ["Introduction"],
        }),
      ],
      rawText: "",
    },
    baseIntent,
    loadDomainProfile("anatomy")
  );
}

describe("validateConceptGraphDraft", () => {
  it("accepts a well-formed draft", () => {
    const result = validateConceptGraphDraft(makeDraft());
    expect(result.valid).toBe(true);
    expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("flags broken prerequisite references", () => {
    const draft = makeDraft();
    const result = validateConceptGraphDraft({
      ...draft,
      suggestedPrerequisites: [
        { from_concept_id: "concept_missing", to_concept_id: draft.concepts[0].id },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.message.includes("missing concept"))).toBe(
      true
    );
  });
});

describe("removeConceptFromDraft", () => {
  it("removes a concept and cleans dependency edges", () => {
    const draft = makeDraft();
    const targetId = draft.concepts[0].id;
    const updated = removeConceptFromDraft(draft, targetId);

    expect(updated.concepts.some((c) => c.id === targetId)).toBe(false);
    expect(
      updated.concepts.every(
        (c) =>
          !c.dependency_graph.prerequisites.includes(targetId) &&
          !c.dependency_graph.unlocks.includes(targetId)
      )
    ).toBe(true);
    expect(
      updated.suggestedPrerequisites.every(
        (edge) =>
          edge.from_concept_id !== targetId && edge.to_concept_id !== targetId
      )
    ).toBe(true);
  });

  it("throws when concept id is unknown", () => {
    expect(() => removeConceptFromDraft(makeDraft(), "concept_unknown")).toThrow(
      "Concept not found"
    );
  });
});
