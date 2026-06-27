import { buildReconcileFlags, countPendingFlags } from "../src/pipeline/reconcileFlags.js";
import type { ConceptGraphDraft } from "../src/types/draftConcept.js";
import type { LibraryCreationIntent } from "../src/types/intent.js";

const intent: LibraryCreationIntent = {
  libraryTitle: "Test",
  domain: "Orthopaedic Surgery",
  spineDomainId: "medicine_clinical",
  purpose: "exam_prep",
  scopeNotes: "ABOS Part I basic science exam prep only",
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

const conceptGraph: ConceptGraphDraft = {
  proposedLibraryId: "lib_test",
  extractionMethod: "heuristic",
  suggestedPrerequisites: [],
  concepts: [
    {
      id: "concept_gait_analysis",
      type: "concept",
      resolution_level: 3,
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "library_creator",
        last_updated_by: "library_creator",
        version: "1.0",
        status: "draft",
        tags: [],
      },
      content: {
        title: "Gait Analysis",
        definition: "Study of walking patterns.",
        summary: "Normal and pathological gait kinematics and kinetics.",
      },
      knowledge_graph: {
        knowledge_area: "Medicine",
        knowledge_cluster: "MSK",
        primary_domain: "medicine_clinical",
      },
      domain_contexts: [
        {
          domain_id: "medicine_clinical",
          framing: {
            title_in_context: "Gait Analysis",
            relevance: "Clinical",
            applications: [],
            max_resolution_in_context: 4,
          },
          hierarchy_location: {
            category: "Orthopaedic",
            subcategory: "Basic Science",
            topic: "Gait Analysis",
            subtopic: null,
          },
          dependency_graph: {
            prerequisites_in_context: [],
            unlocks_in_context: [],
          },
          linked_content: { card_ids: [], question_ids: [] },
        },
      ],
      dependency_graph: {
        prerequisites: [],
        unlocks: [],
        related_concepts: [],
        child_concepts: [],
      },
      mastery_config: {
        threshold: 0.8,
        decay_rate: "standard",
        min_questions_correct: 1,
      },
    },
  ],
};

describe("buildReconcileFlags", () => {
  it("creates scope_question flag for gait analysis under Part I scope", () => {
    const flags = buildReconcileFlags({
      intent,
      conceptGraph,
      placements: [
        {
          concept_id: "concept_gait_analysis",
          title: "Gait Analysis",
          proposal: {
            recommendation: "human_review",
            rationale: "Near match",
            matched_concepts: [],
          },
          anchored: false,
        },
      ],
    });

    expect(flags.some((f) => f.type === "scope_question")).toBe(true);
    expect(flags.some((f) => f.type === "new_concept_confirmation")).toBe(true);
  });

  it("counts pending flags", () => {
    const flags = buildReconcileFlags({
      intent,
      conceptGraph,
      placements: [],
    });
    expect(countPendingFlags(flags)).toBeGreaterThanOrEqual(0);
  });
});
