import type { DomainProfile } from "../types/domainProfile.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import { titleFromContentLine } from "../ingestors/contentTitles.js";
import type { ContentBlockType, ParsedSection, ParsedSource } from "../types/parsedSource.js";
import type {
  ConceptGraphDraft,
  DraftConcept,
  SuggestedPrerequisite,
} from "../types/draftConcept.js";
import { ConceptGraphDraftSchema } from "../types/draftConcept.js";
import { expandDenseBlocks } from "../ingestors/contentBlockExtractor.js";

const SKIP_TITLES =
  /^(introduction|intro|overview|summary|conclusion|references|table of contents|preface|index|figure|paragraph|document)$/i;

const META_BLOCK_TYPES = new Set<ContentBlockType>(["figure_caption"]);

export interface HeuristicExtractOptions {
  maxConcepts?: number;
}

export function extractConceptGraphHeuristic(
  parsedSource: ParsedSource,
  intent: LibraryCreationIntent,
  domainProfile: DomainProfile,
  options: HeuristicExtractOptions = {}
): ConceptGraphDraft {
  const maxConcepts = options.maxConcepts ?? 25;
  const proposedLibraryId = proposeLibraryId(intent.libraryTitle);
  const now = new Date().toISOString();
  const usedIds = new Set<string>();

  const blocks = mergeParagraphBlocks(expandDenseBlocks(parsedSource.sections));
  const candidates = selectConceptCandidates(blocks, intent).slice(0, maxConcepts);

  if (candidates.length === 0) {
    throw new Error(
      "No concept candidates found in parsed source. Add more structured content or relax scope boundaries."
    );
  }

  const hierarchyContext = buildHierarchyContext(intent, parsedSource, domainProfile);

  const concepts: DraftConcept[] = candidates.map((block, index) => {
    const title = conceptTitleFromBlock(block);
    const id = uniqueConceptId(title, usedIds);
    const placement = assignConceptHierarchy(block, hierarchyContext, index, candidates.length);

    return {
      id,
      type: "concept",
      metadata: {
        created_at: now,
        updated_at: now,
        created_by: "library_creator",
        last_updated_by: "library_creator",
        version: "0.1.0",
        status: "draft",
        tags: [slugify(intent.domain), slugify(domainProfile.archetypeId)],
        search_keywords: keywordsFromBlock(block),
      },
      editorial: {
        difficulty: inferDifficulty(intent, domainProfile, block, index, candidates.length),
        high_yield_score: inferHighYield(intent, block, index, candidates.length),
      },
      hierarchy: {
        library_id: proposedLibraryId,
        domain: placement.domain,
        category: placement.category,
        subcategory: placement.subcategory,
        topic: title,
        subtopic: placement.subtopic,
      },
      content: {
        title,
        definition: firstSentence(block.body) || title,
        summary: summarizeBody(block.body, title),
      },
      dependency_graph: {
        prerequisites: [],
        unlocks: [],
        related_concepts: [],
        child_concepts: [],
        semantic_relations: [],
      },
      mastery_config: {
        threshold: intent.audience.targetDepth === "mastery" ? 0.85 : 0.8,
        decay_rate: intent.purpose === "exam_prep" ? "fast" : "standard",
        min_questions_correct: intent.purpose === "exam_prep" ? 2 : 1,
      },
      media: [],
      references: [],
      linked_content: {
        card_ids: [],
        question_ids: [],
      },
      provenance: {
        sourceSectionIndex: block.sequence,
        sourceSectionTitle: block.title,
        sourceUrl: block.sourceUrl,
        sourcePageTitle: block.sourcePageTitle,
        extractionMethod: "heuristic",
        confidence: confidenceForBlock(block),
      },
    };
  });

  const suggestedPrerequisites = inferDomainOrderedPrerequisites(concepts);
  applyPrerequisites(concepts, suggestedPrerequisites);

  const draft: ConceptGraphDraft = {
    proposedLibraryId,
    concepts,
    suggestedPrerequisites,
    extractionMethod: "heuristic",
    notes: [
      `Extracted ${concepts.length} concepts from ${blocks.length} content blocks.`,
      `Domain archetype: ${domainProfile.archetypeId}.`,
      "Concept hierarchy is assigned from domain intent and content themes — not HTML heading rank.",
      "Review concept boundaries — one concept = one learnable idea.",
    ],
  };

  return ConceptGraphDraftSchema.parse(draft);
}

interface HierarchyContext {
  domain: string;
  defaultCategory: string;
  defaultSubcategory: string;
}

