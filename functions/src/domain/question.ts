import { QuestionType, CognitiveLevel } from "./enums";

export interface Question {
  id: string;
  type: "question";

  relations: {
    concept_ids: string[];
    related_card_ids?: string[];
  };

  source: {
    origin: "public" | "validated" | "ai_generated";
    provider?: string;
    subscription_required?: boolean;
  };

  classification: {
    question_type: QuestionType;
    usage_role: "generic" | "diagnostic" | "establishment" | "targeted" | "misconception_directed";
    cognitive_level: CognitiveLevel;
  };

  content: {
    stem: string;
    options: { id: string; text: string }[];
    correct_option_id: string;
  };

  explanations: {
    general: string;
    distractors?: Record<string, string>;
  };

  metadata: {
    created_at: string;
    updated_at: string;
    created_by: string;
    version: string;
    status: "draft" | "published";
    tags: string[];
  };
}
