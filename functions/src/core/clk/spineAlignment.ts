/**
 * CLKT alignment — match library concepts exclusively via anchor_concept_id (spine IDs).
 */

export interface LibraryConceptRef {
  id: string;
  anchor_concept_id?: string | null;
  /** @deprecated Use anchor_concept_id */
  spine_concept_id?: string | null;
}

export interface ConceptAlignmentMatch {
  sourceConceptId: string;
  targetConceptId: string;
  alignmentKey: string;
  matchType: "anchor_concept_id";
  alignmentConfidence: 1;
}

function resolveAnchorId(concept: LibraryConceptRef): string | null {
  return concept.anchor_concept_id?.trim() || concept.spine_concept_id?.trim() || null;
}

/**
 * Match concepts across libraries by shared spine anchor id only.
 * CLKT never matches on library concept ids directly.
 */
export function alignConceptsAcrossLibraries(
  sourceConcepts: LibraryConceptRef[],
  targetConcepts: LibraryConceptRef[]
): ConceptAlignmentMatch[] {
  const matches: ConceptAlignmentMatch[] = [];
  const matchedPairs = new Set<string>();

  const targetByAnchor = indexByKey(targetConcepts, resolveAnchorId);

  for (const source of sourceConcepts) {
    const anchorId = resolveAnchorId(source);
    if (!anchorId) {
      continue;
    }
    const anchorTargets = targetByAnchor.get(anchorId) ?? [];
    for (const targetConceptId of anchorTargets) {
      addMatch(matches, matchedPairs, {
        sourceConceptId: source.id,
        targetConceptId,
        alignmentKey: anchorId,
        matchType: "anchor_concept_id",
        alignmentConfidence: 1,
      });
    }
  }

  return matches;
}

/** @deprecated Use alignConceptsAcrossLibraries */
export function alignConceptsBySpine(
  sourceConcepts: LibraryConceptRef[],
  targetConcepts: LibraryConceptRef[]
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
  concepts: LibraryConceptRef[],
  keyFor: (concept: LibraryConceptRef) => string | null
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

/** Anchor match dominates; leaf cosine similarity refines confidence. */
export function computeTransferConfidence(input: TransferConfidenceInput): number {
  const alignment = Math.max(0, Math.min(1, input.alignmentConfidence));
  const leaf = Math.max(0, Math.min(1, input.leafCosineSimilarity));
  return alignment * 0.85 + leaf * 0.15;
}
