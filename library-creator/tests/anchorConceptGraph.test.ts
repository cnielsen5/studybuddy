import { anchorConceptGraphToSpine } from "../src/extraction/anchorConceptGraphToSpine.js";
import { extractConceptGraphHeuristic } from "../src/extraction/heuristicConceptExtractor.js";
import { loadDomainProfile } from "../src/profiles/loadProfile.js";
import { repoRootFromModule } from "../src/pipeline/repoRoot.js";
import { loadSpineIndex } from "../src/spine/spineIndex.js";
import type { LibraryCreationIntent } from "../src/types/intent.js";
import type { ParsedSource } from "../src/types/parsedSource.js";

const intent: LibraryCreationIntent = {
  libraryTitle: "Fracture Healing",
  domain: "Orthopaedic Surgery",
  spineDomainId: "medicine_clinical",
  purpose: "exam_prep",
  audience: {
    level: "professional",
    priorKnowledge: [],
    targetDepth: "working",
    resolutionRange: { min: 3, max: 5 },
  },
  scopeBoundaries: [],
  externalAugmentationAllowed: true,
  similarityThreshold: 0.9,
};

describe("anchorConceptGraphToSpine", () => {
  it("anchors fracture healing concepts to existing spine nodes when titles match", () => {
    const parsedSource: ParsedSource = {
      sourceType: "text",
      sections: [
        {
          title: "Fracture Healing and Bone Repair",
          body: "Fracture healing progresses through inflammatory, reparative, and remodeling phases.",
          sequence: 1,
          level: 1,
          blockType: "heading",
          structuralHeadingTrail: ["Fracture Healing"],
        },
      ],
      rawText: "Fracture healing",
    };

    const profile = loadDomainProfile("anatomy");
    const draft = extractConceptGraphHeuristic(parsedSource, intent, profile);
    const repoRoot = repoRootFromModule();
    const spineIndex = loadSpineIndex(repoRoot);

    const result = anchorConceptGraphToSpine(draft, intent, spineIndex);

    expect(result.placements.length).toBeGreaterThan(0);
    expect(result.anchored_count + result.new_concept_count + result.review_count).toBe(
      result.placements.length
    );

    const withAnchor = result.draft.concepts.filter((c) => c.anchor_concept_id);
    if (withAnchor.length > 0) {
      for (const c of withAnchor) {
        expect(spineIndex.byId.has(c.anchor_concept_id!)).toBe(true);
      }
    }
  });
});
