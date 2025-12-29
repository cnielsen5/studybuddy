/**
 * ID Prefix Validation Helpers
 * 
 * Purpose: Centralize ID naming convention checks to ensure consistency
 * across all invariant and integration tests.
 * 
 * Usage:
 *   expectIdPrefix(validCard.id, "card_");
 *   expectIdPrefix(validQuestion.id, "q_");
 */

/**
 * Validates that an ID follows the expected prefix convention
 * 
 * @param id - The ID string to validate
 * @param expectedPrefix - The expected prefix (e.g., "card_", "q_", "opt_")
 * @param context - Optional context string for better error messages
 * 
 * @example
 * expectIdPrefix(validCard.id, "card_", "Card ID");
 * expectIdPrefix(validQuestion.id, "q_");
 */
export function expectIdPrefix(
  id: string,
  expectedPrefix: string,
  context?: string
): void {
  expect(typeof id).toBe("string");
  // Escape special regex characters in the prefix
  const escapedPrefix = expectedPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  expect(id).toMatch(new RegExp(`^${escapedPrefix}`));
}

/**
 * Validates that an array of IDs all follow the expected prefix convention
 * 
 * @param ids - Array of ID strings to validate
 * @param expectedPrefix - The expected prefix (e.g., "card_", "q_", "opt_")
 * @param context - Optional context string for better error messages
 * 
 * @example
 * expectIdPrefixes(validCard.relations.related_question_ids, "q_", "Related question IDs");
 */
export function expectIdPrefixes(
  ids: string[],
  expectedPrefix: string,
  context?: string
): void {
  expect(Array.isArray(ids)).toBe(true);
  for (const id of ids) {
    expectIdPrefix(id, expectedPrefix, context);
  }
}

/**
 * Common ID prefix constants for consistency
 */
export const ID_PREFIXES = {
  CARD: "card_",
  QUESTION: "q_",
  OPTION: "opt_",
  ATTEMPT: "attempt_",
  EVENT: "evt_",
  CONCEPT: "concept_",
  RELATIONSHIP: "rel_",
  RELATIONSHIP_CARD: "card_rel_",
  MISCONCEPTION: "mis_edge_",
  SESSION: "session_",
  USER: "user_",
  LIBRARY: "lib_",
  QUEUE_ITEM: "queue_item_",
} as const;

