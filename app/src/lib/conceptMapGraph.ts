import type { LibraryBundle, LibraryConcept } from "./libraryTypes";

export type ConceptMapEdgeKind =
  | "prerequisite"
  | "unlocks"
  | "reinforces"
  | "contrasts"
  | "causes"
  | "associated_with"
  | "related";

export type ConceptMapEdgeSource = "relationship" | "dependency_graph" | "related_concepts";

export interface ConceptMapEdge {
  id: string;
  from: string;
  to: string;
  kind: ConceptMapEdgeKind;
  directionality: "forward" | "bidirectional";
  source: ConceptMapEdgeSource;
  label: string;
}

export interface ConceptMapNodeLayout {
  id: string;
  x: number;
  y: number;
  layer: number;
}

export interface ConceptMapLayout {
  nodes: ConceptMapNodeLayout[];
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
}

export const CONCEPT_MAP_NODE_WIDTH = 176;
export const CONCEPT_MAP_NODE_HEIGHT = 68;
const LAYER_GAP_Y = 108;
const NODE_GAP_X = 28;
const PADDING = 48;

const STRUCTURAL_KINDS: ConceptMapEdgeKind[] = ["prerequisite", "unlocks"];

export const EDGE_STYLES: Record<
  ConceptMapEdgeKind,
  { stroke: string; dash?: string; label: string }
> = {
  prerequisite: { stroke: "#3d5a80", label: "Prerequisite" },
  unlocks: { stroke: "#5b7fb8", label: "Unlocks" },
  reinforces: { stroke: "#2d8a6e", dash: "6 4", label: "Reinforces" },
  contrasts: { stroke: "#b85c5c", dash: "4 4", label: "Contrasts" },
  causes: { stroke: "#8b5cf6", label: "Causes" },
  associated_with: { stroke: "#9aa8c4", dash: "3 5", label: "Associated" },
  related: { stroke: "#9aa8c4", dash: "3 5", label: "Related" },
};

function edgeKey(from: string, to: string, kind: string): string {
  return `${from}->${to}:${kind}`;
}

function asEdgeKind(value: string): ConceptMapEdgeKind {
  const allowed: ConceptMapEdgeKind[] = [
    "prerequisite",
    "unlocks",
    "reinforces",
    "contrasts",
    "causes",
    "associated_with",
    "related",
  ];
  return allowed.includes(value as ConceptMapEdgeKind)
    ? (value as ConceptMapEdgeKind)
    : "associated_with";
}

