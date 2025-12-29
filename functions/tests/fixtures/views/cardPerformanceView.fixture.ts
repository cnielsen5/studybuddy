export const validCardPerformanceView = {
  card_id: "card_0001",
  library_id: "lib_abc",
  user_id: "user_123",

  total_reviews: 8,
  correct_reviews: 6,
  accuracy_rate: 0.75,
  avg_seconds: 12.5,

  streak: 3,
  max_streak: 5,

  last_reviewed_at: "2025-12-29T12:34:56.000Z",

  last_applied: { received_at: "2025-12-29T12:34:57.000Z", event_id: "evt_01JHXYZ..." },
  updated_at: "2025-12-29T12:34:57.000Z"
} as const;
