import { z } from "zod";
import { ResolutionLevelSchema, type ResolutionLevel } from "./resolution.js";

const cardId = z.string().regex(/^card_[a-z0-9_]+$/);
const questionId = z.string().regex(/^q_[a-z0-9_]+$/);
const libraryId = z.string().regex(/^lib_[a-z0-9_]+$/);
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

/** Flat linked content on library concepts (L4/L5) — this library only. */
export const LibraryScopedLinkedContentSchema = z.object({
  card_ids: z.array(cardId),
  question_ids: z.array(questionId),
});

export type LibraryScopedLinkedContent = z.infer<
  typeof LibraryScopedLinkedContentSchema
>;

/** Spine domain contexts — cards/questions scoped per library that anchored here. */
export const SpineDomainLinkedContentSchema = z.object({
  by_library: z.record(libraryId, LibraryScopedLinkedContentSchema),
});

export type SpineDomainLinkedContent = z.infer<typeof SpineDomainLinkedContentSchema>;

export const DomainContextLinkedContentSchema = z.union([
  SpineDomainLinkedContentSchema,
  LibraryScopedLinkedContentSchema,
]);

export type DomainContextLinkedContent = z.infer<
  typeof DomainContextLinkedContentSchema
>;

export function isSpineDomainLinkedContent(
  linkedContent: DomainContextLinkedContent
): linkedContent is SpineDomainLinkedContent {
  return "by_library" in linkedContent;
}

export function emptySpineLinkedContent(): SpineDomainLinkedContent {
  return { by_library: {} };
}

export function emptyLibraryLinkedContent(): LibraryScopedLinkedContent {
  return { card_ids: [], question_ids: [] };
}

