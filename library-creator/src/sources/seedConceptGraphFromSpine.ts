import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inferSpineDomainId } from "../extraction/inferSpineDomainId.js";
import { slugify } from "../extraction/heuristicConceptExtractor.js";
import {
  emptyLibraryLinkedContent,
  type DomainContext,
  type KnowledgeGraph,
} from "../types/domainContext.js";
import {
  ConceptGraphDraftSchema,
  type ConceptGraphDraft,
  type DraftConcept,
} from "../types/draftConcept.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import type { ResolutionLevel } from "../types/resolution.js";

interface RawSpineDomainContext {
  domain_id: string;
  framing?: {
    title_in_context?: string;
    relevance?: string;
    applications?: string[];
    max_resolution_in_context?: ResolutionLevel;
  };
  hierarchy_location?: {
    category?: string;
    subcategory?: string;
    topic?: string;
    subtopic?: string | null;
  };
  dependency_graph?: {
    prerequisites_in_context?: string[];
    unlocks_in_context?: string[];
  };
}

interface RawSpineConcept {
  id: string;
  resolution_level?: number;
  content: { title: string; definition: string; summary: string };
  knowledge_graph: {
    knowledge_area: string;
    knowledge_cluster: string;
    primary_domain: string;
  };
  dependency_graph?: {
    parent_concept_id?: string | null;
    prerequisites?: string[];
    unlocks?: string[];
  };
  domain_contexts?: RawSpineDomainContext[];
}

export interface SeedFromSpineOptions {
  /** Cap on the number of seeded concepts. */
  maxConcepts?: number;
}

export interface SpineSeedResult {
  draft: ConceptGraphDraft;
  /** Human-readable scope shown to the user (e.g. "Organic Chemistry"). */
  scopeLabel: string;
  /** "chapter" = L2 subject headings; "topic" = L3 chapter-level topics. */
  grain: "chapter" | "topic";
}

function levelFromId(id: string): ResolutionLevel | undefined {
  const m = id.match(/_l([1-5])_/);
  return m ? (Number(m[1]) as ResolutionLevel) : undefined;
}

function conceptIdFromSpineId(spineId: string): string {
  const base = spineId.replace(/^spine_/, "") || "concept";
  return `concept_${slugify(base) || "concept"}`;
}

function subcategoryFor(concept: RawSpineConcept, domainId: string): string | undefined {
  const ctx = concept.domain_contexts?.find((c) => c.domain_id === domainId);
  return ctx?.hierarchy_location?.subcategory?.trim() || undefined;
}

/**
 * Subcategories the user explicitly named (e.g. "organic chemistry").
 * Returns the matched subcategory titles so seeding can narrow scope.
 */
