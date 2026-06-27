export type ResolutionLevel = 1 | 2 | 3 | 4 | 5;

export interface ResolutionRange {
  min: ResolutionLevel;
  max: ResolutionLevel;
}

export const FULL_RESOLUTION_RANGE: ResolutionRange = { min: 1, max: 5 };

export function normalizeResolutionRange(range: ResolutionRange): ResolutionRange {
  if (range.min <= range.max) {
    return range;
  }
  return { min: range.max, max: range.min };
}

export function isWithinResolutionRange(
  level: ResolutionLevel,
  range: ResolutionRange
): boolean {
  return level >= range.min && level <= range.max;
}

export function inferResolutionFromHierarchy(hierarchy: {
  domain?: string;
  category?: string;
  subcategory?: string;
  topic: string;
  subtopic?: string;
}): ResolutionLevel {
  const domain = hierarchy.domain ?? "";
  const category = hierarchy.category ?? "";
  const subcategory = hierarchy.subcategory ?? "";
  const { topic, subtopic } = hierarchy;

  if (
    subtopic &&
    subtopic.trim() &&
    subtopic !== topic &&
    subtopic !== subcategory
  ) {
    return 4;
  }
  if (topic && topic.trim() && topic !== subcategory && topic !== category) {
    return 3;
  }
  if (
    subcategory &&
    subcategory.trim() &&
    subcategory !== category &&
    subcategory !== domain
  ) {
    return 2;
  }
  if (category && category.trim() && category !== domain) {
    return 2;
  }
  if (domain && domain.trim()) {
    return 1;
  }
  return 3;
}

export interface ConceptResolutionFields {
  resolution_level?: ResolutionLevel;
  spine_concept_id?: string;
  dependency_graph?: {
    parent_concept_id?: string;
  };
}

export function filterConceptsByResolution<T extends ConceptResolutionFields>(
  concepts: T[],
  range: ResolutionRange
): T[] {
  const normalized = normalizeResolutionRange(range);
  return concepts.filter((concept) =>
    isWithinResolutionRange(concept.resolution_level ?? 3, normalized)
  );
}

export function resolutionRangeFromManifest(manifest: {
  audience?: { resolutionRange?: ResolutionRange };
}): ResolutionRange {
  return manifest.audience?.resolutionRange ?? FULL_RESOLUTION_RANGE;
}

export function libraryBundleAtResolution(
  bundle: import("./libraryTypes").LibraryBundle,
  range?: ResolutionRange
): import("./libraryTypes").LibraryBundle {
  const resolutionRange = range ?? resolutionRangeFromManifest(bundle.manifest);
  const concepts = filterConceptsByResolution(bundle.concepts, resolutionRange);
  const conceptIds = new Set(concepts.map((concept) => concept.id));

  return {
    ...bundle,
    concepts,
    cards: bundle.cards.filter((card) => {
      const conceptId =
        card.relations.concept_id ??
        card.relations.from_concept_id ??
        card.relations.to_concept_id;
      return conceptId ? conceptIds.has(conceptId) : false;
    }),
    questions: bundle.questions.filter((question) =>
      question.relations.concept_ids.some((id) => conceptIds.has(id))
    ),
    relationships: bundle.relationships.filter(
      (relationship) =>
        conceptIds.has(relationship.endpoints.from_concept_id) &&
        conceptIds.has(relationship.endpoints.to_concept_id)
    ),
  };
}
