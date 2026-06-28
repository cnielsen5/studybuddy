/**
 * Structure-preserving concept extraction.
 *
 * When provided content already carries an explicit hierarchy (heading levels /
 * structural heading trails), this extractor mirrors that structure into the
 * concept map instead of flattening it: each outline node becomes a concept,
 * outline depth is mapped to a resolution level, and parent/child + prerequisite
 * edges follow the document's nesting.
 *
 * Used when `detectSourceStructure` reports the source is meaningfully nested.
 */
import type { DomainProfile } from "../types/domainProfile.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import {
  buildDomainContextFromLegacy,
  ensureLinkedContentAggregate,
} from "../types/domainContext.js";
import type { ResolutionLevel } from "../types/resolution.js";
import type { ParsedSection, ParsedSource } from "../types/parsedSource.js";
import type {
  ConceptGraphDraft,
  DraftConcept,
  SuggestedPrerequisite,
} from "../types/draftConcept.js";
import { ConceptGraphDraftSchema } from "../types/draftConcept.js";
import { expandDenseBlocks } from "../ingestors/contentBlockExtractor.js";
import { mergeParagraphBlocks, slugify, uniqueConceptId } from "./heuristicConceptExtractor.js";

const SKIP_TITLES =
  /^(introduction|intro|overview|summary|conclusion|references|table of contents|preface|index|figure|paragraph|document|contents)$/i;

export interface SourceStructureReport {
  hasStructure: boolean;
  maxDepth: number;
  nodeCount: number;
  /** Distinct outline depths observed (e.g. [1,2,3]). */
  depths: number[];
}

interface OutlineNode {
  key: string;
  path: string[];
  title: string;
  depth: number;
  bodyParts: string[];
  parentKey: string | null;
  childKeys: string[];
  order: number;
}

function cleanTrail(values: string[]): string[] {
  const out: string[] = [];
  for (const raw of values) {
    const v = (raw ?? "").trim();
    if (!v) continue;
    if (SKIP_TITLES.test(v)) continue;
    if (out[out.length - 1] === v) continue;
    out.push(v);
  }
  return out;
}

/** Full heading path for a block (the chain of headings it lives under, incl. itself for headings). */
function blockPath(block: ParsedSection): string[] {
  const trail = cleanTrail(block.structuralHeadingTrail);
  if (block.blockType === "heading_section") {
    const title = (block.title ?? "").trim();
    if (title && !SKIP_TITLES.test(title) && trail[trail.length - 1] !== title) {
      return [...trail, title];
    }
    return trail;
  }
  // Content block: belongs to its deepest heading context.
  if (trail.length > 0) return trail;
  const title = (block.title ?? "").trim();
  return title && !SKIP_TITLES.test(title) ? [title] : [];
}

function buildOutline(sections: ParsedSection[]): OutlineNode[] {
  const blocks = mergeParagraphBlocks(expandDenseBlocks(sections));
  const nodes = new Map<string, OutlineNode>();
  let order = 0;

  const ensureNode = (path: string[]): OutlineNode | null => {
    if (path.length === 0) return null;
    const key = path.join(" › ").toLowerCase();
    let node = nodes.get(key);
    if (!node) {
      const parentPath = path.slice(0, -1);
      const parent = ensureNode(parentPath);
      node = {
        key,
        path,
        title: path[path.length - 1],
        depth: path.length,
        bodyParts: [],
        parentKey: parent ? parent.key : null,
        childKeys: [],
        order: order++,
      };
      nodes.set(key, node);
      if (parent && !parent.childKeys.includes(key)) parent.childKeys.push(key);
    }
    return node;
  };

  for (const block of blocks) {
    const path = blockPath(block);
    const node = ensureNode(path);
    if (node && block.body.trim()) node.bodyParts.push(block.body.trim());
  }

  return [...nodes.values()].sort((a, b) => a.order - b.order);
}

export function detectSourceStructure(parsedSource: ParsedSource): SourceStructureReport {
  const outline = buildOutline(parsedSource.sections);
  const depths = [...new Set(outline.map((n) => n.depth))].sort((a, b) => a - b);
  const maxDepth = depths.length ? depths[depths.length - 1] : 0;
  const nestedNodes = outline.filter((n) => n.depth >= 2).length;
  // Meaningful structure = at least two levels and several nested nodes.
  const hasStructure = maxDepth >= 2 && nestedNodes >= 2 && outline.length >= 3;
  return { hasStructure, maxDepth, nodeCount: outline.length, depths };
}

/** Map outline depth → resolution level, then clamp into the audience window. */
function depthToResolution(depth: number, range: { min: ResolutionLevel; max: ResolutionLevel }): ResolutionLevel {
  const raw = Math.min(5, Math.max(2, depth + 1)); // depth1→2, depth2→3, depth3→4, depth4+→5
  const clamped = Math.min(range.max, Math.max(range.min, raw));
  return clamped as ResolutionLevel;
}

function hierarchyForNode(node: OutlineNode, domain: string) {
  const p = node.path;
  const category = p[0] ?? domain;
  const subcategory = p[1] ?? category;
  const topic = p[2] ?? (p.length >= 2 ? p[p.length - 1] : p[0] ?? node.title);
  const subtopic =
    p.length >= 4 ? p.slice(3).join(" › ") : p.length === 3 ? undefined : undefined;
  return { category, subcategory, topic: topic ?? node.title, subtopic };
}

function firstSentence(body: string): string {
  const t = body.trim();
  if (!t) return "";
  const m = t.match(/^(.+?[.!?])(\s|$)/);
  return (m?.[1] ?? t.slice(0, 160)).trim();
}

