/**
 * Generates the OrthoBullets-native orthopaedic spine subtree from the taxonomy:
 *   L2 = Orthopaedic Surgery (root)
 *   L3 = Section   (OB_SECTIONS)
 *   L4 = Chapter   (ObChapter)
 *   L5 = Topic     (ObTopic)
 *
 * One SpineL4L5AnchorBundle is emitted per section (anchor = section L3 id),
 * containing all of that section's chapters (L4) and topics (L5).
 */
import type { SpineConcept } from "../../spineSchema.js";
import type { SpineL4L5AnchorBundle, SpineL4L5Concept } from "../../spineL4L5Schema.js";
import { OB_SECTIONS, type ObSection } from "./sections.js";
import type { ObSectionTaxonomy, ObSourceRef } from "./taxonomyTypes.js";

const DOMAIN = "medicine_clinical" as const;
const TS = "2026-06-27T00:00:00Z";
const GENERATION_DATE = "2026-06-27";
export const ORTHO_L2_ROOT = "spine_medicine_clinical_l2_orthopaedic_surgery";
const MED_CLINICAL_L1 = "spine_medicine_clinical";

const l3Id = (shortName: string) => `spine_medicine_clinical_l3_${shortName}`;
const l4Id = (shortName: string) => `spine_medicine_clinical_l4_${shortName}`;
const l5Id = (shortName: string) => `spine_medicine_clinical_l5_${shortName}`;

function emptyLinks() {
  return { by_library: {} };
}

function defaultSource(title: string): ObSourceRef {
  return { source: "OrthoBullets", chapter: title, section: "Overview" };
}

