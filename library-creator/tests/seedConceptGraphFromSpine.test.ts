import { seedConceptGraphFromSpine } from "../src/sources/seedConceptGraphFromSpine.js";
import { anchorConceptGraphToSpine } from "../src/extraction/anchorConceptGraphToSpine.js";
import { mapRelationshipsHeuristic } from "../src/relationships/heuristicRelationshipMapper.js";
import { loadSpineIndex } from "../src/spine/spineIndex.js";
import { repoRootFromModule } from "../src/pipeline/repoRoot.js";
import type { DomainProfile } from "../src/types/domainProfile.js";
import type { LibraryCreationIntent } from "../src/types/intent.js";

const testProfile: DomainProfile = {
  archetypeId: "mixed",
  primaryLearningMode: "mixed",
  cardTierWeights: { core: 0.5, extension: 0.3, certification: 0.1, remedial: 0.1 },
  cardTypeWeights: { basic: 0.4, cloze: 0.3, imageOcclusion: 0.3 },
  pedagogicalRoleWeights: { recognition: 0.3, recall: 0.35, application: 0.2, integration: 0.15 },
  questionDensity: 1.5,
  relationshipDensity: 0.4,
  prefersDiagnosticQuestions: false,
};

const repoRoot = repoRootFromModule();

function organicIntent(): LibraryCreationIntent {
  return {
    domain: "Chemistry",
    libraryTitle: "I am a tutor for organic chemistry",
    purposeStatement: "I am a tutor for organic chemistry",
    spineDomainId: "chemistry",
    purpose: "exam_prep",
    audience: {
      level: "undergrad",
      priorKnowledge: [],
      targetDepth: "working",
      resolutionRange: { min: 2, max: 4 },
    },
    scopeBoundaries: [],
    externalAugmentationAllowed: true,
    similarityThreshold: 0.9,
  };
}

function broadChemistryIntent(): LibraryCreationIntent {
  const intent = organicIntent();
  intent.libraryTitle = "Chemistry";
  intent.purposeStatement = "I want to study chemistry";
  return intent;
}

describe("seedConceptGraphFromSpine", () => {
  it("seeds organic chemistry concepts from the spine and never the library title", () => {
    const result = seedConceptGraphFromSpine(repoRoot, organicIntent());
    expect(result).not.toBeNull();
    const titles = result!.draft.concepts.map((c) => c.content.title.toLowerCase());

    expect(titles.length).toBeGreaterThan(3);
    expect(titles).not.toContain("i am a tutor for organic chemistry");
    expect(titles.some((t) => t.includes("openstax"))).toBe(false);
    expect(titles).toContain("aromatic substitution");
    expect(result!.grain).toBe("topic");
    expect(result!.scopeLabel).toBe("Organic Chemistry");
  });

  it("narrows to the named subcategory (organic) rather than all of chemistry", () => {
    const { draft } = seedConceptGraphFromSpine(repoRoot, organicIntent())!;
    const subcats = new Set(
      draft.concepts.map((c) => c.domain_contexts?.[0]?.hierarchy_location.subcategory)
    );
    expect(subcats.has("Organic Chemistry")).toBe(true);
    // No physical/analytical bleed-through when "organic" was explicitly named.
    expect(subcats.has("Physical Chemistry")).toBe(false);
  });

  it("seeds L2 subject headings for a broad domain request", () => {
    const result = seedConceptGraphFromSpine(repoRoot, broadChemistryIntent());
    expect(result).not.toBeNull();
    expect(result!.grain).toBe("chapter");
    const titles = result!.draft.concepts.map((c) => c.content.title);
    // Chapter-level subject areas, not granular reactions.
    expect(titles).toContain("Organic Chemistry");
    expect(titles).toContain("Physical Chemistry");
    expect(titles).not.toContain("Aromatic Substitution");
    expect(result!.draft.concepts.every((c) => c.resolution_level === 2)).toBe(true);
  });

  it("produces concepts that anchor as use_existing — zero new spine nodes", () => {
    const { draft } = seedConceptGraphFromSpine(repoRoot, organicIntent())!;
    const spineIndex = loadSpineIndex(repoRoot);
    const anchored = anchorConceptGraphToSpine(draft, organicIntent(), spineIndex, {
      libraryId: draft.proposedLibraryId,
    });
    expect(anchored.new_concept_count).toBe(0);
    expect(anchored.anchored_count).toBe(draft.concepts.length);
  });

  it("populates legacy hierarchy so relationship mapping does not crash", () => {
    const { draft } = seedConceptGraphFromSpine(repoRoot, organicIntent())!;
    for (const concept of draft.concepts) {
      expect(concept.hierarchy?.domain).toBeTruthy();
    }
    // Reproduces the "Cannot read properties of undefined (reading 'domain')"
    // crash path — mapRelationships reads concept.hierarchy.domain directly.
    expect(() =>
      mapRelationshipsHeuristic({
        conceptGraph: draft,
        intent: organicIntent(),
        domainProfile: testProfile,
      })
    ).not.toThrow();
  });

  it("returns null for unknown domains so callers fall back to extraction", () => {
    const intent = organicIntent();
    intent.domain = "Underwater Basket Weaving";
    intent.spineDomainId = undefined;
    expect(seedConceptGraphFromSpine(repoRoot, intent)).toBeNull();
  });
});
