import { buildLibraryBundle } from "../src/export/buildLibraryBundle.js";
import { validateLibraryBundle } from "../src/export/libraryConformance.js";
import { extractConceptGraphHeuristic } from "../src/extraction/heuristicConceptExtractor.js";
import { generateCardsQuestionsHeuristic } from "../src/generation/heuristicCardsQuestionsGenerator.js";
import { mapRelationshipsHeuristic } from "../src/relationships/heuristicRelationshipMapper.js";
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

function buildPipelineArtifacts() {
  const profile = loadDomainProfile("anatomy");
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
    profile
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
      reason: "Sequential objective",
    },
  ];

  const concepts = structuredClone(conceptGraph.concepts);
  const cardsQuestions = generateCardsQuestionsHeuristic({
    libraryId: conceptGraph.proposedLibraryId,
    concepts,
    intent: baseIntent,
    domainProfile: profile,
  });

  const { draft: relationships } = mapRelationshipsHeuristic({
    conceptGraph: { ...conceptGraph, concepts },
    intent: baseIntent,
    domainProfile: profile,
  });

  return { conceptGraph: { ...conceptGraph, concepts }, cardsQuestions, relationships };
}

describe("buildLibraryBundle", () => {
  it("assembles a Golden Master bundle from pipeline artifacts", () => {
    const { conceptGraph, cardsQuestions, relationships } = buildPipelineArtifacts();

    const bundle = buildLibraryBundle({
      job: {
        id: "lc_testjob",
        name: "Test Library",
        createdAt: "2026-06-14T00:00:00Z",
      },
      intent: baseIntent,
      conceptGraph,
      cardsQuestions,
      relationships,
    });

    expect(bundle.manifest.id).toBe(conceptGraph.proposedLibraryId);
    expect(bundle.concepts.length).toBe(2);
    expect(bundle.cards.length).toBeGreaterThan(0);
    expect(bundle.concepts.every((concept) => !("provenance" in concept))).toBe(true);
  });

  it("passes library conformance validation", () => {
    const { conceptGraph, cardsQuestions, relationships } = buildPipelineArtifacts();

    const bundle = buildLibraryBundle({
      job: {
        id: "lc_testjob",
        name: "Test Library",
        createdAt: "2026-06-14T00:00:00Z",
      },
      intent: baseIntent,
      conceptGraph,
      cardsQuestions,
      relationships,
      options: { publish: true, version: "1.0.0" },
    });

    const result = validateLibraryBundle(bundle);
    expect(result.valid).toBe(true);
    expect(bundle.manifest.status).toBe("published");
    expect(bundle.questions[0]?.source.origin).toBe("validated");
  });
});
