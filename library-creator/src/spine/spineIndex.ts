import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ResolutionLevel } from "../types/resolution.js";

/** Normalized spine node for search, placement, and growth proposals. */
export interface IndexedSpineConcept {
  id: string;
  resolution_level: ResolutionLevel;
  anchor_concept_id: string | null;
  content: {
    title: string;
    definition: string;
    summary: string;
  };
  primary_domain: string;
  domain_ids: string[];
  parent_concept_id: string | null;
  knowledge_area: string;
  knowledge_cluster: string;
  max_resolution_by_domain: Record<string, ResolutionLevel>;
}

export interface SpineIndex {
  concepts: IndexedSpineConcept[];
  byId: Map<string, IndexedSpineConcept>;
  l3Ids: Set<string>;
}

function levelFromId(id: string): ResolutionLevel | null {
  const m = id.match(/_l([1-5])_/);
  if (!m) return null;
  return Number(m[1]) as ResolutionLevel;
}

function indexL1L3Concept(raw: Record<string, unknown>): IndexedSpineConcept {
  const id = raw.id as string;
  const kg = raw.knowledge_graph as {
    knowledge_area: string;
    knowledge_cluster: string;
    primary_domain: string;
  };
  const domainContexts = raw.domain_contexts as Array<{
    domain_id: string;
    framing: { max_resolution_in_context: ResolutionLevel };
  }>;
  const dep = raw.dependency_graph as { parent_concept_id?: string | null };
  const maxByDomain: Record<string, ResolutionLevel> = {};
  for (const dc of domainContexts) {
    maxByDomain[dc.domain_id] = dc.framing.max_resolution_in_context;
  }
  return {
    id,
    resolution_level: (raw.resolution_level as ResolutionLevel) ?? levelFromId(id) ?? 3,
    anchor_concept_id: null,
    content: raw.content as IndexedSpineConcept["content"],
    primary_domain: kg.primary_domain,
    domain_ids: domainContexts.map((dc) => dc.domain_id),
    parent_concept_id: dep.parent_concept_id ?? null,
    knowledge_area: kg.knowledge_area,
    knowledge_cluster: kg.knowledge_cluster,
    max_resolution_by_domain: maxByDomain,
  };
}

function indexL4L5Concept(raw: Record<string, unknown>): IndexedSpineConcept {
  const id = raw.id as string;
  const kg = raw.knowledge_graph as {
    knowledge_area: string;
    knowledge_cluster: string;
    primary_domain: string;
  };
  const domainContexts = raw.domain_contexts as Array<{
    domain_id: string;
    framing: { max_resolution_in_context: ResolutionLevel };
  }>;
  const dep = raw.dependency_graph as { parent_concept_id: string };
  const anchor = raw.anchor_concept_id as string;
  const maxByDomain: Record<string, ResolutionLevel> = {};
  for (const dc of domainContexts) {
    maxByDomain[dc.domain_id] = dc.framing.max_resolution_in_context;
  }
  return {
    id,
    resolution_level: (raw.resolution_level as ResolutionLevel) ?? levelFromId(id) ?? 4,
    anchor_concept_id: anchor,
    content: raw.content as IndexedSpineConcept["content"],
    primary_domain: kg.primary_domain,
    domain_ids: domainContexts.map((dc) => dc.domain_id),
    parent_concept_id: dep.parent_concept_id,
    knowledge_area: kg.knowledge_area,
    knowledge_cluster: kg.knowledge_cluster,
    max_resolution_by_domain: maxByDomain,
  };
}

export function buildSpineIndexFromBundle(bundle: {
  concepts: Record<string, unknown>[];
}): SpineIndex {
  const concepts: IndexedSpineConcept[] = bundle.concepts.map((raw) => {
    const level = (raw.resolution_level as number) ?? levelFromId(raw.id as string) ?? 3;
    return level <= 3 ? indexL1L3Concept(raw) : indexL4L5Concept(raw);
  });
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const l3Ids = new Set(concepts.filter((c) => c.resolution_level === 3).map((c) => c.id));
  return { concepts, byId, l3Ids };
}

export function loadSpineIndex(repoRoot: string): SpineIndex {
  const path = join(repoRoot, "content/spine/socrates-spine-l1-l5.draft.json");
  const bundle = JSON.parse(readFileSync(path, "utf8")) as {
    concepts: Record<string, unknown>[];
  };
  return buildSpineIndexFromBundle(bundle);
}

export function conceptsInDomain(index: SpineIndex, domainId: string): IndexedSpineConcept[] {
  return index.concepts.filter((c) => c.domain_ids.includes(domainId));
}

export function resolveAnchorL3(
  index: SpineIndex,
  concept: IndexedSpineConcept
): IndexedSpineConcept | undefined {
  if (concept.resolution_level === 3) return concept;
  const anchorId = concept.anchor_concept_id ?? concept.id;
  if (index.l3Ids.has(anchorId)) return index.byId.get(anchorId);
  // L4/L5 parent may be another L4 — walk up to L3
  let current: IndexedSpineConcept | undefined = concept;
  const seen = new Set<string>();
  while (current) {
    if (current.resolution_level === 3) return current;
    const nextId = current.anchor_concept_id ?? current.parent_concept_id;
    if (!nextId || seen.has(nextId)) break;
    seen.add(nextId);
    if (index.l3Ids.has(nextId)) return index.byId.get(nextId);
    current = index.byId.get(nextId);
  }
  return undefined;
}

export function maxResolutionForAnchor(
  index: SpineIndex,
  anchorL3Id: string,
  domainId: string
): ResolutionLevel | undefined {
  const l3 = index.byId.get(anchorL3Id);
  return l3?.max_resolution_by_domain[domainId];
}
