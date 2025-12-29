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

