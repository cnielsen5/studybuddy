import type { LibraryBundle, LibraryConcept } from "./libraryTypes";

export type ResolutionLevel = 1 | 2 | 3 | 4 | 5;

export interface DomainContextFraming {
  title_in_context?: string;
  relevance: string;
  applications: string[];
  max_resolution_in_context: ResolutionLevel;
}

export interface HierarchyLocation {
  category: string;
  subcategory: string;
  topic: string;
  subtopic?: string;
}

export interface DomainContext {
  domain_id: string;
  framing: DomainContextFraming;
  hierarchy_location: HierarchyLocation;
  dependency_graph?: {
    prerequisites_in_context: string[];
    unlocks_in_context: string[];
  };
  linked_content: { card_ids: string[]; question_ids: string[] };
}

export interface KnowledgeGraph {
  knowledge_area: string;
  knowledge_cluster: string;
  primary_domain: string;
  library_id?: string;
}

export function slugifyDomainId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

export function getDomainContext(
  concept: LibraryConcept,
  domainId: string
): DomainContext | undefined {
  return concept.domain_contexts?.find((context) => context.domain_id === domainId);
}

export function resolveActiveDomainId(
  concept: LibraryConcept,
  bundle: LibraryBundle,
  preferredDomainId?: string
): string {
  if (preferredDomainId && getDomainContext(concept, preferredDomainId)) {
    return preferredDomainId;
  }
  if (concept.knowledge_graph?.primary_domain) {
    return concept.knowledge_graph.primary_domain;
  }
  if (concept.domain_contexts?.[0]?.domain_id) {
    return concept.domain_contexts[0].domain_id;
  }
  if (concept.hierarchy?.domain) {
    return slugifyDomainId(concept.hierarchy.domain);
  }
  return slugifyDomainId(bundle.manifest.domain);
}

export function getEffectiveHierarchy(
  concept: LibraryConcept,
  bundle: LibraryBundle,
  domainId?: string
): {
  library_id?: string;
  domain: string;
  category: string;
  subcategory: string;
  topic: string;
  subtopic?: string;
} {
  const activeDomain = resolveActiveDomainId(concept, bundle, domainId);
  const context = getDomainContext(concept, activeDomain);

  if (context) {
    const { hierarchy_location: location } = context;
    return {
      library_id: concept.knowledge_graph?.library_id ?? bundle.manifest.id,
      domain: activeDomain,
      category: location.category,
      subcategory: location.subcategory,
      topic: location.topic,
      subtopic: location.subtopic,
    };
  }

  if (concept.hierarchy) {
    return {
      library_id: concept.hierarchy.library_id,
      domain: concept.hierarchy.domain ?? bundle.manifest.domain,
      category: concept.hierarchy.category ?? "General",
      subcategory: concept.hierarchy.subcategory ?? "General",
      topic: concept.hierarchy.topic ?? concept.content.title,
      subtopic: concept.hierarchy.subtopic,
    };
  }

  return {
    library_id: bundle.manifest.id,
    domain: bundle.manifest.domain,
    category: "General",
    subcategory: "General",
    topic: concept.content.title,
  };
}

export function getLinkedContentForDomain(
  concept: LibraryConcept,
  bundle: LibraryBundle,
  domainId?: string
): { card_ids: string[]; question_ids: string[] } {
  const activeDomain = resolveActiveDomainId(concept, bundle, domainId);
  const context = getDomainContext(concept, activeDomain);
  if (context) {
    return context.linked_content;
  }
  if (concept.linked_content) {
    return concept.linked_content;
  }
  return { card_ids: [], question_ids: [] };
}

export function activeDomainIdFromManifest(manifest: LibraryBundle["manifest"]): string {
  return slugifyDomainId(manifest.domain);
}

export function conceptDisplayTitle(
  concept: LibraryConcept,
  bundle: LibraryBundle,
  domainId?: string
): string {
  const activeDomain = resolveActiveDomainId(concept, bundle, domainId);
  const context = getDomainContext(concept, activeDomain);
  return context?.framing.title_in_context ?? concept.content.title;
}
