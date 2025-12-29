//Generic Event Schema
{
  event_id: "evt_...",          // ULID/UUIDv7 recommended
  type: "card_reviewed" | "question_attempted" | ...,
  user_id: "user_123",
  library_id: "lib_abc",

  occurred_at: "2025-12-29T12:34:56.000Z", // client time
  received_at: "SERVER_TIMESTAMP",         // server time
  device_id: "dev_001",

  entity: { kind: "card" | "question" | "relationship", id: "card_0001" },

  payload: { ... },             // event-type specific
  schema_version: "1.0"
}

//Card Reviewed Event Schema
type: "card_reviewed"
entity: { kind: "card", id: "card_0001" }
payload: {
  grade: "again" | "hard" | "good" | "easy", // or correct:boolean if you prefer
  seconds_spent: 18,
  // optional: if you do SM-2/FSRS-style scheduling
  rating_confidence?: 0 | 1 | 2 | 3
}

//Question Attempted Event Schema
type: "question_attempted"
entity: { kind: "question", id: "q_0001" }
payload: {
  selected_option_id: "opt_B",
  correct: true,
  seconds_spent: 35
}

//Relationship Card Event Schema
type: "relationship_reviewed"
entity: { kind: "relationship_card", id: "relcard_001" }
payload: {
  concept_a_id: "concept_attention",
  concept_b_id: "concept_working_memory",
  direction: { from: "...", to: "..." },
  correct: false,
  high_confidence: true,
  seconds_spent: 22
}

//Misconception Probe Result 
Schematype: "misconception_probe_result"
entity: { kind: "misconception_edge", id: "mis_edge_001" }
payload: {
  confirmed: true,
  explanation_quality: "good" | "weak",
  seconds_spent: 40
}

//Library Mapping Applied 
Schematype: "library_id_map_applied"
entity: { kind: "library_version", id: "2025-12-28-01" }
payload: {
  from_version: "2025-12-01-00",
  to_version: "2025-12-28-01",
  renames: {
    cards: [{ from: "card_old_001", to: "card_new_001" }]
  }
}

//CardSchedule View
{
  card_id: "card_0001",
  library_id: "lib_abc",
  user_id: "user_123",

  // derived schedule fields
  due_at: Timestamp,
  stability: number,
  difficulty: number,
  interval_days: number,
  state: "new" | "learning" | "review" | "relearning",

  last_reviewed_at: Timestamp,
  last_grade: "again" | "hard" | "good" | "easy",

  // projection bookkeeping
  last_applied: { received_at: Timestamp, event_id: string },
  updated_at: Timestamp // server time
}

//CardPerformance View
{
  card_id: "card_0001",
  library_id: "lib_abc",
  user_id: "user_123",

  total_reviews: number,
  correct_reviews: number,
  accuracy_rate: number,      // derived
  avg_seconds: number,        // derived

  streak: number,
  max_streak: number,

  last_reviewed_at: Timestamp,

  last_applied: { received_at: Timestamp, event_id: string },
  updated_at: Timestamp
}

//MisconceptionEdge View
{
  misconception_id: "mis_edge_001",
  library_id: "lib_abc",
  user_id: "user_123",

  concept_a_id: "concept_attention",
  concept_b_id: "concept_working_memory",
  direction: { from: "...", to: "...", error_type: "reversal" },

  misconception_type: "directionality",
  strength: number, // 0..1
  status: "active" | "weakening" | "resolved",

  first_observed_at: Timestamp,
  last_observed_at: Timestamp,

  // optionally derived counters (not raw event lists)
  evidence: {
    relationship_failures: number,
    high_confidence_errors: number,
    probe_confirmations: number
  },

  last_applied: { received_at: Timestamp, event_id: string },
  updated_at: Timestamp
}

//Idempotent Reducer Pattern
type Cursor = { received_at: Timestamp; event_id: string };

type ProjectorContext = {
  uid: string;
  libraryId: string;
  cursor: Cursor;
  serverNow: Timestamp;
};

function reduceCardSchedule(prev: CardScheduleView | null, evt: CardReviewedEvent, ctx: ProjectorContext): CardScheduleView;
function reduceCardPerf(prev: CardPerfView | null, evt: CardReviewedEvent, ctx: ProjectorContext): CardPerfView;
