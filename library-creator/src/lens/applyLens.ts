import type { CurriculumLens, CurriculumSection } from "../types/curriculumLens.js";
import type { ResolutionLevel, ResolutionRange } from "../types/resolution.js";
import { isWithinResolutionRange, normalizeResolutionRange } from "../types/resolution.js";

/** Minimal concept shape for lens filtering at runtime. */
export interface LensSpineConcept {
  id: string;
  resolution_level: ResolutionLevel;
  content: {
    title: string;
    definition: string;
    summary: string;
  };
  editorial?: {
    high_yield_score: number;
    difficulty?: string;
  };
}

export interface LensViewConceptEntry {
  concept: LensSpineConcept;
  lensMetadata: CurriculumLens["concept_mappings"][number]["lens_specific"];
  mapping: CurriculumLens["concept_mappings"][number];
}

export interface LensViewSection extends CurriculumSection {
  concepts: LensViewConceptEntry[];
}

export interface LensView {
  lens_id: string;
  lens_name: string;
  domain_id: string;
  sections: LensViewSection[];
  /** Concepts in the spine bundle but not mapped in this lens. */
  unmapped_concept_ids: string[];
}

const HIGH_YIELD_LENS_FLOOR = 8;

/**
 * Apply a curriculum lens as filter + sort over spine concepts.
 * Does not mutate concepts or cards — returns a view model for UI / queue builders.
 */
export function applyLens(
  concepts: LensSpineConcept[],
  lens: CurriculumLens,
  userResolutionRange: ResolutionRange
): LensView {
  const range = normalizeResolutionRange(userResolutionRange);
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const mappedIds = new Set(lens.concept_mappings.map((m) => m.spine_concept_id));

  const sections: LensViewSection[] = lens.sections.map((section) => {
    const entries = lens.concept_mappings
      .filter((m) => m.section_id === section.id)
      .filter((m) => {
        const concept = byId.get(m.spine_concept_id);
        if (!concept) return false;
        const depth = m.lens_specific.depth_in_lens;
        return (
          isWithinResolutionRange(concept.resolution_level, range) &&
          isWithinResolutionRange(depth, range)
        );
      })
      .sort(
        (a, b) =>
          a.lens_specific.order_in_section - b.lens_specific.order_in_section
      )
      .map((mapping) => ({
        concept: byId.get(mapping.spine_concept_id)!,
        lensMetadata: mapping.lens_specific,
        mapping,
      }));

    return { ...section, concepts: entries };
  });

  const unmapped = concepts
    .filter((c) => !mappedIds.has(c.id))
    .map((c) => c.id)
    .sort();

  return {
    lens_id: lens.id,
    lens_name: lens.name,
    domain_id: lens.domain_id,
    sections,
    unmapped_concept_ids: unmapped,
  };
}

/**
 * Lens-aware high-yield score for session queue weighting.
 * When a lens marks a concept high-yield, floor at HIGH_YIELD_LENS_FLOOR.
 * Section weight can boost further when provided.
 */
export function getEffectiveHighYieldScore(
  concept: LensSpineConcept,
  activeLens: CurriculumLens | null,
  options: { sectionId?: string; sectionWeight?: number } = {}
): number {
  const base = concept.editorial?.high_yield_score ?? 5;

  if (!activeLens) return base;

  const mappings = activeLens.concept_mappings.filter(
    (m) => m.spine_concept_id === concept.id
  );
  if (!mappings.length) return base;

  const mapping =
    (options.sectionId
      ? mappings.find((m) => m.section_id === options.sectionId)
      : undefined) ?? mappings[0];

  let score = base;
  if (mapping.lens_specific.high_yield_in_lens) {
    score = Math.max(score, HIGH_YIELD_LENS_FLOOR);
  }

  const weight =
    options.sectionWeight ??
    activeLens.sections.find((s) => s.id === mapping.section_id)?.weight;
  if (weight !== undefined && weight >= 15) {
    score = Math.min(10, score + 1);
  }

  return score;
}

/** Display title: lens override when active, else spine title. */
export function getTitleInLens(
  concept: LensSpineConcept,
  mapping: CurriculumLens["concept_mappings"][number] | undefined
): string {
  return mapping?.lens_specific.title_in_lens ?? concept.content.title;
}

/** Target generation / study depth for library creation under a lens. */
export function getDepthInLens(
  concept: LensSpineConcept,
  activeLens: CurriculumLens | null
): ResolutionLevel {
  if (!activeLens) return concept.resolution_level;
  const mapping = activeLens.concept_mappings.find(
    (m) => m.spine_concept_id === concept.id
  );
  return mapping?.lens_specific.depth_in_lens ?? concept.resolution_level;
}
