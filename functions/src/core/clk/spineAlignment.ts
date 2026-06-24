/**
 * CLKT alignment — universal concept identity first, spine id second, cosine at leaves.
 */

export interface UniversalConceptRef {
  id: string;
  spine_concept_id?: string | null;
}

export interface ConceptAlignmentMatch {
  sourceConceptId: string;
  targetConceptId: string;
  alignmentKey: string;
  matchType: "universal_id" | "spine_id";
  /** Exact alignment confidence for id/spine matches. */
  alignmentConfidence: 1;
}

/**
 * Match concepts across libraries by shared universal concept id, then spine_concept_id.
 */
export function alignConceptsAcrossLibraries(
  sourceConcepts: UniversalConceptRef[],
  targetConcepts: UniversalConceptRef[]
): ConceptAlignmentMatch[] {
  const matches: ConceptAlignmentMatch[] = [];
  const matchedPairs = new Set<string>();

  const targetById = indexByKey(targetConcepts, (concept) => concept.id);
  const targetBySpine = indexByKey(
    targetConcepts,
    (concept) => concept.spine_concept_id?.trim() || null
  );

  for (const source of sourceConcepts) {
    const universalTargets = targetById.get(source.id) ?? [];
    for (const targetConceptId of universalTargets) {
      addMatch(matches, matchedPairs, {
        sourceConceptId: source.id,
        targetConceptId,
        alignmentKey: source.id,
        matchType: "universal_id",
        alignmentConfidence: 1,
      });
    }

    const spineId = source.spine_concept_id?.trim();
    if (!spineId) {
      continue;
    }
    const spineTargets = targetBySpine.get(spineId) ?? [];
    for (const targetConceptId of spineTargets) {
      addMatch(matches, matchedPairs, {
        sourceConceptId: source.id,
        targetConceptId,
        alignmentKey: spineId,
        matchType: "spine_id",
        alignmentConfidence: 1,
      });
    }
  }

  return matches;
}

/** @deprecated Use alignConceptsAcrossLibraries */
export function alignConceptsBySpine(
  sourceConcepts: UniversalConceptRef[],
  targetConcepts: UniversalConceptRef[]
): Array<{
  sourceConceptId: string;
  targetConceptId: string;
  spineConceptId: string;
  spineConfidence: 1;
}> {
  return alignConceptsAcrossLibraries(sourceConcepts, targetConcepts).map((match) => ({
    sourceConceptId: match.sourceConceptId,
    targetConceptId: match.targetConceptId,
    spineConceptId: match.alignmentKey,
    spineConfidence: 1,
  }));
}

function indexByKey(
  concepts: UniversalConceptRef[],
  keyFor: (concept: UniversalConceptRef) => string | null
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const concept of concepts) {
    const key = keyFor(concept);
    if (!key) {
      continue;
    }
    const bucket = map.get(key) ?? [];
    bucket.push(concept.id);
    map.set(key, bucket);
  }
  return map;
}

function addMatch(
  matches: ConceptAlignmentMatch[],
  matchedPairs: Set<string>,
  match: ConceptAlignmentMatch
): void {
  const pairKey = `${match.sourceConceptId}::${match.targetConceptId}::${match.matchType}`;
  if (matchedPairs.has(pairKey)) {
    return;
  }
  matchedPairs.add(pairKey);
  matches.push(match);
}

export interface TransferConfidenceInput {
  alignmentConfidence: number;
  leafCosineSimilarity: number;
}

/** Universal/spine match dominates; leaf cosine similarity refines confidence. */
export function computeTransferConfidence(input: TransferConfidenceInput): number {
  const alignment = Math.max(0, Math.min(1, input.alignmentConfidence));
  const leaf = Math.max(0, Math.min(1, input.leafCosineSimilarity));
  return alignment * 0.85 + leaf * 0.15;
}