/** Build deduplicated edges from relationships, dependency_graph, and related_concepts. */
export function buildConceptMapEdges(bundle: LibraryBundle): ConceptMapEdge[] {
  const edges: ConceptMapEdge[] = [];
  const seen = new Set<string>();

  for (const rel of bundle.relationships) {
    const kind = asEdgeKind(rel.relation.relationship_type);
    const from = rel.endpoints.from_concept_id;
    const to = rel.endpoints.to_concept_id;
    const key = edgeKey(from, to, kind);
    if (seen.has(key)) continue;

    seen.add(key);
    edges.push({
      id: rel.relationship_id,
      from,
      to,
      kind,
      directionality: rel.relation.directionality as "forward" | "bidirectional",
      source: "relationship",
      label: kind,
    });

    if (rel.relation.directionality === "bidirectional") {
      seen.add(edgeKey(to, from, kind));
    }
  }

  for (const concept of bundle.concepts) {
    for (const prereq of concept.dependency_graph.prerequisites) {
      const key = edgeKey(prereq, concept.id, "prerequisite");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        id: `dep_${prereq}_to_${concept.id}`,
        from: prereq,
        to: concept.id,
        kind: "prerequisite",
        directionality: "forward",
        source: "dependency_graph",
        label: "prerequisite",
      });
    }

    for (const relatedId of concept.dependency_graph.related_concepts) {
      const key =
        concept.id < relatedId
          ? `related:${concept.id}|${relatedId}`
          : `related:${relatedId}|${concept.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        id: `related_${concept.id}_${relatedId}`,
        from: concept.id,
        to: relatedId,
        kind: "related",
        directionality: "bidirectional",
        source: "related_concepts",
        label: "related",
      });
    }
  }

  return edges;
}

function prerequisiteEdges(edges: ConceptMapEdge[]): Array<{ from: string; to: string }> {
  return edges
    .filter((e) => e.kind === "prerequisite" && e.directionality === "forward")
    .map((e) => ({ from: e.from, to: e.to }));
}

/** Layer concepts by longest prerequisite chain (learning order top → bottom). */
export function computeConceptLayers(
  concepts: LibraryConcept[],
  edges: ConceptMapEdge[]
): Map<string, number> {
  const prereq = prerequisiteEdges(edges);
  const layers = new Map<string, number>();

  function depth(id: string, visiting: Set<string>): number {
    if (layers.has(id)) return layers.get(id)!;
    if (visiting.has(id)) return 0;
    visiting.add(id);

    const parents = prereq.filter((e) => e.to === id).map((e) => e.from);
    const d =
      parents.length === 0 ? 0 : 1 + Math.max(...parents.map((p) => depth(p, visiting)));

    visiting.delete(id);
    layers.set(id, d);
    return d;
  }

  for (const concept of concepts) {
    depth(concept.id, new Set());
  }

  return layers;
}

export function layoutConceptMap(
  concepts: LibraryConcept[],
  edges: ConceptMapEdge[]
): ConceptMapLayout {
  const layers = computeConceptLayers(concepts, edges);
  const byLayer = new Map<number, LibraryConcept[]>();

  for (const concept of concepts) {
    const layer = layers.get(concept.id) ?? 0;
    const list = byLayer.get(layer) ?? [];
    list.push(concept);
    byLayer.set(layer, list);
  }

  const sortedLayers = [...byLayer.keys()].sort((a, b) => a - b);
  const nodes: ConceptMapNodeLayout[] = [];

  for (const layer of sortedLayers) {
    const row = (byLayer.get(layer) ?? []).sort((a, b) =>
      a.content.title.localeCompare(b.content.title)
    );
    const rowWidth =
      row.length * CONCEPT_MAP_NODE_WIDTH + Math.max(0, row.length - 1) * NODE_GAP_X;
    const startX = PADDING + Math.max(0, (computeMaxRowWidth(byLayer) - rowWidth) / 2);

    row.forEach((concept, index) => {
      nodes.push({
        id: concept.id,
        x: startX + index * (CONCEPT_MAP_NODE_WIDTH + NODE_GAP_X) + CONCEPT_MAP_NODE_WIDTH / 2,
        y: PADDING + layer * LAYER_GAP_Y + CONCEPT_MAP_NODE_HEIGHT / 2,
        layer,
      });
    });
  }

  const maxRowWidth = computeMaxRowWidth(byLayer);
  const maxLayer = sortedLayers.length > 0 ? Math.max(...sortedLayers) : 0;

  return {
    nodes,
    width: maxRowWidth + PADDING * 2,
    height: PADDING * 2 + maxLayer * LAYER_GAP_Y + CONCEPT_MAP_NODE_HEIGHT + 24,
    nodeWidth: CONCEPT_MAP_NODE_WIDTH,
    nodeHeight: CONCEPT_MAP_NODE_HEIGHT,
  };
}

function computeMaxRowWidth(byLayer: Map<number, LibraryConcept[]>): number {
  let max = 0;
  for (const row of byLayer.values()) {
    const w = row.length * CONCEPT_MAP_NODE_WIDTH + Math.max(0, row.length - 1) * NODE_GAP_X;
    if (w > max) max = w;
  }
  return max;
}

export function getStructuralEdges(edges: ConceptMapEdge[]): ConceptMapEdge[] {
  return edges.filter((e) => STRUCTURAL_KINDS.includes(e.kind));
}

export function getSemanticEdges(edges: ConceptMapEdge[]): ConceptMapEdge[] {
  return edges.filter((e) => !STRUCTURAL_KINDS.includes(e.kind));
}

export interface ConceptMapAnchor {
  x: number;
  y: number;
}

/** Pick connection points so downward flow reads naturally. */
export function getEdgeAnchors(
  from: ConceptMapNodeLayout,
  to: ConceptMapNodeLayout,
  nodeWidth: number,
  nodeHeight: number
): { from: ConceptMapAnchor; to: ConceptMapAnchor; curved: boolean } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const halfW = nodeWidth / 2;
  const halfH = nodeHeight / 2;

  if (dy > 8) {
    return {
      from: { x: from.x, y: from.y + halfH },
      to: { x: to.x, y: to.y - halfH },
      curved: Math.abs(dx) > nodeWidth * 0.6,
    };
  }

  if (dy < -8) {
    return {
      from: { x: from.x, y: from.y - halfH },
      to: { x: to.x, y: to.y + halfH },
      curved: true,
    };
  }

  const fromSide = dx >= 0 ? 1 : -1;
  return {
    from: { x: from.x + fromSide * halfW, y: from.y },
    to: { x: to.x - fromSide * halfW, y: to.y },
    curved: Math.abs(dx) < nodeWidth * 0.5,
  };
}

export function edgePath(
  from: ConceptMapAnchor,
  to: ConceptMapAnchor,
  curved: boolean
): string {
  if (!curved) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const cx = mx - dy * 0.15;
  const cy = my + dx * 0.15;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

/** @deprecated Use buildConceptMapEdges — kept for any stale imports */
export function getConceptMapEdges(bundle: LibraryBundle) {
  return buildConceptMapEdges(bundle).map((e) => ({
    id: e.id,
    from: e.from,
    to: e.to,
    type: e.kind,
    label: e.label,
  }));
}