function buildHierarchyContext(
  intent: LibraryCreationIntent,
  parsedSource: ParsedSource,
  profile: DomainProfile
): HierarchyContext {
  const pageTitle = parsedSource.metadata?.pageTitle ?? parsedSource.sourceLabel ?? "";
  const bookTitle = pageTitle.split("|")[0]?.split("-")[0]?.trim();

  return {
    domain: intent.domain,
    defaultCategory: bookTitle || intent.domain,
    defaultSubcategory: themeSubcategory(profile, intent),
  };
}

function themeSubcategory(
  profile: DomainProfile,
  intent: LibraryCreationIntent
): string {
  if (profile.primaryLearningMode === "memorization") {
    return "Core structures and terminology";
  }
  if (profile.primaryLearningMode === "practice") {
    return "Applied practice";
  }
  if (intent.purpose === "exam_prep") {
    return "High-yield exam concepts";
  }
  return "Foundational concepts";
}

function selectConceptCandidates(
  blocks: ParsedSection[],
  intent: LibraryCreationIntent
): ParsedSection[] {
  const scored = blocks
    .filter(
      (block) =>
        !META_BLOCK_TYPES.has(block.blockType) &&
        !shouldSkipBlockTitle(block) &&
        !isOutOfScope(block, intent.scopeBoundaries) &&
        block.body.trim().length >= 20
    )
    .map((block) => ({ block, score: scoreConceptCandidate(block) }))
    .sort((a, b) => b.score - a.score || a.block.sequence - b.block.sequence);

  const picked: ParsedSection[] = [];
  const seenBodies = new Set<string>();

  for (const { block } of scored) {
    const key = block.body.trim().toLowerCase();
    if (seenBodies.has(key)) {
      continue;
    }
    seenBodies.add(key);
    picked.push(block);
  }

  return picked.sort((a, b) => a.sequence - b.sequence);
}

/** Combine consecutive prose blocks that share the same heading context. */
export function mergeParagraphBlocks(sections: ParsedSection[]): ParsedSection[] {
  const merged: ParsedSection[] = [];

  for (const block of sections) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      prev.blockType === "paragraph" &&
      block.blockType === "paragraph" &&
      prev.title === block.title &&
      trailsEqual(prev.structuralHeadingTrail, block.structuralHeadingTrail)
    ) {
      merged[merged.length - 1] = {
        ...prev,
        body: `${prev.body}\n\n${block.body}`.trim(),
        sequence: block.sequence,
        pageOrSlide: block.pageOrSlide,
      };
      continue;
    }
    merged.push({ ...block });
  }

  return merged;
}

function trailsEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function scoreConceptCandidate(block: ParsedSection): number {
  switch (block.blockType) {
    case "objective_item":
      return 100;
    case "list_item":
      return 80;
    case "heading_section":
      return 60;
    case "paragraph":
      return 50;
    case "document":
      return 30;
    default:
      return 10;
  }
}

function conceptTitleFromBlock(block: ParsedSection): string {
  if (block.blockType === "objective_item" || block.blockType === "list_item") {
    return block.title.length >= 8 ? block.title : firstPhrase(block.body);
  }
  if (block.blockType === "paragraph" && block.structuralHeadingTrail.length > 0) {
    return block.structuralHeadingTrail[block.structuralHeadingTrail.length - 1];
  }
  return block.title;
}

function assignConceptHierarchy(
  block: ParsedSection,
  context: HierarchyContext,
  index: number,
  total: number
): {
  domain: string;
  category: string;
  subcategory: string;
  subtopic?: string;
} {
  const trail = block.structuralHeadingTrail.filter(Boolean);
  const meaningfulTrail = trail.filter((title) => !SKIP_TITLES.test(title));
  const pageCategory = block.sourcePageTitle
    ?.split("|")[0]
    ?.split("-")[0]
    ?.trim();
  const category =
    pageCategory ||
    meaningfulTrail[0] ||
    context.defaultCategory;

  const subcategory =
    meaningfulTrail[1] ??
    inferSubcategoryFromPosition(index, total, context.defaultSubcategory);

  const subtopic =
    block.blockType === "objective_item" && trail.length > 0
      ? trail[trail.length - 1]
      : undefined;

  return {
    domain: context.domain,
    category,
    subcategory,
    subtopic,
  };
}

function inferSubcategoryFromPosition(
  index: number,
  total: number,
  fallback: string
): string {
  if (total <= 1) {
    return fallback;
  }
  const third = Math.ceil(total / 3);
  if (index < third) {
    return "Foundations";
  }
  if (index < third * 2) {
    return "Core concepts";
  }
  return "Integration and application";
}