export function makeL2Root(): SpineConcept {
  return {
    id: ORTHO_L2_ROOT,
    resolution_level: 2,
    content: {
      title: "Orthopaedic Surgery",
      definition:
        "The surgical and non-surgical diagnosis, treatment, and rehabilitation of disorders affecting the musculoskeletal system including bones, joints, ligaments, tendons, muscles, and nerves.",
      summary:
        "Orthopaedic surgery is organised here to mirror the OrthoBullets topic taxonomy: eleven subspecialty sections, each with chapters and topics.",
    },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: "Surgical Subspecialties",
      primary_domain: DOMAIN,
    },
    dependency_graph: {
      parent_concept_id: MED_CLINICAL_L1,
      prerequisites: [],
      unlocks: OB_SECTIONS.map((s) => l3Id(s.shortName)),
    },
    domain_contexts: [
      {
        domain_id: DOMAIN,
        framing: {
          title_in_context: "Orthopaedic Surgery",
          relevance:
            "Subspecialty clinical medicine domain covering musculoskeletal surgical and non-surgical management.",
          applications: [
            "ABOS board certification",
            "Orthopaedic residency training",
            "Musculoskeletal clinical decision-making",
          ],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Medicine (Clinical)",
          subcategory: "Orthopaedic Surgery",
          topic: "Orthopaedic Surgery",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [],
          unlocks_in_context: OB_SECTIONS.map((s) => l3Id(s.shortName)),
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.3-orthobullets",
      status: "draft",
      source_references: [
        { source: "OrthoBullets topic taxonomy", chapter: "Sections", section: "Topics" },
      ],
    },
  };
}

export function makeSectionL3(section: ObSection): SpineConcept {
  const id = l3Id(section.shortName);
  return {
    id,
    resolution_level: 3,
    content: {
      title: section.title,
      definition: section.definition,
      summary: section.summary,
    },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: section.title,
      primary_domain: DOMAIN,
    },
    dependency_graph: {
      parent_concept_id: ORTHO_L2_ROOT,
      prerequisites: [],
      unlocks: [],
    },
    domain_contexts: [
      {
        domain_id: DOMAIN,
        framing: {
          title_in_context: section.title,
          relevance: section.relevance,
          applications: section.applications,
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Orthopaedic Surgery",
          subcategory: section.title,
          topic: section.title,
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [],
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.3-orthobullets",
      status: "draft",
      source_references: [
        { source: "OrthoBullets topic taxonomy", chapter: section.title, section: "Section" },
      ],
    },
  };
}

function makeL4Chapter(
  section: ObSection,
  chapterShortName: string,
  title: string,
  definition: string,
  summary: string,
  l5Ids: string[],
  source: ObSourceRef
): SpineL4L5Concept {
  const id = l4Id(chapterShortName);
  const anchorId = l3Id(section.shortName);
  return {
    id,
    resolution_level: 4,
    anchor_concept_id: anchorId,
    content: { title, definition, summary },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: section.title,
      primary_domain: DOMAIN,
      _shared_concept_note: null,
    },
    dependency_graph: {
      parent_concept_id: anchorId,
      prerequisites: [],
      unlocks: l5Ids,
    },
    domain_contexts: [
      {
        domain_id: DOMAIN,
        framing: {
          title_in_context: title,
          relevance: section.relevance,
          applications: section.applications,
          max_resolution_in_context: l5Ids.length > 0 ? 5 : 4,
        },
        hierarchy_location: {
          category: "Orthopaedic Surgery",
          subcategory: section.title,
          topic: title,
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [],
          unlocks_in_context: l5Ids,
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.3-orthobullets",
      status: "draft",
      source_references: [source],
    },
  };
}

function makeL5Topic(
  section: ObSection,
  chapterTitle: string,
  parentL4ShortName: string,
  topicShortName: string,
  title: string,
  definition: string,
  summary: string,
  source: ObSourceRef
): SpineL4L5Concept {
  const id = l5Id(topicShortName);
  const anchorId = l3Id(section.shortName);
  const parentId = l4Id(parentL4ShortName);
  return {
    id,
    resolution_level: 5,
    anchor_concept_id: anchorId,
    content: { title, definition, summary },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: section.title,
      primary_domain: DOMAIN,
      _shared_concept_note: null,
    },
    dependency_graph: {
      parent_concept_id: parentId,
      prerequisites: [parentId],
      unlocks: [],
    },
    domain_contexts: [
      {
        domain_id: DOMAIN,
        framing: {
          title_in_context: title,
          relevance: section.relevance,
          applications: section.applications,
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Orthopaedic Surgery",
          subcategory: section.title,
          topic: chapterTitle,
          subtopic: title,
        },
        dependency_graph: {
          prerequisites_in_context: [parentId],
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.3-orthobullets",
      status: "draft",
      source_references: [source],
    },
  };
}

/** Build the L4/L5 anchor bundle for one section from its taxonomy. Returns null if empty. */
export function buildSectionBundle(
  section: ObSection,
  taxonomy: ObSectionTaxonomy
): SpineL4L5AnchorBundle | null {
  if (taxonomy.chapters.length === 0) return null;
  const anchorId = l3Id(section.shortName);
  const concepts: SpineL4L5Concept[] = [];

  for (const chapter of taxonomy.chapters) {
    const l5Concepts: SpineL4L5Concept[] = [];
    const l5Ids: string[] = [];
    for (const topic of chapter.topics) {
      const c = makeL5Topic(
        section,
        chapter.title,
        chapter.shortName,
        topic.shortName,
        topic.title,
        topic.definition,
        topic.summary,
        topic.source ?? defaultSource(chapter.title)
      );
      l5Concepts.push(c);
      l5Ids.push(c.id);
    }
    concepts.push(
      makeL4Chapter(
        section,
        chapter.shortName,
        chapter.title,
        chapter.definition,
        chapter.summary,
        l5Ids,
        chapter.source ?? defaultSource(chapter.title)
      )
    );
    concepts.push(...l5Concepts);
  }

  const l4 = concepts.filter((c) => c.resolution_level === 4).length;
  const l5 = concepts.filter((c) => c.resolution_level === 5).length;

  return {
    _meta: {
      anchor_l3_id: anchorId,
      anchor_primary_domain: DOMAIN,
      model: "universal-l4-l5",
      generation_date: GENERATION_DATE,
      status: "draft",
      notes:
        `OrthoBullets ${section.title} section — ${l4} chapters (L4), ${l5} topics (L5). ` +
        `provenance=${taxonomy.provenance}${taxonomy.obDataPending ? "; ob_import_pending" : ""}` +
        (taxonomy.notes ? `. ${taxonomy.notes}` : ""),
    },
    concepts,
  };
}
