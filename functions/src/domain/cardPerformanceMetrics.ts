export interface CardPerformanceMetrics {
  card_id: string;

  avg_seconds: number;
  my_avg_seconds: number;
  time_variance?: number;

  sample_count: number;


  last_updated: string;
}
