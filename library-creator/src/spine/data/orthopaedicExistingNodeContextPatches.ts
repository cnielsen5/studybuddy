import type { DomainContext } from "../../types/domainContext.js";
import { emptySpineLinkedContent } from "../../types/domainContext.js";
import type { SpineConcept } from "../spineSchema.js";
import { EXISTING_NODE_REFERENCES } from "./orthopaedicSurgeryMeta.js";

const ORTHO_DOMAIN = "medicine_clinical" as const;
const TS = "2026-06-27T00:00:00Z";

function orthoSubcategory(spineId: string): string {
  if (spineId.includes("preclinical") || spineId.includes("biology_l")) {
    return "Orthopaedic Basic Science";
  }
  return "Orthopaedic Surgery";
}

function buildOrthoDomainContext(
  ref: (typeof EXISTING_NODE_REFERENCES)[number],
  concept: SpineConcept
): DomainContext {
  const title =
    concept.content.title ||
    ref.existing_spine_id.replace(/^spine_[^_]+_(l2|l3)_/, "").replace(/_/g, " ");
  return {
    domain_id: ORTHO_DOMAIN,
    framing: {
      title_in_context: title,
      relevance: ref.orthopaedic_context.relevance,
      applications: ref.orthopaedic_context.applications,
      max_resolution_in_context: Math.min(
        5,
        Math.max(3, ref.orthopaedic_context.depth_in_lens)
      ) as 3 | 4 | 5,
    },
    hierarchy_location: {
      category: "Orthopaedic Surgery",
      subcategory: orthoSubcategory(ref.existing_spine_id),
      topic: title,
      subtopic: null,
    },
    dependency_graph: {
      prerequisites_in_context: [],
      unlocks_in_context: [],
    },
    linked_content: emptySpineLinkedContent(),
  };
}

function mergeIntoExistingClinicalContext(
  existing: DomainContext,
  ref: (typeof EXISTING_NODE_REFERENCES)[number]
): DomainContext {
  const orthoApps = ref.orthopaedic_context.applications;
  const mergedApps = [...new Set([...existing.framing.applications, ...orthoApps])];
  const orthoRelevance = ref.orthopaedic_context.relevance;
  const mergedRelevance = existing.framing.relevance.includes(orthoRelevance)
    ? existing.framing.relevance
    : `${existing.framing.relevance} Orthopaedic context: ${orthoRelevance}`;
  const maxRes = Math.max(
    existing.framing.max_resolution_in_context,
    Math.min(5, Math.max(3, ref.orthopaedic_context.depth_in_lens))
  ) as 3 | 4 | 5;

  return {
    ...existing,
    framing: {
      ...existing.framing,
      relevance: mergedRelevance,
      applications: mergedApps,
      max_resolution_in_context: maxRes,
    },
  };
}

/** Add or merge medicine_clinical orthopaedic domain_context on existing spine nodes (C2). */
export function applyOrthopaedicExistingNodeContexts(concepts: SpineConcept[]): SpineConcept[] {
  const refById = new Map(EXISTING_NODE_REFERENCES.map((r) => [r.existing_spine_id, r]));

  return concepts.map((concept) => {
    const ref = refById.get(concept.id);
    if (!ref) return concept;

    const clinicalIdx = concept.domain_contexts.findIndex((dc) => dc.domain_id === ORTHO_DOMAIN);

    if (clinicalIdx >= 0) {
      const merged = mergeIntoExistingClinicalContext(concept.domain_contexts[clinicalIdx]!, ref);
      const domain_contexts = [...concept.domain_contexts];
      domain_contexts[clinicalIdx] = merged;
      return {
        ...concept,
        metadata: { ...concept.metadata, updated_at: TS },
        domain_contexts,
      };
    }

    return {
      ...concept,
      metadata: { ...concept.metadata, updated_at: TS },
      domain_contexts: [...concept.domain_contexts, buildOrthoDomainContext(ref, concept)],
    };
  });
}
