import type { ConceptSourceReference } from "../../types/domainContext.js";
import type { OrthoL3Spec } from "./orthopaedicSurgeryL3Data.js";
import type {
  OrthoAnchorL4L5Spec,
  OrthoExistingAnchorL4L5Spec,
  OrthoL4Spec,
  OrthoL5Spec,
} from "./orthopaedicL4L5Types.js";
import type { SpineL4L5AnchorBundle, SpineL4L5Concept } from "../spineL4L5Schema.js";

const DOMAIN = "medicine_clinical" as const;
const TS = "2026-06-27T00:00:00Z";
const GENERATION_DATE = "2026-06-27";

function l3Id(shortName: string) {
  return `spine_medicine_clinical_l3_${shortName}`;
}

function l4Id(shortName: string) {
  return `spine_medicine_clinical_l4_${shortName}`;
}

function l5Id(shortName: string) {
  return `spine_medicine_clinical_l5_${shortName}`;
}

function defaultSource(l3: OrthoL3Spec, section?: string): ConceptSourceReference {
  return {
    source: `StatPearls — ${l3.title}`,
    chapter: l3.nbkId ?? "NBK482316",
    section: section ?? l3.nbkSection ?? "Overview",
  };
}

function makeDomainContext(
  l3: OrthoL3Spec,
  subtopic: string,
  prereqs: string[],
  unlocks: string[],
  maxResolution: 4 | 5 = 5
): SpineL4L5Concept["domain_contexts"][0] {
  return {
    domain_id: DOMAIN,
    framing: {
      title_in_context: subtopic,
      relevance: l3.relevance,
      applications: l3.applications,
      max_resolution_in_context: maxResolution,
    },
    hierarchy_location: {
      category: "Orthopaedic Surgery",
      subcategory: l3.subcategory,
      topic: l3.title,
      subtopic,
    },
    dependency_graph: {
      prerequisites_in_context: prereqs,
      unlocks_in_context: unlocks,
    },
    linked_content: { by_library: {} },
  };
}

function buildL5Concept(
  l5: OrthoL5Spec,
  parentL4Id: string,
  anchorId: string,
  l3: OrthoL3Spec,
  parentL4Title: string
): SpineL4L5Concept {
  const id = l5Id(l5.shortName);
  const source = l5.source ?? defaultSource(l3, l5.nbkSection);
  return {
    id,
    resolution_level: 5,
    anchor_concept_id: anchorId,
    content: {
      title: l5.title,
      definition: l5.definition,
      summary: l5.summary,
    },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: l3.cluster,
      primary_domain: DOMAIN,
      _shared_concept_note: l5.sharedNote ?? null,
    },
    dependency_graph: {
      parent_concept_id: parentL4Id,
      prerequisites: [parentL4Id],
      unlocks: [],
    },
    domain_contexts: [
      makeDomainContext(l3, l5.title, [parentL4Id], [], 5),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.2-draft",
      status: "draft",
      source_references: [source],
    },
  };
}

function buildL4Concept(
  l4: OrthoL4Spec,
  anchorId: string,
  l3: OrthoL3Spec,
  l5Ids: string[]
): SpineL4L5Concept {
  const id = l4Id(l4.shortName);
  const prereqs = (l4.prerequisites ?? []).map(l4Id);
  const source = l4.source ?? defaultSource(l3, l4.nbkSection);
  const unlocks = l5Ids.length > 0 ? l5Ids : [];

  return {
    id,
    resolution_level: 4,
    anchor_concept_id: anchorId,
    content: {
      title: l4.title,
      definition: l4.definition,
      summary: l4.summary,
    },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: l3.cluster,
      primary_domain: DOMAIN,
      _shared_concept_note: l4.sharedNote ?? null,
    },
    dependency_graph: {
      parent_concept_id: anchorId,
      prerequisites: prereqs,
      unlocks,
    },
    domain_contexts: [
      makeDomainContext(
        l3,
        l4.title,
        prereqs,
        unlocks,
        l5Ids.length > 0 ? 5 : 4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.2-draft",
      status: "draft",
      source_references: [source],
    },
  };
}

export function buildAnchorBundle(
  anchorSpec: OrthoAnchorL4L5Spec,
  l3: OrthoL3Spec
): SpineL4L5AnchorBundle {
  const anchorId = l3Id(anchorSpec.anchorShortName);
  const concepts: SpineL4L5Concept[] = [];

  for (const l4 of anchorSpec.l4) {
    const l5Concepts: SpineL4L5Concept[] = [];
    const l5Ids: string[] = [];
    for (const l5 of l4.l5 ?? []) {
      const l5Concept = buildL5Concept(l5, l4Id(l4.shortName), anchorId, l3, l4.title);
      l5Concepts.push(l5Concept);
      l5Ids.push(l5Concept.id);
    }
    concepts.push(buildL4Concept(l4, anchorId, l3, l5Ids));
    concepts.push(...l5Concepts);
  }

  return {
    _meta: {
      anchor_l3_id: anchorId,
      anchor_primary_domain: DOMAIN,
      model: "universal-l4-l5",
      generation_date: GENERATION_DATE,
      status: "draft",
      notes:
        anchorSpec.notes ??
        `Orthopaedic L4/L5 expansion for ${l3.title}. ${concepts.filter((c) => c.resolution_level === 4).length} L4, ${concepts.filter((c) => c.resolution_level === 5).length} L5.`,
    },
    concepts,
  };
}

export function buildExistingAnchorBundle(
  spec: OrthoExistingAnchorL4L5Spec,
  pseudoL3: Pick<OrthoL3Spec, "title" | "cluster" | "subcategory" | "relevance" | "applications" | "nbkId" | "nbkSection">
): SpineL4L5AnchorBundle {
  const anchorId = spec.existingSpineId;
  const l3Like = {
    ...pseudoL3,
    title: pseudoL3.title,
  } as OrthoL3Spec;

  const anchorSpec: OrthoAnchorL4L5Spec = {
    anchorShortName: spec.existingSpineId.replace(/^spine_medicine_clinical_l3_/, ""),
    l4: spec.l4,
    notes: spec.notes ?? `Orthopaedic domain_context L4/L5 on existing node; deferred from ${spec.deferredFrom}.`,
  };

  const bundle = buildAnchorBundle(anchorSpec, {
    ...l3Like,
    shortName: anchorSpec.anchorShortName,
    definition: "",
    summary: "",
    abosSection: "abos_p1_perioperative",
  });
  return {
    ...bundle,
    _meta: {
      ...bundle._meta,
      anchor_l3_id: anchorId as SpineL4L5AnchorBundle["_meta"]["anchor_l3_id"],
      notes: spec.notes ?? bundle._meta.notes,
    },
    concepts: bundle.concepts.map((c) => ({
      ...c,
      anchor_concept_id: anchorId as typeof c.anchor_concept_id,
      domain_contexts: c.domain_contexts.map((dc) => ({
        ...dc,
        hierarchy_location: {
          ...dc.hierarchy_location,
          category: "Orthopaedic Surgery",
          subcategory: spec.subcategory,
        },
        framing: {
          ...dc.framing,
          relevance: `${dc.framing.relevance} (orthopaedic perioperative context on existing clinical node)`,
        },
      })),
    })),
  };
}

export function countL4L5(concepts: SpineL4L5Concept[]) {
  return {
    l4: concepts.filter((c) => c.resolution_level === 4).length,
    l5: concepts.filter((c) => c.resolution_level === 5).length,
    total: concepts.length,
  };
}