function summarize(body: string, title: string): string {
  const t = body.trim();
  if (!t) return `Covers ${title}.`;
  return t.length <= 280 ? t : `${t.slice(0, 277).trim()}...`;
}

export interface StructuredExtractOptions {
  maxConcepts?: number;
}

export function extractConceptGraphStructured(
  parsedSource: ParsedSource,
  intent: LibraryCreationIntent,
  domainProfile: DomainProfile,
  options: StructuredExtractOptions = {}
): ConceptGraphDraft {
  const maxConcepts = options.maxConcepts ?? 60;
  const proposedLibraryId = `lib_${slugify(intent.libraryTitle).replace(/^lib_/, "") || "untitled"}`.slice(0, 48);
  const now = new Date().toISOString();
  const range = intent.audience.resolutionRange;

  let outline = buildOutline(parsedSource.sections);
  if (outline.length === 0) {
    throw new Error("No structured outline could be built from the provided content.");
  }

  // Cap size by trimming the deepest leaves first, preserving the skeleton.
  if (outline.length > maxConcepts) {
    const keep = new Set(outline.map((n) => n.key));
    const byDepthDesc = [...outline].sort((a, b) => b.depth - a.depth || b.order - a.order);
    for (const node of byDepthDesc) {
      if (keep.size <= maxConcepts) break;
      if (node.childKeys.some((k) => keep.has(k))) continue; // never drop a node with kept children
      keep.delete(node.key);
    }
    outline = outline.filter((n) => keep.has(n.key));
  }

  const keyToId = new Map<string, string>();
  const usedIds = new Set<string>();
  for (const node of outline) keyToId.set(node.key, uniqueConceptId(node.title, usedIds));

  const keptKeys = new Set(outline.map((n) => n.key));
  /** Nearest kept ancestor id for a node (handles trimmed intermediate nodes). */
  const nearestKeptParentId = (node: OutlineNode): string | undefined => {
    let parentKey = node.parentKey;
    while (parentKey) {
      if (keptKeys.has(parentKey)) return keyToId.get(parentKey);
      parentKey = outlineByKey.get(parentKey)?.parentKey ?? null;
    }
    return undefined;
  };
  const outlineByKey = new Map(outline.map((n) => [n.key, n]));

  const concepts: DraftConcept[] = outline.map((node) => {
    const id = keyToId.get(node.key)!;
    const resolutionLevel = depthToResolution(node.depth, range);
    const hierarchy = hierarchyForNode(node, intent.domain);
    const body = node.bodyParts.join("\n\n");

    const { knowledge_graph, domain_context } = buildDomainContextFromLegacy({
      domain: intent.domain,
      libraryId: proposedLibraryId,
      hierarchy,
      resolutionLevel,
      maxResolutionInContext: range.max,
    });

    const concept: DraftConcept = {
      id,
      type: "concept",
      resolution_level: resolutionLevel,
      metadata: {
        created_at: now,
        updated_at: now,
        created_by: "library_creator",
        last_updated_by: "library_creator",
        version: "0.1.0",
        status: "draft",
        tags: [slugify(intent.domain), slugify(domainProfile.archetypeId)],
        search_keywords: [...new Set(`${node.title} ${body}`.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3))].slice(0, 6),
      },
      editorial: {
        difficulty: node.depth <= 1 ? "basic" : node.depth >= 3 ? "advanced" : "intermediate",
        high_yield_score: intent.purpose === "exam_prep" ? 8 : 7,
      },
      knowledge_graph,
      domain_contexts: [domain_context],
      hierarchy: {
        library_id: proposedLibraryId,
        domain: intent.domain,
        ...hierarchy,
      },
      content: {
        title: node.title,
        definition: firstSentence(body) || node.title,
        summary: summarize(body, node.title),
      },
      dependency_graph: {
        parent_concept_id: nearestKeptParentId(node),
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
      linked_content: { card_ids: [], question_ids: [] },
      provenance: {
        sourceSectionTitle: node.title,
        extractionMethod: "heuristic",
        confidence: body ? 0.7 : 0.55,
      },
    };
    ensureLinkedContentAggregate(concept);
    return concept;
  });

  // Wire parent → child edges (child requires parent; parent unlocks child).
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const suggestedPrerequisites: SuggestedPrerequisite[] = [];
  for (const concept of concepts) {
    const parentId = concept.dependency_graph.parent_concept_id;
    if (!parentId) continue;
    const parent = byId.get(parentId);
    if (!parent) continue;
    if (!parent.dependency_graph.child_concepts.includes(concept.id)) {
      parent.dependency_graph.child_concepts.push(concept.id);
    }
    if (!concept.dependency_graph.prerequisites.includes(parentId)) {
      concept.dependency_graph.prerequisites.push(parentId);
    }
    if (!parent.dependency_graph.unlocks.includes(concept.id)) {
      parent.dependency_graph.unlocks.push(concept.id);
    }
    suggestedPrerequisites.push({
      from_concept_id: parentId,
      to_concept_id: concept.id,
      reason: "Mirrors provided content hierarchy (parent → child)",
    });
  }

  const depths = [...new Set(outline.map((n) => n.depth))].sort((a, b) => a - b);
  const draft: ConceptGraphDraft = {
    proposedLibraryId,
    concepts,
    suggestedPrerequisites,
    extractionMethod: "heuristic",
    notes: [
      `Structure-preserving extraction: mirrored ${concepts.length} concepts from the provided content's outline.`,
      `Outline depths ${depths.join(", ")} mapped to resolution levels within the audience window (${range.min}-${range.max}).`,
      "Each layer reflects a heading level in the source; parent → child edges follow the document nesting.",
    ],
  };

  return ConceptGraphDraftSchema.parse(draft);
}
