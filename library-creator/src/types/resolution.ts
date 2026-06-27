import { z } from "zod";
import type { AudienceProfile } from "./intent.js";

export const ResolutionLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export type ResolutionLevel = z.infer<typeof ResolutionLevelSchema>;

export const ResolutionRangeSchema = z.object({
  min: ResolutionLevelSchema,
  max: ResolutionLevelSchema,
});

export type ResolutionRange = z.infer<typeof ResolutionRangeSchema>;

/** Canonical spine node id — authoritative universal concept identity. */
export const AnchorConceptIdSchema = z.string().regex(/^spine_[a-z0-9_]+$/);

export type AnchorConceptId = z.infer<typeof AnchorConceptIdSchema>;

/** @deprecated Use AnchorConceptIdSchema */
export const SpineConceptIdSchema = z
  .string()
  .regex(/^(concept_|spine_)[a-z0-9_]+$/);

/** Default resolution windows by audience level (granularity control, not hierarchy depth). */
export const DEFAULT_RESOLUTION_RANGE_BY_LEVEL: Record<
  AudienceProfile["level"],
  ResolutionRange
> = {
  highschool: { min: 2, max: 3 },
  undergrad: { min: 2, max: 4 },
  grad: { min: 3, max: 4 },
  professional: { min: 3, max: 5 },
  self_taught: { min: 2, max: 4 },
};

export function defaultResolutionRangeForLevel(
  level: AudienceProfile["level"]
): ResolutionRange {
  return { ...DEFAULT_RESOLUTION_RANGE_BY_LEVEL[level] };
}

export function normalizeResolutionRange(
  range: ResolutionRange
): ResolutionRange {
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

export function isSpineAnchoredLibraryConcept(concept: {
  resolution_level?: ResolutionLevel;
  anchor_concept_id?: string | null;
  /** @deprecated */
  spine_concept_id?: string | null;
}): boolean {
  return Boolean(
    concept.anchor_concept_id?.trim() || concept.spine_concept_id?.trim()
  );
}

export function resolveAnchorConceptId(concept: {
  anchor_concept_id?: string | null;
  /** @deprecated */
  spine_concept_id?: string | null;
}): string | undefined {
  return concept.anchor_concept_id?.trim() || concept.spine_concept_id?.trim() || undefined;
}

/**
 * Map existing hierarchy tiers to a default resolution level.
 * domain → 1, category → 2, subcategory → 2–3, topic → 3, subtopic → 3–4.
 */
export function inferResolutionFromHierarchy(hierarchy: {
  domain: string;
  category: string;
  subcategory: string;
  topic: string;
  subtopic?: string;
}): ResolutionLevel {
  const { domain, category, subcategory, topic, subtopic } = hierarchy;

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
  anchor_concept_id?: string;
  /** @deprecated Use anchor_concept_id */
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
