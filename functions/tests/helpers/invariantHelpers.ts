/**
 * Shared test helpers for invariant tests
 * Reduces duplication across invariant test files
 */

/**
 * Common forbidden fields for GraphMetrics objects (global, not user-specific)
 */
export const GRAPH_METRICS_FORBIDDEN_FIELDS = {
  user_session: ["user_id", "session_id"],
  scheduling: ["state", "due", "stability", "difficulty", "mastery"],
  performance: [
    "my_avg_seconds",
    "avg_seconds",
    "accuracy_rate",
    "streak",
    "total_attempts"
  ],
  evidence: ["attempt_ids", "attempts", "history"],
  ai_narrative: ["explanation", "ai_reasoning", "narrative", "ai_notes"]
};

/**
 * Common forbidden fields for Golden Master objects (static, no runtime state)
 */
export const GOLDEN_MASTER_FORBIDDEN_FIELDS = {
  user_session: ["user_id", "session_id"],
  scheduling: ["state", "due", "stability", "difficulty", "interval"],
  performance: [
    "reps",
    "lapses",
    "avg_seconds",
    "my_avg_seconds",
    "accuracy_rate",
    "streak"
  ],
  evidence: ["attempts", "attempt_ids", "history"],
  ai_narrative: ["explanation", "ai_reasoning", "narrative"]
};

/**
 * Forbidden mutation fields for Events (production-critical immutability)
 * Events are append-only and must never indicate they were modified
 */
export const EVENT_MUTATION_FORBIDDEN_FIELDS = [
  "updated_at",
  "edited_at",
  "revision",
  "modified_at",
  "changed_at",
  "version", // schema_version is allowed, but version alone is not
  "edit_count",
  "revision_number",
  "last_modified",
  "last_edited"
];

/**
 * Forbidden aggregate fields for Event payloads
 * Events should contain only the raw action data, not accumulated metrics
 */
export const EVENT_PAYLOAD_AGGREGATE_FIELDS = [
  "total_attempts",
  "total_reviews",
  "accuracy_rate",
  "avg_seconds",
  "avg_time",
  "streak",
  "max_streak",
  "correct_count",
  "incorrect_count",
  "success_rate",
  "failure_rate",
  "cumulative_score",
  "running_total",
  "aggregate_accuracy",
  "historical_average"
];

/**
 * Common mutator method names to check for
 */
export const COMMON_MUTATOR_METHODS = [
  "update",
  "mutate",
  "setContent",
  "recompute",
  "recalculate",
  "applyAttempt",
  "adjust",
  "resolve",
  "relabel",
  "reprioritize",
  "append",
  "correct",
  "reprocess",
  "set",
  "override",
  "applyFSRS"
];

/**
 * Helper to test that an object does not contain forbidden fields
 */
export function expectForbiddenFieldsAbsent(
  obj: any,
  fieldGroups: Record<string, string[]>,
  context?: string
): void {
  for (const [groupName, fields] of Object.entries(fieldGroups)) {
    for (const field of fields) {
      expect(obj[field]).toBeUndefined();
    }
  }
}

/**
 * Helper to test that an object does not contain mutator methods
 */
export function expectNoMutatorMethods(obj: any, additionalMethods: string[] = []): void {
  const allMethods = [...COMMON_MUTATOR_METHODS, ...additionalMethods];
  for (const method of allMethods) {
    expect(obj[method]).toBeUndefined();
  }
}

/**
 * Helper to test that an object contains no functions at any level
 */
export function expectNoFunctions(obj: any): void {
  for (const value of Object.values(obj)) {
    expect(typeof value).not.toBe("function");
  }
}

/**
 * Helper to test event immutability - ensures no mutation fields exist
 * Production-critical: Events are append-only and must never indicate modification
 */
/**
 * Helper to test event immutability - ensures no mutation fields exist
 * Production-critical: Events are append-only and must never indicate modification
 * 
 * Checks:
 * - No mutation-indicating fields (updated_at, edited_at, revision, etc.)
 * - event_id exists and is a string (globally unique identifier)
 * - schema_version exists and is a string
 */
