export const validCardScheduleView = {
  type: "card_schedule_view",
  card_id: "card_0001",
  library_id: "lib_abc",
  user_id: "user_123",

  due_at: "2025-12-30T09:00:00.000Z",
  stability: 3.2,
  difficulty: 5.1,
  interval_days: 3,
  state: "review",

  last_reviewed_at: "2025-12-29T12:34:56.000Z",
  last_grade: "good",

  last_applied: { received_at: "2025-12-29T12:34:57.000Z", event_id: "evt_01JHXYZ..." },
  updated_at: "2025-12-29T12:34:57.000Z"
} as const;
