import { z } from "zod";
import { ResolutionLevelSchema, type ResolutionLevel } from "./resolution.js";

const conceptId = z.string().regex(/^concept_[a-z0-9_]+$/);
const cardId = z.string().regex(/^card_[a-z0-9_]+$/);
const questionId = z.string().regex(/^q_[a-z0-9_]+$/);
const domainId = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/, "domain_id must be lowercase slug (e.g. mathematics)");

export const ConceptSourceReferenceSchema = z.object({
  source: z.string(),
  chapter: z.string(),
  section: z.string().optional(),
});

export type ConceptSourceReference = z.infer<typeof ConceptSourceReferenceSchema>;

export const DomainContextFramingSchema = z.object({
  title_in_context: z.string().optional(),
  relevance: z.string(),
  applications: z.array(z.string()),
  /** Deepest resolution level this domain takes this concept. */
  max_resolution_in_context: ResolutionLevelSchema,
});

export type DomainContextFraming = z.infer<typeof DomainContextFramingSchema>;

export const HierarchyLocationSchema = z.object({
  category: z.string(),
  subcategory: z.string(),
  topic: z.string(),
  subtopic: z.string().nullable().optional(),
});

export type HierarchyLocation = z.infer<typeof HierarchyLocationSchema>;

export const DomainContextDependencyGraphSchema = z.object({
  prerequisites_in_context: z.array(z.string()),
  unlocks_in_context: z.array(z.string()),
});

export type DomainContextDependencyGraph = z.infer<
  typeof DomainContextDependencyGraphSchema
>;

export const DomainContextLinkedContentSchema = z.object({
  card_ids: z.array(cardId),
  question_ids: z.array(questionId),
});

export const DomainContextSchema = z.object({
  domain_id: domainId,
  framing: DomainContextFramingSchema,
  hierarchy_location: HierarchyLocationSchema,
  dependency_graph: DomainContextDependencyGraphSchema,
  /** Populated during library creation — empty at spine-build time. */
  linked_content: DomainContextLinkedContentSchema,
});

export type DomainContext = z.infer<typeof DomainContextSchema>;

/** Universal graph position — domain membership lives in domain_contexts[]. */
export const KnowledgeGraphSchema = z.object({
  knowledge_area: z.string(),
  knowledge_cluster: z.string(),
  primary_domain: domainId,
  /** Present on library bundles; omitted on spine master concepts. */
  library_id: z.string().optional(),
});

export type KnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>;

const isoDateTime = z.string().datetime({ offset: true }).or(z.string().datetime());

/** Spine-build master template — no cards, no mastery_config yet. */
export const UniversalConceptMasterSchema = z.object({
  id: conceptId,
  resolution_level: ResolutionLevelSchema,
  content: z.object({
    title: z.string(),
    definition: z.string(),
    summary: z.string(),
  }),
  knowledge_graph: KnowledgeGraphSchema,
  dependency_graph: z.object({
    parent_concept_id: z.string().optional(),
    prerequisites: z.array(z.string()),
    unlocks: z.array(z.string()),
  }),
  domain_contexts: z.array(DomainContextSchema).min(1),
  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.string(),
    version: z.string(),
    status: z.enum(["draft", "published"]),
    source_references: z.array(ConceptSourceReferenceSchema).optional(),
  }),
});

export type UniversalConceptMaster = z.infer<typeof UniversalConceptMasterSchema>;

/** @deprecated Legacy single-domain placement — use domain_contexts instead. */
export const LegacyHierarchySchema = z.object({
  library_id: z.string(),
  domain: z.string(),
  category: z.string(),
  subcategory: z.string(),
  topic: z.string(),
  subtopic: z.string().optional(),
});

export type LegacyHierarchy = z.infer<typeof LegacyHierarchySchema>;

export const LegacyLinkedContentSchema = z.object({
  card_ids: z.array(z.string()),
  question_ids: z.array(z.string()),
});

export function slugifyDomainId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

export function aggregateLinkedContent(contexts: DomainContext[]): {
  card_ids: string[];
  question_ids: string[];
} {
  const cardIds = new Set<string>();
  const questionIds = new Set<string>();
  for (const context of contexts) {
    for (const id of context.linked_content.card_ids) cardIds.add(id);
    for (const id of context.linked_content.question_ids) questionIds.add(id);
  }
  return { card_ids: [...cardIds], question_ids: [...questionIds] };
}

export interface ConceptShapeInput {
  knowledge_graph?: KnowledgeGraph;
  domain_contexts?: DomainContext[];
  hierarchy?: LegacyHierarchy;
  linked_content?: { card_ids: string[]; question_ids: string[] };
}

export function usesDomainContexts(concept: ConceptShapeInput): boolean {
  return (concept.domain_contexts?.length ?? 0) > 0;
}