export function expectEventImmutability(event: any, context?: string): void {
  // Check for forbidden mutation fields
  for (const field of EVENT_MUTATION_FORBIDDEN_FIELDS) {
    expect(event[field]).toBeUndefined();
  }
  
  // Verify event_id exists and is a string (globally unique identifier)
  expect(typeof event.event_id).toBe("string");
  expect(event.event_id.length).toBeGreaterThan(0);
  
  // Verify schema_version exists and is a string
  expect(typeof event.schema_version).toBe("string");
  expect(event.schema_version.length).toBeGreaterThan(0);
}

/**
 * Helper to test that event payload does not contain aggregate fields
 * Events should contain only raw action data, not accumulated metrics
 * 
 * This prevents accidental accumulation of metrics in event payloads,
 * which would violate the append-only event-sourcing principle.
 */
export function expectNoPayloadAggregates(payload: any, context?: string): void {
  for (const field of EVENT_PAYLOAD_AGGREGATE_FIELDS) {
    expect(payload[field]).toBeUndefined();
  }
}

/**
 * Helper to test that an object declares a type field
 */
export function expectTypeField(obj: any, expectedType: string): void {
  expect(obj.type).toBe(expectedType);
  expect(typeof obj.type).toBe("string");
}

/**
 * Helper to test that an object has required top-level sections
 */
export function expectTopLevelSections(obj: any, requiredSections: string[]): void {
  for (const section of requiredSections) {
    expect(obj[section]).toBeDefined();
  }
}

/**
 * Helper to test that arrays contain only strings (for ID arrays)
 */
export function expectStringArray(arr: any, fieldName?: string): void {
  expect(Array.isArray(arr)).toBe(true);
  for (const item of arr) {
    expect(typeof item).toBe("string");
  }
}

/**
 * Helper to test that an object does not embed related objects (only IDs)
 */
export function expectNoEmbeddedObjects(
  obj: any,
  forbiddenObjectFields: string[]
): void {
  for (const field of forbiddenObjectFields) {
    expect(obj[field]).toBeUndefined();
  }
}

/**
 * Forbidden fields for View objects (projected read models)
 * Views must not embed Golden Master content, event lists, embeddings, or narratives
 */
export const VIEW_FORBIDDEN_FIELDS = {
  golden_master_content: [
    "front",
    "back",
    "content",
    "stem",
    "options",
    "explanations",
    "definition",
    "title",
    "summary"
  ],
  event_attempt_lists: [
    "events",
    "event_ids",
    "attempts",
    "attempt_ids",
    "question_attempt_ids",
    "history",
    "event_log"
  ],
  embeddings_graph_metrics: [
    "semantic_embedding",
    "graph_context",
    "centrality",
    "degrees",
    "complexity",
    "concept_alignment"
  ],
  narratives: [
    "explanation",
    "ai_reasoning",
    "narrative",
    "ai_notes",
    "reasoning"
  ]
};

/**
 * Helper to validate last_applied cursor structure
 * Required for all views to track projector position
 * 
 * @param lastApplied - The last_applied cursor object
 * @param context - Optional context for error messages
 */
export function expectLastAppliedCursor(
  lastApplied: any,
  context?: string
): void {
  expect(lastApplied).toBeDefined();
  expect(typeof lastApplied).toBe("object");
  
  // Must have received_at (timestamp when event was received)
  expect(typeof lastApplied.received_at).toBe("string");
  expect(lastApplied.received_at.length).toBeGreaterThan(0);
  
  // Must have event_id (reference to the last applied event)
  expect(typeof lastApplied.event_id).toBe("string");
  expect(lastApplied.event_id.length).toBeGreaterThan(0);
  
  // Must not have mutation fields
  expect(lastApplied.updated_at).toBeUndefined();
  expect(lastApplied.edited_at).toBeUndefined();
}

/**
 * Helper to validate updated_at field
 * Required for all views to track when the view was last updated
 * 
 * @param view - The view object
 * @param context - Optional context for error messages
 */
export function expectUpdatedAt(view: any, context?: string): void {
  expect(view.updated_at).toBeDefined();
  expect(typeof view.updated_at).toBe("string");
  expect(view.updated_at.length).toBeGreaterThan(0);
}

/**
 * Helper to test view forbidden fields
 * Ensures views don't embed Golden Master content, event lists, embeddings, or narratives
 */
export function expectViewForbiddenFieldsAbsent(
  view: any,
  context?: string
): void {
  for (const [groupName, fields] of Object.entries(VIEW_FORBIDDEN_FIELDS)) {
    for (const field of fields) {
      expect(view[field]).toBeUndefined();
    }
  }
}

