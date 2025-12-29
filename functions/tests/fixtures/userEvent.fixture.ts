export const validUserEvent = {
  event_id: "evt_01JHXYZABCDEF1234567890",
  type: "card_reviewed",

  user_id: "user_123",
  library_id: "lib_abc",

  occurred_at: "2025-12-29T12:34:56.000Z",
  received_at: "2025-12-29T12:34:57.000Z",
  device_id: "dev_001",

  entity: { kind: "card", id: "card_0001" },

  payload: { grade: "good", seconds_spent: 18 },

  schema_version: "1.0"
} as const;
