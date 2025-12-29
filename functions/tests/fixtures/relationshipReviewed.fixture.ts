import { validUserEvent } from "./userEvent.fixture";

export const validRelationshipReviewedEvent = {
  ...validUserEvent,
  type: "relationship_reviewed",
  entity: { kind: "relationship_card", id: "card_rel_0001" },
  payload: {
    concept_a_id: "concept_attention",
    concept_b_id: "concept_working_memory",
    direction: { from: "concept_attention", to: "concept_working_memory" },
    correct: false,
    high_confidence: true,
    seconds_spent: 22
  }
} as const;
