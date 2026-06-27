import { extractConceptGraphHeuristic } from "../src/extraction/heuristicConceptExtractor.js";
import { mapRelationshipsHeuristic } from "../src/relationships/heuristicRelationshipMapper.js";
import { validateRelationshipsDraft } from "../src/relationships/relationshipValidator.js";
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
    resolutionRange: { min: 2, max: 4 },
  },
  scopeBoundaries: [],
  externalAugmentationAllowed: false,
  similarityThreshold: 0.9,
};

describe("mapRelationshipsHeuristic", () => {
  it("creates prerequisite relationships aligned with concept dependency_graph", () => {
    const conceptGraph = extractConceptGraphHeuristic(
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

    const [first, second] = conceptGraph.concepts;
    first.hierarchy.subcategory = "Objectives";
    second.hierarchy.subcategory = "Objectives";
    second.dependency_graph.prerequisites = [first.id];
    first.dependency_graph.unlocks = [second.id];
    conceptGraph.suggestedPrerequisites = [
      {
        from_concept_id: first.id,
        to_concept_id: second.id,
        reason: "Sequential learning objective",
      },
    ];

    const profile = loadDomainProfile("anatomy");
    const { draft, concepts } = mapRelationshipsHeuristic({
      conceptGraph,
      intent: baseIntent,
      domainProfile: profile,
    });

    const prerequisiteEdges = draft.relationships.filter(
      (r) => r.relation.relationship_type === "prerequisite"
    );
    expect(prerequisiteEdges.length).toBeGreaterThan(0);

    const validation = validateRelationshipsDraft(draft, concepts);
    expect(validation.valid).toBe(true);
    expect(validation.issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("adds semantic reinforces edges when relationship density is enabled", () => {
    const conceptGraph = extractConceptGraphHeuristic(
      {
        sourceType: "text",
        sections: [
          normalizeParsedSection({
            title: "Cells",
            body: "Cells are the basic structural unit of living organisms.",
            sequence: 1,
            level: 0,
            blockType: "paragraph",
            structuralHeadingTrail: ["Intro"],
          }),
          normalizeParsedSection({
            title: "Tissues",
            body: "Tissues are groups of similar cells working together.",
            sequence: 2,
            level: 0,
            blockType: "paragraph",
            structuralHeadingTrail: ["Intro"],
          }),
        ],
        rawText: "",
      },
      baseIntent,
      loadDomainProfile("mixed")
    );

    for (const concept of conceptGraph.concepts) {
      concept.hierarchy.category = "Body Organization";
      concept.hierarchy.subcategory = "Levels of organization";
    }

    const profile = {
      ...loadDomainProfile("anatomy"),
      relationshipDensity: 1,
    };

    const { draft } = mapRelationshipsHeuristic({
      conceptGraph,
      intent: baseIntent,
      domainProfile: profile,
    });

    expect(
      draft.relationships.some((r) => r.relation.relationship_type === "reinforces")
    ).toBe(true);
  });
});