export const DomainContextSchema = z.object({
  domain_id: domainId,
  framing: DomainContextFramingSchema,
  hierarchy_location: HierarchyLocationSchema,
  dependency_graph: DomainContextDependencyGraphSchema,
  /** Spine: by_library map (empty at spine-build). Library L4/L5: flat card/question arrays. */
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

const spineId = z.string().regex(/^spine_[a-z0-9_]+$/);
const isoDateTime = z.string().datetime({ offset: true }).or(z.string().datetime());

/** Canonical spine concept template (levels 1–3). */
export const SpineConceptMasterSchema = z.object({
  id: spineId,
  resolution_level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  content: z.object({
    title: z.string(),
    definition: z.string(),
    summary: z.string(),
  }),
  knowledge_graph: KnowledgeGraphSchema,
  dependency_graph: z.object({
    parent_concept_id: spineId.nullable().optional(),
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

export type SpineConceptMaster = z.infer<typeof SpineConceptMasterSchema>;

const libraryConceptId = z.string().regex(/^concept_[a-z0-9_]+$/);

/** Library-generated concept (L4/L5) anchored to a spine node. */
export const LibraryConceptMasterSchema = z.object({
  id: libraryConceptId,
  anchor_concept_id: spineId,
  resolution_level: z.union([z.literal(4), z.literal(5)]),
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

export type LibraryConceptMaster = z.infer<typeof LibraryConceptMasterSchema>;

/** @deprecated Use SpineConceptMasterSchema — kept for migration reads. */
export const UniversalConceptMasterSchema = SpineConceptMasterSchema;

export type UniversalConceptMaster = SpineConceptMaster;

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

export const LegacyLinkedContentSchema = LibraryScopedLinkedContentSchema;

export function slugifyDomainId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

export function aggregateLinkedContent(
  contexts: DomainContext[],
  libraryIdFilter?: string
): LibraryScopedLinkedContent {
  const cardIds = new Set<string>();
  const questionIds = new Set<string>();
  for (const context of contexts) {
    const slice = getLinkedContentSlice(context.linked_content, libraryIdFilter);
    for (const id of slice.card_ids) cardIds.add(id);
    for (const id of slice.question_ids) questionIds.add(id);
  }
  return { card_ids: [...cardIds], question_ids: [...questionIds] };
}

export function getLinkedContentSlice(
  linkedContent: DomainContextLinkedContent,
  libraryIdFilter?: string
): LibraryScopedLinkedContent {
  if (isSpineDomainLinkedContent(linkedContent)) {
    if (libraryIdFilter) {
      return linkedContent.by_library[libraryIdFilter] ?? emptyLibraryLinkedContent();
    }
    return aggregateSpineLinkedContent(linkedContent);
  }
  return linkedContent;
}

export function aggregateSpineLinkedContent(
  linkedContent: SpineDomainLinkedContent
): LibraryScopedLinkedContent {
  const cardIds = new Set<string>();
  const questionIds = new Set<string>();
  for (const entry of Object.values(linkedContent.by_library)) {
    for (const id of entry.card_ids) cardIds.add(id);
    for (const id of entry.question_ids) questionIds.add(id);
  }
  return { card_ids: [...cardIds], question_ids: [...questionIds] };
}

export interface ConceptShapeInput {
  knowledge_graph?: KnowledgeGraph;
  domain_contexts?: DomainContext[];
  hierarchy?: LegacyHierarchy;
  linked_content?: LibraryScopedLinkedContent;
}

export function usesDomainContexts(concept: ConceptShapeInput): boolean {
  return (concept.domain_contexts?.length ?? 0) > 0;
}

export function getDomainContext(
  concept: ConceptShapeInput,
  domainIdValue: string
): DomainContext | undefined {
  return concept.domain_contexts?.find((context) => context.domain_id === domainIdValue);
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
  domainIdValue?: string
): {
  library_id?: string;
  domain: string;
  category: string;
  subcategory: string;
  topic: string;
  subtopic?: string;
} {
  const activeDomain = resolveActiveDomainId(concept, domainIdValue);
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
  domainIdValue?: string,
  libraryIdValue?: string
): LibraryScopedLinkedContent {
  const activeDomain = resolveActiveDomainId(concept, domainIdValue);
  const context = activeDomain ? getDomainContext(concept, activeDomain) : undefined;
  if (context) {
    return getLinkedContentSlice(context.linked_content, libraryIdValue);
  }
  if (concept.linked_content) {
    return concept.linked_content;
  }
  if (concept.domain_contexts?.length) {
    return aggregateLinkedContent(concept.domain_contexts, libraryIdValue);
  }
  return emptyLibraryLinkedContent();
}

/**
 * Write generated card/question IDs to a spine concept's domain context,
 * scoped to the library that produced the content.
 */
export function writeLinkedContentToSpineDomainContext(
  spineConcept: ConceptShapeInput,
  domainIdValue: string,
  libraryIdValue: string,
  cardIds: string[],
  questionIds: string[]
): void {
  const context = getDomainContext(spineConcept, domainIdValue);
  if (!context) {
    throw new Error(
      `Cannot write spine linked content: no domain context "${domainIdValue}"`
    );
  }
  if (!isSpineDomainLinkedContent(context.linked_content)) {
    context.linked_content = emptySpineLinkedContent();
  }
  context.linked_content.by_library[libraryIdValue] = {
    card_ids: [...cardIds],
    question_ids: [...questionIds],
  };
}

/** Write linked content on a library concept's domain context (flat, this library only). */
export function writeLinkedContentToLibraryDomainContext(
  concept: ConceptShapeInput,
  domainIdValue: string,
  cardIds: string[],
  questionIds: string[]
): void {
  const context = getDomainContext(concept, domainIdValue);
  if (!context) {
    throw new Error(
      `Cannot write linked content: concept has no domain context "${domainIdValue}"`
    );
  }
  context.linked_content = {
    card_ids: [...cardIds],
    question_ids: [...questionIds],
  };
  ensureLinkedContentAggregate(concept);
}

/** @deprecated Use writeLinkedContentToLibraryDomainContext or writeLinkedContentToSpineDomainContext */
export function writeLinkedContentToDomainContext(
  concept: ConceptShapeInput,
  domainIdValue: string,
  cardIds: string[],
  questionIds: string[]
): void {
  writeLinkedContentToLibraryDomainContext(concept, domainIdValue, cardIds, questionIds);
}

export function buildDomainContextFromLegacy(input: {
  domain: string;
  libraryId: string;
  hierarchy: Omit<LegacyHierarchy, "library_id" | "domain">;
  resolutionLevel: ResolutionLevel;
  relevance?: string;
  maxResolutionInContext?: ResolutionLevel;
}): { knowledge_graph: KnowledgeGraph; domain_context: DomainContext } {
  const domainIdValue = slugifyDomainId(input.domain);
  const maxResolution = input.maxResolutionInContext ?? input.resolutionLevel;
  const domainContext: DomainContext = {
    domain_id: domainIdValue,
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
    linked_content: emptyLibraryLinkedContent(),
  };

  return {
    knowledge_graph: {
      knowledge_area: input.domain,
      knowledge_cluster: input.hierarchy.subcategory,
      primary_domain: domainIdValue,
      library_id: input.libraryId,
    },
    domain_context: domainContext,
  };
}

export function ensureLinkedContentAggregate(concept: {
  domain_contexts?: DomainContext[];
  linked_content?: LibraryScopedLinkedContent;
}): void {
  if (concept.domain_contexts?.length) {
    concept.linked_content = aggregateLinkedContent(concept.domain_contexts);
  }
}

export function conceptHasDomainContext(
  concept: ConceptShapeInput,
  domainIdValue: string
): boolean {
  return Boolean(getDomainContext(concept, domainIdValue));
}

export function listDomainIds(concept: ConceptShapeInput): string[] {
  return concept.domain_contexts?.map((context) => context.domain_id) ?? [];
}

export function spineLinkedContentIsEmpty(
  linkedContent: DomainContextLinkedContent
): boolean {
  if (!isSpineDomainLinkedContent(linkedContent)) {
    return (
      linkedContent.card_ids.length === 0 && linkedContent.question_ids.length === 0
    );
  }
  return Object.keys(linkedContent.by_library).length === 0;
}
