import type { DomainContext } from "../types/domainContext.js";
import { emptySpineLinkedContent } from "../types/domainContext.js";
import type { SpineConcept, SpineGraphBundle } from "./spineSchema.js";
import {
  SPINE_DOMAINS,
  l1Id,
  l2Id,
  slugifySpineName,
  type SpineDomainId,
} from "./spineDomains.js";
import { SPINE_LEVEL3_BY_DOMAIN } from "./spineLevel3Data.js";
import {
  ALL_SUPERSEDED_SPINE_L3_IDS,
  SPINE_SHARED_CONCEPTS,
} from "./spineSharedConceptsIndex.js";
import { l2UnlockTargets } from "./spineL2Unlocks.js";

const SPINE_TIMESTAMP = "2025-01-01T00:00:00Z";

function emptyLinkedContent(): DomainContext["linked_content"] {
  return emptySpineLinkedContent();
}

function baseDomainContext(
  domainId: SpineDomainId,
  category: string,
  subcategory: string,
  topic: string,
  maxResolution: 1 | 2 | 3,
  relevance: string
): DomainContext {
  return {
    domain_id: domainId,
    framing: {
      title_in_context: topic,
      relevance,
      applications: [],
      max_resolution_in_context: maxResolution,
    },
    hierarchy_location: {
      category,
      subcategory,
      topic,
      subtopic: null,
    },
    dependency_graph: {
      prerequisites_in_context: [],
      unlocks_in_context: [],
    },
    linked_content: emptyLinkedContent(),
  };
}

function buildLevel1And2(): SpineConcept[] {
  const concepts: SpineConcept[] = [];

  for (const domain of SPINE_DOMAINS) {
    const rootId = l1Id(domain.id);
    concepts.push({
      id: rootId,
      resolution_level: 1,
      content: {
        title: domain.title,
        definition: `The body of knowledge encompassed by ${domain.title} as represented in the Socrates universal spine.`,
        summary: `Level-1 root for ${domain.title}. Organizes level-2 subdivisions and anchors level-3 working concept clusters.`,
      },
      knowledge_graph: {
        knowledge_area: domain.knowledge_area,
        knowledge_cluster: domain.title,
        primary_domain: domain.id,
      },
      dependency_graph: {
        parent_concept_id: null,
        prerequisites: [],
        unlocks: domain.level2.map((label) => l2Id(domain.id, label)),
      },
      domain_contexts: [
        baseDomainContext(
          domain.id,
          domain.title,
          domain.title,
          domain.title,
          1,
          `Top-level organization for ${domain.title} in the Socrates spine.`
        ),
      ],
      metadata: {
        created_at: SPINE_TIMESTAMP,
        updated_at: SPINE_TIMESTAMP,
        created_by: "ai_draft",
        version: "0.1-draft",
        status: "draft",
      },
    });

    for (const l2Label of domain.level2) {
      const id = l2Id(domain.id, l2Label);
      concepts.push({
        id,
        resolution_level: 2,
        content: {
          title: l2Label,
          definition: `Major subdivision of ${domain.title} covering ${l2Label}.`,
          summary: `Level-2 cluster grouping related level-3 working concepts within ${domain.title}.`,
        },
        knowledge_graph: {
          knowledge_area: domain.knowledge_area,
          knowledge_cluster: l2Label,
          primary_domain: domain.id,
        },
        dependency_graph: {
          parent_concept_id: rootId,
          prerequisites: [rootId],
          unlocks: l2UnlockTargets(id),
        },
        domain_contexts: [
          baseDomainContext(
            domain.id,
            domain.title,
            l2Label,
            l2Label,
            2,
            `Organizes ${l2Label} concepts for ${domain.title} libraries.`
          ),
        ],
        metadata: {
          created_at: SPINE_TIMESTAMP,
          updated_at: SPINE_TIMESTAMP,
          created_by: "ai_draft",
          version: "0.1-draft",
          status: "draft",
        },
      });
    }
  }

  return concepts;
}

export function buildSpineGraphDraft(): SpineGraphBundle {
  const level12 = buildLevel1And2();
  const sharedIds = new Set(SPINE_SHARED_CONCEPTS.map((concept) => concept.id));
  const level3DomainSpecific = Object.values(SPINE_LEVEL3_BY_DOMAIN)
    .flat()
    .filter(
      (concept) =>
        !ALL_SUPERSEDED_SPINE_L3_IDS.has(concept.id) && !sharedIds.has(concept.id)
    );
  const shared = SPINE_SHARED_CONCEPTS;

  const byId = new Map<string, SpineConcept>();
  for (const concept of [...level12, ...level3DomainSpecific, ...shared]) {
    if (byId.has(concept.id)) {
      throw new Error(`Duplicate spine concept id: ${concept.id}`);
    }
    byId.set(concept.id, concept);
  }

  const concepts = [...byId.values()].sort((a, b) => {
    if (a.resolution_level !== b.resolution_level) {
      return a.resolution_level - b.resolution_level;
    }
    return a.id.localeCompare(b.id);
  });

  const counts = {
    level_1: concepts.filter((c) => c.resolution_level === 1).length,
    level_2: concepts.filter((c) => c.resolution_level === 2).length,
    level_3: concepts.filter((c) => c.resolution_level === 3).length,
    total: concepts.length,
  };

  return {
    _meta: {
      spine_version: "0.1-draft",
      domains_included: [...SPINE_DOMAINS.map((d) => d.id)],
      resolution_levels_included: [1, 2, 3],
      status: "draft-for-review",
      notes:
        "Draft for human review. Shared concepts flagged with _shared_concept_note. " +
        "Forward references to level-4/5 nodes noted where relevant.",
      concept_counts: counts,
    },
    concepts,
  };
}

export function spineL3CountForDomain(domain: SpineDomainId): number {
  const shared = SPINE_SHARED_CONCEPTS.filter(
    (c) => c.knowledge_graph.primary_domain === domain
  ).length;
  const domainSpecific = SPINE_LEVEL3_BY_DOMAIN[domain]?.length ?? 0;
  return shared + domainSpecific;
}

export { slugifySpineName };
