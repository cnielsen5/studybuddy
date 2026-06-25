import type { SpineConcept } from "./spineSchema.js";
import { SPINE_MERGED_CONCEPTS, SUPERSEDED_SPINE_L3_IDS } from "./spineMergedConcepts.js";
import {
  SPINE_PHYSIOLOGY_MERGES,
  PHYSIOLOGY_SUPERSEDED_IDS,
} from "./spinePhysiologyMerges.js";
import { SPINE_SHARED_CONCEPTS as SPINE_BASE_SHARED } from "./spineSharedConcepts.js";

import {
  SPINE_REVIEW_FIXES,
  REVIEW_FIX_SUPERSEDED_IDS,
} from "./spineReviewFixes.js";

/** All cross-domain shared spine nodes (base + A3 merges + C-series physiology + review fixes). */
export const SPINE_SHARED_CONCEPTS: SpineConcept[] = [
  ...SPINE_BASE_SHARED,
  ...SPINE_MERGED_CONCEPTS,
  ...SPINE_PHYSIOLOGY_MERGES,
  ...SPINE_REVIEW_FIXES,
];

/** Domain L3 ids replaced by shared/merged nodes. */
export const ALL_SUPERSEDED_SPINE_L3_IDS = new Set([
  ...SUPERSEDED_SPINE_L3_IDS,
  ...PHYSIOLOGY_SUPERSEDED_IDS,
  ...REVIEW_FIX_SUPERSEDED_IDS,
  // Med stubs replaced by enriched C-series shared nodes (same ids)
  "spine_medicine_preclinical_l3_renal_filtration_and_gfr",
  "spine_medicine_preclinical_l3_gas_exchange_and_ventilation_perfusion",
  "spine_medicine_preclinical_l3_nutrient_absorption_physiology",
]);

export { SUPERSEDED_SPINE_L3_IDS };

export function sharedConceptIds(): Set<string> {
  return new Set(SPINE_SHARED_CONCEPTS.map((c) => c.id));
}
