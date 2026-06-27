import type { ResolutionLevel } from "../types/resolution.js";
import { diceCoefficient } from "./spineL4L5MergeScan.js";
import {
  type IndexedSpineConcept,
  type SpineIndex,
  conceptsInDomain,
  maxResolutionForAnchor,
  resolveAnchorL3,
} from "./spineIndex.js";

export type PlacementRecommendation =
  | "use_existing"
  | "add_domain_context"
  | "create_l4_child"
  | "create_l5_child"
  | "create_l3_node"
  | "human_review";

export interface SpinePlacementInput {
  domain_id: string;
  title: string;
  definition: string;
  summary?: string;
  /** Optional spine id if caller already knows the neighborhood. */
  hint_concept_id?: string;
  /** Provenance for growth queue (card id, library id, source url, etc.). */
  source?: {
    kind: "card" | "question" | "library_concept" | "import" | "manual";
    library_id?: string;
    entity_id?: string;
    url?: string;
    notes?: string;
  };
}

export interface SpineMatchCandidate {
  concept_id: string;
  resolution_level: ResolutionLevel;
  title_dice: number;
  definition_dice: number;
  combined_score: number;
  already_in_domain: boolean;
}

export interface SpineGrowthProposal {
  recommendation: PlacementRecommendation;
  rationale: string;
  matched_concepts: SpineMatchCandidate[];
  /** Best existing node to attach cards/content to (if any). */
  target_concept_id?: string;
  /** Parent for a new child node. */
  suggested_parent_id?: string;
  /** L3 anchor when creating L4/L5. */
  suggested_anchor_l3_id?: string;
  suggested_resolution_level?: ResolutionLevel;
  suggested_title?: string;
  merge_warning?: string;
}

const USE_EXISTING = 0.82;
const NEAR_MATCH = 0.65;
const POSSIBLE_CHILD = 0.48;

function combinedScore(titleDice: number, defDice: number): number {
  return titleDice * 0.55 + defDice * 0.45;
}

function scoreAgainst(
  input: SpinePlacementInput,
  concept: IndexedSpineConcept
): SpineMatchCandidate {
  const titleDice = diceCoefficient(input.title, concept.content.title);
  const defDice = diceCoefficient(input.definition, concept.content.definition);
  return {
    concept_id: concept.id,
    resolution_level: concept.resolution_level,
    title_dice: titleDice,
    definition_dice: defDice,
    combined_score: combinedScore(titleDice, defDice),
    already_in_domain: concept.domain_ids.includes(input.domain_id),
  };
}

function rankCandidates(
  index: SpineIndex,
  input: SpinePlacementInput
): SpineMatchCandidate[] {
  const pool = new Map<string, IndexedSpineConcept>();

  for (const c of conceptsInDomain(index, input.domain_id)) {
    pool.set(c.id, c);
  }

  if (input.hint_concept_id) {
    const hint = index.byId.get(input.hint_concept_id);
    if (hint) {
      pool.set(hint.id, hint);
      const anchor = resolveAnchorL3(index, hint);
      if (anchor) {
        pool.set(anchor.id, anchor);
        for (const c of index.concepts) {
          if (c.anchor_concept_id === anchor.id || c.parent_concept_id === anchor.id) {
            pool.set(c.id, c);
          }
        }
      }
    }
  }

  return [...pool.values()]
    .map((c) => scoreAgainst(input, c))
    .sort((a, b) => b.combined_score - a.combined_score);
}

function deepestAllowedLevel(
  index: SpineIndex,
  anchorL3Id: string,
  domainId: string
): ResolutionLevel {
  const max = maxResolutionForAnchor(index, anchorL3Id, domainId) ?? 3;
  return max;
}

/**
 * Decide where new information belongs on the spine.
 * Heuristic placement — flags uncertain cases for human review.
 */
export function placeOnSpine(index: SpineIndex, input: SpinePlacementInput): SpineGrowthProposal {
  const ranked = rankCandidates(index, input);
  const best = ranked[0];

  if (!best || best.combined_score < POSSIBLE_CHILD) {
    return {
      recommendation: "create_l3_node",
      rationale:
        "No sufficiently similar spine node in this domain. Information may require a new L3 (or re-homing under a different domain).",
      matched_concepts: ranked.slice(0, 5),
      suggested_resolution_level: 3,
      suggested_title: input.title,
    };
  }

  const bestConcept = index.byId.get(best.concept_id)!;

  if (best.combined_score >= USE_EXISTING || best.title_dice >= USE_EXISTING) {
    return {
      recommendation: best.already_in_domain ? "use_existing" : "add_domain_context",
      rationale: best.already_in_domain
        ? "Strong match to an existing spine node in this domain — attach cards/content here."
        : "Strong match to an existing universal node — add a domain_context entry rather than creating a duplicate.",
      matched_concepts: ranked.slice(0, 5),
      target_concept_id: best.concept_id,
    };
  }

  if (best.combined_score >= NEAR_MATCH) {
    return {
      recommendation: "human_review",
      rationale:
        "Moderate similarity to an existing node — confirm merge/context-add vs new child before committing.",
      matched_concepts: ranked.slice(0, 5),
      target_concept_id: best.concept_id,
      merge_warning: `Near-duplicate of ${best.concept_id} (score=${best.combined_score.toFixed(2)})`,
    };
  }

  // Gap: new child under anchor
  const anchor = resolveAnchorL3(index, bestConcept);
  if (!anchor) {
    return {
      recommendation: "human_review",
      rationale: "Similar content found but could not resolve an L3 anchor for a new child.",
      matched_concepts: ranked.slice(0, 5),
      target_concept_id: best.concept_id,
    };
  }

  const maxLevel = deepestAllowedLevel(index, anchor.id, input.domain_id);
  if (maxLevel <= 3) {
    return {
      recommendation: maxLevel === 3 && best.resolution_level === 3 ? "use_existing" : "human_review",
      rationale:
        maxLevel === 3
          ? `Anchor ${anchor.id} is capped at max_resolution=3 in ${input.domain_id}. Either attach at L3 or raise the cap before adding L4/L5.`
          : "Anchor resolution cap prevents automatic L4/L5 proposal.",
      matched_concepts: ranked.slice(0, 5),
      target_concept_id: best.resolution_level === 3 ? anchor.id : best.concept_id,
      suggested_anchor_l3_id: anchor.id,
    };
  }

  const parentForChild =
    best.resolution_level >= 4 ? best.concept_id : anchor.id;
  const childLevel: ResolutionLevel = maxLevel >= 5 && best.resolution_level >= 4 ? 5 : 4;

  return {
    recommendation: childLevel === 5 ? "create_l5_child" : "create_l4_child",
    rationale: `No exact match. Content fits as a new L${childLevel} child under ${parentForChild} (anchor ${anchor.id}).`,
    matched_concepts: ranked.slice(0, 5),
    suggested_parent_id: parentForChild,
    suggested_anchor_l3_id: anchor.id,
    suggested_resolution_level: childLevel,
    suggested_title: input.title,
    merge_warning:
      best.combined_score >= POSSIBLE_CHILD
        ? `Related to ${best.concept_id} (score=${best.combined_score.toFixed(2)}) — verify not a duplicate.`
        : undefined,
  };
}
