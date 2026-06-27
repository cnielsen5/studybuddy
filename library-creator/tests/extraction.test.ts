import { extractConceptGraphHeuristic } from "../src/extraction/heuristicConceptExtractor.js";
import { loadDomainProfile } from "../src/profiles/loadProfile.js";
import type { LibraryCreationIntent } from "../src/types/intent.js";
import type { ParsedSource } from "../src/types/parsedSource.js";
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

describe("extractConceptGraphHeuristic", () => {
  it("creates one concept per objective block, not per heading rank", () => {
    const parsedSource: ParsedSource = {
      sourceType: "website",
      sections: [
        normalizeParsedSection({
          title: "Distinguish between anatomy and physiology",
          body: "Distinguish between anatomy and physiology, and identify several branches of each",
          sequence: 1,
          level: 0,
          blockType: "objective_item",
          structuralHeadingTrail: ["Introduction"],
        }),
        normalizeParsedSection({
          title: "Define homeostasis",
          body: "Define homeostasis and explain its importance to normal human functioning",
          sequence: 2,
          level: 0,
          blockType: "objective_item",
          structuralHeadingTrail: ["Introduction"],
        }),
        normalizeParsedSection({
          title: "Overview",
          body: "This chapter begins with an overview of anatomy and physiology and a preview of the body regions and functions.",
          sequence: 3,
          level: 0,
          blockType: "paragraph",
          structuralHeadingTrail: ["Introduction", "Overview"],
        }),
      ],
      rawText: "",
      metadata: {
        pageTitle: "Ch. 1 Introduction - Anatomy and Physiology | OpenStax",
      },
    };

    const draft = extractConceptGraphHeuristic(
      parsedSource,
      baseIntent,
      loadDomainProfile("anatomy")
    );

    expect(draft.concepts.length).toBe(3);
    expect(draft.concepts[0].knowledge_graph?.primary_domain).toBeTruthy();
    expect(draft.concepts[0].domain_contexts?.[0]?.hierarchy_location.category).toBeTruthy();
    expect(draft.concepts.every((c) => c.content.title.length > 0)).toBe(true);
  });

  it("ignores placeholder scope boundaries like Unsure", () => {
    const parsedSource: ParsedSource = {
      sourceType: "text",
      sections: [
        normalizeParsedSection({
          title: "Cells",
          body: "The cell is the basic unit of life with membrane-bound organelles.",
          sequence: 1,
          level: 0,
          blockType: "paragraph",
          structuralHeadingTrail: [],
        }),
      ],
      rawText: "",
    };

    const draft = extractConceptGraphHeuristic(
      parsedSource,
      { ...baseIntent, scopeBoundaries: ["Unsure"] },
      loadDomainProfile("mixed")
    );

    expect(draft.concepts).toHaveLength(1);
  });
});
