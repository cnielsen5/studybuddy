import type { ConceptGraphDraft, DraftConcept } from "../types/draftConcept.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import { resolveAnchorConceptId } from "../types/resolution.js";
import { inferSpineDomainId } from "./inferSpineDomainId.js";
import {
  placeOnSpine,
  type PlacementRecommendation,
  type SpineGrowthProposal,
} from "../spine/spinePlacement.js";
import type { SpineIndex } from "../spine/spineIndex.js";

export interface ConceptPlacementRecord {
  concept_id: string;
  title: string;
  proposal: SpineGrowthProposal;
  /** Whether anchor_concept_id was set on the concept. */
  anchored: boolean;
}

export interface AnchoredConceptGraphResult {
  draft: ConceptGraphDraft;
  domain_id: string;
  placements: ConceptPlacementRecord[];
  anchored_count: number;
  new_concept_count: number;
  review_count: number;
}

function isAnchoredRecommendation(rec: PlacementRecommendation): boolean {
  return rec === "use_existing" || rec === "add_domain_context";
}

function isNewConceptRecommendation(rec: PlacementRecommendation): boolean {
  return (
    rec === "create_l3_node" ||
    rec === "create_l4_child" ||
    rec === "create_l5_child"
  );
}

function applyPlacementToConcept(
  concept: DraftConcept,
  proposal: SpineGrowthProposal
): DraftConcept {
  if (!isAnchoredRecommendation(proposal.recommendation)) {
    return concept;
  }
  if (!proposal.target_concept_id) {
    return concept;
  }

  const updated: DraftConcept = {
    ...concept,
    anchor_concept_id: proposal.target_concept_id,
    spine_concept_id: proposal.target_concept_id,
  };

  if (
    proposal.suggested_resolution_level &&
    proposal.suggested_resolution_level !== concept.resolution_level
  ) {
    updated.resolution_level = proposal.suggested_resolution_level;
  }

  if (proposal.suggested_parent_id) {
    updated.dependency_graph = {
      ...concept.dependency_graph,
      parent_concept_id: proposal.suggested_parent_id,
    };
  }

  return updated;
}

/**
 * Stage 3b — match each draft concept to the universal spine and set anchor_concept_id.
 */
export function anchorConceptGraphToSpine(
  draft: ConceptGraphDraft,
  intent: LibraryCreationIntent,
  spineIndex: SpineIndex,
  options: { libraryId?: string } = {}
): AnchoredConceptGraphResult {
  const domain_id = inferSpineDomainId(intent);
  const placements: ConceptPlacementRecord[] = [];
  const concepts: DraftConcept[] = [];

  let anchored_count = 0;
  let new_concept_count = 0;
  let review_count = 0;

  for (const concept of draft.concepts) {
    const existingAnchor = resolveAnchorConceptId(concept);
    if (existingAnchor && spineIndex.byId.has(existingAnchor)) {
      placements.push({
        concept_id: concept.id,
        title: concept.content.title,
        proposal: {
          recommendation: "use_existing",
          rationale: "Concept already carries a valid spine anchor.",
          matched_concepts: [],
          target_concept_id: existingAnchor,
        },
        anchored: true,
      });
      anchored_count += 1;
      concepts.push(concept);
      continue;
    }

    const proposal = placeOnSpine(spineIndex, {
      domain_id,
      title: concept.content.title,
      definition: concept.content.definition,
      summary: concept.content.summary,
      hint_concept_id: concept.dependency_graph.parent_concept_id,
      source: {
        kind: "library_concept",
        library_id: options.libraryId ?? draft.proposedLibraryId,
        entity_id: concept.id,
      },
    });

    const anchored = isAnchoredRecommendation(proposal.recommendation);
    if (anchored) anchored_count += 1;
    if (isNewConceptRecommendation(proposal.recommendation)) new_concept_count += 1;
    if (proposal.recommendation === "human_review") review_count += 1;

    placements.push({
      concept_id: concept.id,
      title: concept.content.title,
      proposal,
      anchored,
    });

    concepts.push(applyPlacementToConcept(concept, proposal));
  }

  return {
    draft: { ...draft, concepts },
    domain_id,
    placements,
    anchored_count,
    new_concept_count,
    review_count,
  };
}