function matchedSubcategories(
  concepts: RawSpineConcept[],
  domainId: string,
  intent: LibraryCreationIntent
): Set<string> {
  const scopeText = [
    intent.libraryTitle,
    intent.purposeStatement,
    intent.libraryDescription,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const domainName = intent.domain.trim().toLowerCase();
  const matched = new Set<string>();

  const subcategories = new Set<string>();
  for (const concept of concepts) {
    const sub = subcategoryFor(concept, domainId);
    if (sub) subcategories.add(sub);
  }

  for (const sub of subcategories) {
    const normalized = sub.toLowerCase();
    // Skip the bare domain label (e.g. "Chemistry") — too broad to narrow on.
    if (normalized === domainName) continue;
    if (scopeText.includes(normalized)) {
      matched.add(sub);
    }
  }

  return matched;
}

function toDraftConcept(
  raw: RawSpineConcept,
  domainId: string,
  libraryId: string,
  now: string,
  domainDisplay: string,
  keepIds: Set<string>
): DraftConcept | null {
  const level = (raw.resolution_level as ResolutionLevel) ?? levelFromId(raw.id) ?? 3;
  const rawCtx = raw.domain_contexts?.find((c) => c.domain_id === domainId);
  const location = rawCtx?.hierarchy_location;

  const subcategory =
    location?.subcategory?.trim() || raw.knowledge_graph.knowledge_cluster || domainDisplay;
  const category = location?.category?.trim() || domainDisplay;
  const topic = location?.topic?.trim() || raw.content.title;

  const knowledge_graph: KnowledgeGraph = {
    knowledge_area: raw.knowledge_graph.knowledge_area,
    knowledge_cluster: raw.knowledge_graph.knowledge_cluster,
    primary_domain: domainId,
    library_id: libraryId,
  };

  const domain_context: DomainContext = {
    domain_id: domainId,
    framing: {
      title_in_context: rawCtx?.framing?.title_in_context ?? raw.content.title,
      relevance:
        rawCtx?.framing?.relevance ?? `Core ${domainDisplay} concept from the knowledge spine.`,
      applications: rawCtx?.framing?.applications ?? [],
      max_resolution_in_context: rawCtx?.framing?.max_resolution_in_context ?? level,
    },
    hierarchy_location: {
      category,
      subcategory,
      topic,
      subtopic: location?.subtopic ?? null,
    },
    dependency_graph: {
      prerequisites_in_context: (rawCtx?.dependency_graph?.prerequisites_in_context ?? [])
        .map(conceptIdFromSpineId)
        .filter((id) => keepIds.has(id)),
      unlocks_in_context: (rawCtx?.dependency_graph?.unlocks_in_context ?? [])
        .map(conceptIdFromSpineId)
        .filter((id) => keepIds.has(id)),
    },
    linked_content: emptyLibraryLinkedContent(),
  };

  const prerequisites = (raw.dependency_graph?.prerequisites ?? [])
    .map(conceptIdFromSpineId)
    .filter((id) => keepIds.has(id));
  const unlocks = (raw.dependency_graph?.unlocks ?? [])
    .map(conceptIdFromSpineId)
    .filter((id) => keepIds.has(id));

  return {
    id: conceptIdFromSpineId(raw.id),
    type: "concept",
    resolution_level: level,
    // Carrying the spine id makes anchoring resolve to "use_existing" (no new concept).
    anchor_concept_id: raw.id,
    spine_concept_id: raw.id,
    metadata: {
      created_at: now,
      updated_at: now,
      created_by: "library_creator",
      last_updated_by: "library_creator",
      version: "0.1.0",
      status: "draft",
      tags: [slugify(domainDisplay), "spine_seeded"],
    },
    knowledge_graph,
    domain_contexts: [domain_context],
    // Mirror the domain context into the legacy hierarchy so downstream
    // helpers that still read `concept.hierarchy.*` (e.g. relationship mapping)
    // keep working — the heuristic extractor populates this too.
    hierarchy: {
      library_id: libraryId,
      domain: domainDisplay,
      category,
      subcategory,
      topic,
      subtopic: location?.subtopic ?? undefined,
    },
    content: {
      title: raw.content.title,
      definition: raw.content.definition,
      summary: raw.content.summary || raw.content.definition,
    },
    dependency_graph: {
      prerequisites,
      unlocks,
      related_concepts: [],
      child_concepts: [],
    },
    mastery_config: {
      threshold: 0.8,
      decay_rate: "standard",
      min_questions_correct: 1,
    },
    media: [],
    references: [],
    linked_content: emptyLibraryLinkedContent(),
    provenance: {
      extractionMethod: "heuristic",
      confidence: 0.95,
    },
  };
}

function loadSpineBundle(repoRoot: string): RawSpineConcept[] {
  const path = join(repoRoot, "content/spine/socrates-spine-l1-l5.draft.json");
  const bundle = JSON.parse(readFileSync(path, "utf8")) as { concepts: RawSpineConcept[] };
  return bundle.concepts ?? [];
}

function levelOf(c: RawSpineConcept): ResolutionLevel {
  return (c.resolution_level as ResolutionLevel) ?? levelFromId(c.id) ?? 3;
}

/**
 * Build a concept graph from concepts that already live on the spine for the
 * requested domain (and named subcategory, when the user specified one).
 *
 * Used when the learner pastes no source material: rather than fabricating
 * concepts from the library title or source names, the library reuses concepts
 * the spine already defines. Every seeded concept carries its spine
 * `anchor_concept_id`, so downstream anchoring reports them as "use_existing"
 * and no new spine nodes are proposed.
 *
 * Granularity follows how broad the request is — the goal is to show
 * "chapter heading" concepts, never the fine-grained L4/L5 detail:
 *   - A named subcategory (e.g. "organic chemistry") seeds that subject's
 *     L3 topics (its chapters).
 *   - A broad domain (e.g. "chemistry") seeds the L2 subject headings
 *     (Organic Chemistry, Physical Chemistry, …).
 *
 * Returns `null` when the domain has no eligible spine concepts (caller should
 * fall back to extraction).
 */
export function seedConceptGraphFromSpine(
  repoRoot: string,
  intent: LibraryCreationIntent,
  options: SeedFromSpineOptions = {}
): SpineSeedResult | null {
  const domainId = inferSpineDomainId(intent);
  if (!domainId || domainId === "mixed") return null;

  const allConcepts = loadSpineBundle(repoRoot);
  const inDomain = allConcepts.filter((c) =>
    (c.domain_contexts ?? []).some((ctx) => ctx.domain_id === domainId)
  );
  if (inDomain.length === 0) return null;

  const matched = matchedSubcategories(inDomain, domainId, intent);

  // Named subcategory → its L3 chapter topics. Broad domain → L2 subject headings.
  let grain: SpineSeedResult["grain"];
  let scopeLabel: string;
  let pool: RawSpineConcept[];

  if (matched.size > 0) {
    grain = "topic";
    scopeLabel = [...matched].join(", ");
    pool = inDomain.filter((c) => {
      if (levelOf(c) !== 3) return false;
      const sub = subcategoryFor(c, domainId);
      return sub ? matched.has(sub) : false;
    });
    // Subject exists but has no L3 topics yet — fall back to the L2 heading(s).
    if (pool.length === 0) {
      grain = "chapter";
      pool = inDomain.filter((c) => {
        if (levelOf(c) !== 2) return false;
        const sub = subcategoryFor(c, domainId);
        return sub ? matched.has(sub) : false;
      });
    }
  } else {
    grain = "chapter";
    scopeLabel = intent.domain;
    pool = inDomain.filter((c) => levelOf(c) === 2);
  }

  const selected = pool.slice(0, options.maxConcepts ?? 40);
  if (selected.length === 0) return null;

  const libraryId = `lib_${slugify(intent.libraryTitle).replace(/^lib_/, "") || "untitled"}`.slice(
    0,
    48
  );
  const now = new Date().toISOString();
  const keepIds = new Set(selected.map((c) => conceptIdFromSpineId(c.id)));

  const concepts = selected
    .map((raw) => toDraftConcept(raw, domainId, libraryId, now, intent.domain, keepIds))
    .filter((c): c is DraftConcept => c !== null);

  if (concepts.length === 0) return null;

  const scopeNote =
    matched.size > 0
      ? `Scoped to ${scopeLabel} within ${intent.domain}.`
      : `Covering the main areas of ${intent.domain}.`;

  const draft = ConceptGraphDraftSchema.parse({
    proposedLibraryId: libraryId,
    concepts,
    suggestedPrerequisites: [],
    extractionMethod: "heuristic",
    notes: [
      `Seeded ${concepts.length} existing spine concepts — no new concepts created.`,
      scopeNote,
      "No source material was pasted, so the library reuses concepts already on the knowledge spine.",
    ],
  });

  return { draft, scopeLabel, grain };
}
