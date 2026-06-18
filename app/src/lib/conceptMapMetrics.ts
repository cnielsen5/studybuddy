import type { LibraryBundle, LibraryConcept } from "./libraryTypes";

export const SEMANTIC_SIMILARITY_THRESHOLD = 0.75;
export const COMBINED_DEGREE_ALPHA = 0.25;

export interface ConceptGraphMetrics {
  id: string;
  vector: number[];
  structuralDegree: number;
  semanticDegree: number;
  combinedDegree: number;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

/** Proxy centroid vector from concept text (until real embeddings ship in metrics layer). */
export function conceptProxyVector(concept: LibraryConcept, dim = 48): number[] {
  const h = concept.hierarchy as Record<string, string | undefined>;
  const text = [
    concept.content.title,
    concept.content.definition,
    concept.content.summary,
    h.topic,
    h.subtopic,
    h.category,
    h.subcategory,
  ]
    .filter(Boolean)
    .join(" ");

  const vec = new Array<number>(dim).fill(0);
  for (const token of tokenize(text)) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % dim;
    vec[idx] += 1;
  }

  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

function structuralNeighbors(
  conceptId: string,
  bundle: LibraryBundle
): Set<string> {
  const neighbors = new Set<string>();
  const concept = bundle.concepts.find((c) => c.id === conceptId);
  if (!concept) return neighbors;

  for (const id of concept.dependency_graph.prerequisites) neighbors.add(id);
  for (const id of concept.dependency_graph.unlocks) neighbors.add(id);
  for (const id of concept.dependency_graph.related_concepts) neighbors.add(id);

  for (const rel of bundle.relationships) {
    const { from_concept_id: from, to_concept_id: to } = rel.endpoints;
    if (from === conceptId) neighbors.add(to);
    if (to === conceptId) neighbors.add(from);
  }

  neighbors.delete(conceptId);
  return neighbors;
}

export function computeConceptGraphMetrics(bundle: LibraryBundle): Map<string, ConceptGraphMetrics> {
  const vectors = new Map(
    bundle.concepts.map((c) => [c.id, conceptProxyVector(c)] as const)
  );

  const metrics = new Map<string, ConceptGraphMetrics>();

  for (const concept of bundle.concepts) {
    const vector = vectors.get(concept.id)!;
    const structuralDegree = structuralNeighbors(concept.id, bundle).size;

    let semanticDegree = 0;
    for (const other of bundle.concepts) {
      if (other.id === concept.id) continue;
      const sim = cosineSimilarity(vector, vectors.get(other.id)!);
      if (sim >= SEMANTIC_SIMILARITY_THRESHOLD) semanticDegree += 1;
    }

    const combinedDegree =
      COMBINED_DEGREE_ALPHA * structuralDegree +
      (1 - COMBINED_DEGREE_ALPHA) * semanticDegree;

    metrics.set(concept.id, {
      id: concept.id,
      vector,
      structuralDegree,
      semanticDegree,
      combinedDegree,
    });
  }

  return metrics;
}

export function semanticPairs(
  bundle: LibraryBundle,
  metrics: Map<string, ConceptGraphMetrics>
): Array<{ a: string; b: string; similarity: number }> {
  const pairs: Array<{ a: string; b: string; similarity: number }> = [];

  for (let i = 0; i < bundle.concepts.length; i++) {
    for (let j = i + 1; j < bundle.concepts.length; j++) {
      const a = bundle.concepts[i].id;
      const b = bundle.concepts[j].id;
      const sim = cosineSimilarity(metrics.get(a)!.vector, metrics.get(b)!.vector);
      if (sim >= SEMANTIC_SIMILARITY_THRESHOLD) {
        pairs.push({ a, b, similarity: sim });
      }
    }
  }

  return pairs;
}

export function maxCombinedDegree(metrics: Map<string, ConceptGraphMetrics>): number {
  let max = 0;
  for (const m of metrics.values()) {
    if (m.combinedDegree > max) max = m.combinedDegree;
  }
  return max || 1;
}
