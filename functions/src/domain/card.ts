import { CardType, PedagogicalRole } from "./enums";

export interface Card {
  id: string;
  type: "card" | "relationship_card";

  relations: {
    concept_id?: string;
    concept_a_id?: string;
    concept_b_id?: string;
    related_question_ids?: string[];
  };

  config: {
    card_type: CardType;
    pedagogical_role: PedagogicalRole;

    activation_policy?: {
      requires_mastery_of?: string[];
      min_mastery_threshold?: number;
    };
  };

  content: {
    front: string;
    back: string;
    cloze_data?: unknown;
    comparison_table?: unknown;
  };

  metadata: {
    created_at: string;
    updated_at: string;
    created_by: string;
    status: "draft" | "published";
    tags: string[];
  };
}
