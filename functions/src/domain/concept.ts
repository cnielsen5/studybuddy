export interface Concept {
  id: string;
  type: "concept";

  metadata: {
    created_at: string;
    updated_at: string;
    created_by: string;
    last_updated_by: string;
    version: number;
    status: "draft" | "published";
    tags: string[];
    difficulty: "basic" | "intermediate" | "advanced";
    high_yield_score: number;
  };

  hierarchy: {
    library_id: string;
    domain: string;
    category: string;
    subcategory: string;
    topic: string;
    subtopic?: string;
  };

  content: {
    title: string;
    definition: string;
    summary: string;
  };

  dependency_graph: {
    prerequisites: string[];
    unlocks: string[];
    related_concepts: string[];
    child_concepts: string[];
  };

  mastery_config: {
    threshold: number;
    decay_rate: "fast" | "standard" | "slow";
    min_questions_correct: number;
  };

  linked_content: {
    card_ids: string[];
    question_ids: string[];
  };
}
