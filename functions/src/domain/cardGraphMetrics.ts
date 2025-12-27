export interface CardGraphMetrics {
  card_id: string;
  type: "card_graph_metrics";

  semantic_embedding: number[];

  concept_alignment: {
    concept_id: string;
    weight: number;
  }[];

  complexity: {
    estimated_seconds: number;
    cognitive_load_score: number;
  };

  status: {
    valid: boolean;
    deprecated: boolean;
  };
}
