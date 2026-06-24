import type { LibraryBundle, LibraryConcept } from "./libraryTypes";
import {
  activeDomainIdFromManifest,
  getEffectiveHierarchy,
  getLinkedContentForDomain,
} from "./domainContext";
import {
  filterConceptsByResolution,
  type ResolutionRange,
  FULL_RESOLUTION_RANGE,
  resolutionRangeFromManifest,
} from "./resolution";

export type TaxonomyLevel = "domain" | "category" | "subcategory" | "topic" | "concept";

export const TAXONOMY_LEVELS: TaxonomyLevel[] = [
  "domain",
  "category",
  "subcategory",
  "topic",
  "concept",
];

export interface ConceptHierarchyFields {
  library_id?: string;
  domain: string;
  category: string;
  subcategory: string;
  topic: string;
  subtopic: string;
}

export interface TaxonomyNode {
  id: string;
  level: TaxonomyLevel;
  label: string;
  domain: string;
  conceptIds: string[];
  cardCount: number;
  subconceptCount: number;
  childIds: string[];
}

export function getConceptHierarchy(
  concept: LibraryConcept,
  bundle: LibraryBundle,
  domainId?: string
): ConceptHierarchyFields {
  const h = getEffectiveHierarchy(concept, bundle, domainId);
  return {
    library_id: h.library_id,
    domain: h.domain,
    category: h.category,
    subcategory: h.subcategory,
    topic: h.topic,
    subtopic: h.subtopic ?? h.topic,
  };
}

function taxonomyNodeId(level: TaxonomyLevel, key: string): string {
  return `${level}:${key}`;
}

export function buildTaxonomyTree(
  bundle: LibraryBundle,
  resolutionRange: ResolutionRange = resolutionRangeFromManifest(bundle.manifest),
  domainId: string = activeDomainIdFromManifest(bundle.manifest)
): Map<string, TaxonomyNode> {
  const nodes = new Map<string, TaxonomyNode>();
  const visibleConcepts = filterConceptsByResolution(
    bundle.concepts,
    resolutionRange ?? FULL_RESOLUTION_RANGE
  );
  const visibleConceptIds = new Set(visibleConcepts.map((concept) => concept.id));
  const parentLinks = new Map<string, string>();

  for (const concept of visibleConcepts) {
    const parentId = concept.dependency_graph.parent_concept_id?.trim();
    if (parentId && (visibleConceptIds.has(parentId) || parentId.startsWith("spine_"))) {
      parentLinks.set(concept.id, parentId);
    }
  }

  function ensureNode(
    level: TaxonomyLevel,
    key: string,
    label: string,
    domain: string
  ): TaxonomyNode {
    const id = taxonomyNodeId(level, key);
    let node = nodes.get(id);
    if (!node) {
      node = {
        id,
        level,
        label,
        domain,
        conceptIds: [],
        cardCount: 0,
        subconceptCount: 0,
        childIds: [],
      };
      nodes.set(id, node);
    }
    return node;
  }

  for (const concept of visibleConcepts) {
    const h = getConceptHierarchy(concept, bundle, domainId);
    const linked = getLinkedContentForDomain(concept, bundle, domainId);
    const cardCount = linked.card_ids.length;

    const domainKey = h.domain;
    const categoryKey = `${h.domain}/${h.category}`;
    const subcategoryKey = `${categoryKey}/${h.subcategory}`;
    const topicKey = `${subcategoryKey}/${h.topic}`;
    const conceptKey = concept.id;

    const domainNode = ensureNode("domain", domainKey, h.domain, h.domain);
    const categoryNode = ensureNode("category", categoryKey, h.category, h.domain);
    const subcategoryNode = ensureNode("subcategory", subcategoryKey, h.subcategory, h.domain);
    const topicNode = ensureNode("topic", topicKey, h.topic, h.domain);
    const conceptNode = ensureNode("concept", conceptKey, concept.content.title, h.domain);

    const chain = [domainNode, categoryNode, subcategoryNode, topicNode, conceptNode];
    for (let i = 0; i < chain.length - 1; i++) {
      const parent = chain[i];
      const child = chain[i + 1];
      if (!parent.childIds.includes(child.id)) parent.childIds.push(child.id);
    }

    for (const node of chain) {
      if (!node.conceptIds.includes(concept.id)) node.conceptIds.push(concept.id);
      node.cardCount += cardCount;
    }
    conceptNode.subconceptCount = 1;

    const parentConceptId = parentLinks.get(concept.id);
    if (parentConceptId && visibleConceptIds.has(parentConceptId)) {
      const parentNode = ensureNode(
        "concept",
        parentConceptId,
        visibleConcepts.find((item) => item.id === parentConceptId)?.content.title ??
          parentConceptId,
        h.domain
      );
      if (!parentNode.childIds.includes(conceptNode.id)) {
        parentNode.childIds.push(conceptNode.id);
      }
    }
  }

  for (const node of nodes.values()) {
    if (node.level !== "concept") {
      node.subconceptCount = node.conceptIds.length;
    }
  }

  return nodes;
}

export function zoomScaleToLevel(scale: number): TaxonomyLevel {
  if (scale < 0.55) return "domain";
  if (scale < 0.85) return "category";
  if (scale < 1.2) return "subcategory";
  if (scale < 1.75) return "topic";
  return "concept";
}

export function levelIndex(level: TaxonomyLevel): number {
  return TAXONOMY_LEVELS.indexOf(level);
}

export function nodesAtLevel(
  tree: Map<string, TaxonomyNode>,
  level: TaxonomyLevel
): TaxonomyNode[] {
  return [...tree.values()].filter((n) => n.level === level);
}

export function levelLabel(level: TaxonomyLevel): string {
  const labels: Record<TaxonomyLevel, string> = {
    domain: "Domains",
    category: "Categories",
    subcategory: "Subcategories",
    topic: "Topics",
    concept: "Concepts",
  };
  return labels[level];
}