export function getDomainContext(
  concept: ConceptShapeInput,
  domainId: string
): DomainContext | undefined {
  return concept.domain_contexts?.find((context) => context.domain_id === domainId);
}

export function resolveActiveDomainId(
  concept: ConceptShapeInput,
  preferredDomainId?: string
): string | undefined {
  if (preferredDomainId && getDomainContext(concept, preferredDomainId)) {
    return preferredDomainId;
  }
  return (
    concept.knowledge_graph?.primary_domain ??
    concept.domain_contexts?.[0]?.domain_id ??
    (concept.hierarchy ? slugifyDomainId(concept.hierarchy.domain) : undefined)
  );
}

export function getEffectiveHierarchy(
  concept: ConceptShapeInput,
  bundle: { manifest: { domain: string; id?: string }; concepts?: ConceptShapeInput[] },
  domainId?: string
): {
  library_id?: string;
  domain: string;
  category: string;
  subcategory: string;
  topic: string;
  subtopic?: string;
} {
  const activeDomain = resolveActiveDomainId(concept, domainId);
  const context = activeDomain ? getDomainContext(concept, activeDomain) : undefined;

  if (context) {
    const { hierarchy_location: location } = context;
    return {
      library_id: concept.knowledge_graph?.library_id ?? bundle.manifest.id,
      domain: activeDomain ?? bundle.manifest.domain,
      category: location.category,
      subcategory: location.subcategory,
      topic: location.topic,
      subtopic: location.subtopic ?? undefined,
    };
  }

  if (concept.hierarchy) {
    return concept.hierarchy;
  }

  return {
    library_id: bundle.manifest.id,
    domain: bundle.manifest.domain,
    category: "General",
    subcategory: "General",
    topic: "Concept",
  };
}

export function getLinkedContentForDomain(
  concept: ConceptShapeInput,
  domainId?: string
): { card_ids: string[]; question_ids: string[] } {
  const activeDomain = resolveActiveDomainId(concept, domainId);
  const context = activeDomain ? getDomainContext(concept, activeDomain) : undefined;
  if (context) {
    return context.linked_content;
  }
  if (concept.linked_content) {
    return concept.linked_content;
  }
  if (concept.domain_contexts?.length) {
    return aggregateLinkedContent(concept.domain_contexts);
  }
  return { card_ids: [], question_ids: [] };
}

/**
 * Write generated card/question IDs back into the domain context for this library.
 * Required so the concept graph retains its connection to study content.
 */
export function writeLinkedContentToDomainContext(
  concept: ConceptShapeInput,
  domainId: string,
  cardIds: string[],
  questionIds: string[]
): void {
  const context = getDomainContext(concept, domainId);
  if (!context) {
    throw new Error(
      `Cannot write linked content: concept has no domain context "${domainId}"`
    );
  }
  context.linked_content.card_ids = [...cardIds];
  context.linked_content.question_ids = [...questionIds];
  ensureLinkedContentAggregate(concept);
}

export function buildDomainContextFromLegacy(input: {
  domain: string;
  libraryId: string;
  hierarchy: Omit<LegacyHierarchy, "library_id" | "domain">;
  resolutionLevel: ResolutionLevel;
  relevance?: string;
  maxResolutionInContext?: ResolutionLevel;
}): { knowledge_graph: KnowledgeGraph; domain_context: DomainContext } {
  const domainId = slugifyDomainId(input.domain);
  const maxResolution = input.maxResolutionInContext ?? input.resolutionLevel;
  const domainContext: DomainContext = {
    domain_id: domainId,
    framing: {
      relevance: input.relevance ?? `Core concept in ${input.domain}`,
      applications: [],
      max_resolution_in_context: maxResolution,
    },
    hierarchy_location: {
      category: input.hierarchy.category,
      subcategory: input.hierarchy.subcategory,
      topic: input.hierarchy.topic,
      subtopic: input.hierarchy.subtopic ?? null,
    },
    dependency_graph: {
      prerequisites_in_context: [],
      unlocks_in_context: [],
    },
    linked_content: { card_ids: [], question_ids: [] },
  };

  return {
    knowledge_graph: {
      knowledge_area: input.domain,
      knowledge_cluster: input.hierarchy.subcategory,
      primary_domain: domainId,
      library_id: input.libraryId,
    },
    domain_context: domainContext,
  };
}

export function ensureLinkedContentAggregate(concept: {
  domain_contexts?: DomainContext[];
  linked_content?: { card_ids: string[]; question_ids: string[] };
}): void {
  if (concept.domain_contexts?.length) {
    concept.linked_content = aggregateLinkedContent(concept.domain_contexts);
  }
}

export function conceptHasDomainContext(
  concept: ConceptShapeInput,
  domainId: string
): boolean {
  return Boolean(getDomainContext(concept, domainId));
}

export function listDomainIds(concept: ConceptShapeInput): string[] {
  return concept.domain_contexts?.map((context) => context.domain_id) ?? [];
}
