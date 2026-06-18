import type { LibraryBundle } from "./libraryTypes";
import { buildConceptMapEdges } from "./conceptMapGraph";
import {
  computeConceptGraphMetrics,
  maxCombinedDegree,
  semanticPairs,
  type ConceptGraphMetrics,
} from "./conceptMapMetrics";
import type { TaxonomyNode } from "./conceptMapHierarchy";

export interface LayoutPoint {
  x: number;
  y: number;
}

const CANVAS = 720;
const PADDING = 80;

export function layoutConceptPositions(bundle: LibraryBundle): Map<string, LayoutPoint> {
  const metrics = computeConceptGraphMetrics(bundle);
  const edges = buildConceptMapEdges(bundle);
  const semPairs = semanticPairs(bundle, metrics);
  const maxDegree = maxCombinedDegree(metrics);

  const state = new Map<
    string,
    { x: number; y: number; vx: number; vy: number; mass: number }
  >();

  for (const concept of bundle.concepts) {
    const m = metrics.get(concept.id)!;
    state.set(concept.id, {
      x: (m.vector[0] - 0.5) * CANVAS * 0.6,
      y: (m.vector[2] - 0.5) * CANVAS * 0.6,
      vx: 0,
      vy: 0,
      mass: 0.8 + (m.combinedDegree / maxDegree) * 1.4,
    });
  }

  const structuralLinks = edges
    .filter((e) => e.kind === "prerequisite" || e.kind === "unlocks")
    .map((e) => ({ from: e.from, to: e.to }));

  const ids = bundle.concepts.map((c) => c.id);

  for (let iter = 0; iter < 120; iter++) {
    const damping = 0.82;

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = state.get(ids[i])!;
        const b = state.get(ids[j])!;
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const repulse = (14000 / (dist * dist)) * (iter < 40 ? 1.4 : 1);
        const fx = (dx / dist) * repulse;
        const fy = (dy / dist) * repulse;
        a.vx -= fx / a.mass;
        a.vy -= fy / a.mass;
        b.vx += fx / b.mass;
        b.vy += fy / b.mass;
      }
    }

    for (const { from, to } of structuralLinks) {
      const a = state.get(from);
      const b = state.get(to);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const target = 110;
      const pull = (dist - target) * 0.018;
      const fx = (dx / dist) * pull;
      const fy = (dy / dist) * pull;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    for (const { a: idA, b: idB, similarity } of semPairs) {
      const a = state.get(idA);
      const b = state.get(idB);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const target = 70 + (1 - similarity) * 60;
      const pull = (dist - target) * 0.012 * similarity;
      const fx = (dx / dist) * pull;
      const fy = (dy / dist) * pull;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    for (const concept of bundle.concepts) {
      const node = state.get(concept.id)!;
      const m = metrics.get(concept.id)!;
      const gravity = 0.004 * (m.combinedDegree / maxDegree);
      node.vx -= node.x * gravity;
      node.vy -= node.y * gravity;
    }

    for (const id of ids) {
      const node = state.get(id)!;
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
    }
  }

  return normalizePositions(state, ids);
}

function normalizePositions(
  state: Map<string, { x: number; y: number }>,
  ids: string[]
): Map<string, LayoutPoint> {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const id of ids) {
    const p = state.get(id)!;
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scale = Math.min(
    (CANVAS - PADDING * 2) / spanX,
    (CANVAS - PADDING * 2) / spanY
  );

  const out = new Map<string, LayoutPoint>();
  for (const id of ids) {
    const p = state.get(id)!;
    out.set(id, {
      x: PADDING + (p.x - minX) * scale,
      y: PADDING + (p.y - minY) * scale,
    });
  }
  return out;
}

export function layoutTaxonomyNodes(
  tree: Map<string, TaxonomyNode>,
  conceptPositions: Map<string, LayoutPoint>
): Map<string, LayoutPoint> {
  const positions = new Map<string, LayoutPoint>();

  const concepts = [...tree.values()].filter((n) => n.level === "concept");
  for (const node of concepts) {
    const conceptId = node.conceptIds[0];
    const pos = conceptPositions.get(conceptId);
    if (pos) positions.set(node.id, pos);
  }

  const levels = ["topic", "subcategory", "category", "domain"] as const;
  for (const level of levels) {
    for (const node of tree.values()) {
      if (node.level !== level) continue;
      const childPositions = node.childIds
        .map((id) => positions.get(id))
        .filter((p): p is LayoutPoint => Boolean(p));
      if (childPositions.length === 0) continue;
      positions.set(node.id, centroid(childPositions));
    }
  }

  return positions;
}

function centroid(points: LayoutPoint[]): LayoutPoint {
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  return { x: sum.x / points.length, y: sum.y / points.length };
}

export function nodeRadius(cardCount: number, subconceptCount: number, zoomScale: number): number {
  const content = cardCount + subconceptCount;
  const base = 12 + Math.sqrt(content) * 5;
  return base * Math.max(0.65, Math.min(1.8, zoomScale * 0.85));
}

export interface DomainRegion {
  domain: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function computeDomainRegions(
  nodes: TaxonomyNode[],
  positions: Map<string, LayoutPoint>,
  radii: Map<string, number>
): DomainRegion[] {
  const byDomain = new Map<string, TaxonomyNode[]>();
  for (const node of nodes) {
    const list = byDomain.get(node.domain) ?? [];
    list.push(node);
    byDomain.set(node.domain, list);
  }

  const regions: DomainRegion[] = [];
  for (const [domain, domainNodes] of byDomain) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const node of domainNodes) {
      const pos = positions.get(node.id);
      if (!pos) continue;
      const r = (radii.get(node.id) ?? 20) + 28;
      minX = Math.min(minX, pos.x - r);
      maxX = Math.max(maxX, pos.x + r);
      minY = Math.min(minY, pos.y - r);
      maxY = Math.max(maxY, pos.y + r);
    }

    if (!Number.isFinite(minX)) continue;
    regions.push({
      domain,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    });
  }

  return regions;
}

export function getConceptMetrics(bundle: LibraryBundle): Map<string, ConceptGraphMetrics> {
  return computeConceptGraphMetrics(bundle);
}