function confidenceForBlock(block: ParsedSection): number {
  if (block.blockType === "objective_item") {
    return 0.85;
  }
  if (block.blockType === "list_item") {
    return 0.75;
  }
  return block.body.length > 120 ? 0.65 : 0.5;
}

function shouldSkipBlockTitle(block: ParsedSection): boolean {
  if (block.blockType === "paragraph" || block.blockType === "objective_item") {
    return false;
  }
  return SKIP_TITLES.test(block.title.trim());
}

function isOutOfScope(block: ParsedSection, boundaries: string[]): boolean {
  if (boundaries.length === 0) {
    return false;
  }
  const ignored = new Set(["unsure", "not sure", "n/a", "none"]);
  const haystack = `${block.title}\n${block.body}`.toLowerCase();
  return boundaries.some((term) => {
    const normalized = term.trim().toLowerCase();
    if (!normalized || ignored.has(normalized)) {
      return false;
    }
    return haystack.includes(normalized);
  });
}

function proposeLibraryId(title: string): string {
  const slug = slugify(title).replace(/^lib_/, "") || "untitled";
  return `lib_${slug}`.slice(0, 48);
}

export function uniqueConceptId(title: string, used: Set<string>): string {
  return uniqueConceptIdFromSlug(slugify(title), used);
}

export function uniqueConceptIdFromSlug(
  slug: string,
  used: Set<string>
): string {
  let base = slug.replace(/^concept_/, "") || "concept";
  let id = `concept_${base}`;
  let n = 2;
  while (used.has(id)) {
    id = `concept_${base}_${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

function firstSentence(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) {
    return "";
  }
  const match = trimmed.match(/^(.+?[.!?])(\s|$)/);
  return (match?.[1] ?? trimmed.slice(0, 160)).trim();
}

function firstPhrase(body: string): string {
  return titleFromContentLine(body);
}

function summarizeBody(body: string, title: string): string {
  const trimmed = body.trim();
  if (!trimmed) {
    return `Covers ${title}.`;
  }
  if (trimmed.length <= 280) {
    return trimmed;
  }
  return `${trimmed.slice(0, 277).trim()}...`;
}

function keywordsFromBlock(block: ParsedSection): string[] {
  const words = `${block.title} ${block.body}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);
  return [...new Set(words)].slice(0, 6);
}

function inferDifficulty(
  intent: LibraryCreationIntent,
  profile: DomainProfile,
  block: ParsedSection,
  index: number,
  total: number
): "basic" | "intermediate" | "advanced" {
  if (intent.audience.targetDepth === "survey") {
    return "basic";
  }
  if (block.blockType === "objective_item" && index < total * 0.4) {
    return "basic";
  }
  if (
    intent.audience.targetDepth === "mastery" ||
    profile.primaryLearningMode === "practice"
  ) {
    return index >= total * 0.7 ? "advanced" : "intermediate";
  }
  return index < total * 0.5 ? "basic" : "intermediate";
}

function inferHighYield(
  intent: LibraryCreationIntent,
  block: ParsedSection,
  index: number,
  total: number
): number {
  if (block.blockType === "objective_item") {
    return intent.purpose === "exam_prep" ? 9 : 8;
  }
  if (intent.purpose === "reference") {
    return 5;
  }
  if (intent.purpose === "exam_prep") {
    const rank = 10 - Math.floor((index / Math.max(total, 1)) * 4);
    return Math.max(6, rank);
  }
  return 7;
}

function inferDomainOrderedPrerequisites(
  concepts: DraftConcept[]
): SuggestedPrerequisite[] {
  const edges: SuggestedPrerequisite[] = [];
  for (let i = 1; i < concepts.length; i += 1) {
    const prev = concepts[i - 1];
    const curr = concepts[i];
    if (prev.hierarchy.subcategory === curr.hierarchy.subcategory) {
      edges.push({
        from_concept_id: prev.id,
        to_concept_id: curr.id,
        reason: "Same theme cluster — review ordering",
      });
    }
  }
  return edges;
}

function applyPrerequisites(
  concepts: DraftConcept[],
  edges: SuggestedPrerequisite[]
): void {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  for (const edge of edges) {
    const to = byId.get(edge.to_concept_id);
    const from = byId.get(edge.from_concept_id);
    if (!to || !from) {
      continue;
    }
    if (!to.dependency_graph.prerequisites.includes(edge.from_concept_id)) {
      to.dependency_graph.prerequisites.push(edge.from_concept_id);
    }
    if (!from.dependency_graph.unlocks.includes(edge.to_concept_id)) {
      from.dependency_graph.unlocks.push(edge.to_concept_id);
    }
  }
}
