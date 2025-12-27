export interface ConceptGraphMetrics {
  concept_id: string;
  type: "concept_graph_metrics";

  graph_context: {
    library_id: string;
    graph_version: string;
    computed_at: string;
  };

  semantic_embedding: number[];

  degrees: {
    structural_degree: number;
    semantic_degree: number;
    combined_degree: number;
  };

  centrality?: {
    betweenness?: number;
    pagerank?: number;
  };

  status: {
    valid: boolean;
    deprecated: boolean;
  };
}
