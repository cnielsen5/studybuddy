/**
 * Zod Runtime Validation Schemas
 * 
 * Purpose: Provide runtime validation for domain objects, events, and views.
 * These schemas complement the Jest invariant tests and will be used in
 * production ingestion/projector code.
 * 
 * Note: These schemas validate structure and types, but not business logic
 * invariants (those are tested in invariant tests).
 */

import { z } from "zod";

// ============================================================================
// Common Patterns
// ============================================================================

const idPrefix = (prefix: string) => z.string().startsWith(prefix);

const isoDateTime = z.string().datetime();

// ============================================================================
// Domain Object Schemas
// ============================================================================

export const CardSchema = z.object({
  id: idPrefix("card_"),
  type: z.literal("card"),

  relations: z.object({
    concept_id: idPrefix("concept_"),
    related_question_ids: z.array(idPrefix("q_")).optional(),
  }),

  config: z.object({
    card_type: z.enum(["basic", "cloze", "image_occlusion"]),
    pedagogical_role: z.enum(["recognition", "recall", "synthesis", "application/analysis", "integration"]),
  }),

  content: z.object({
    front: z.string(),
    back: z.string(),
    cloze_data: z.union([
      z.object({
        template_text: z.string(),
        cloze_fields: z.array(z.object({
          field_id: z.string(),
          answer: z.string().optional(), // Optional if link_to is present
          hint: z.string().optional(),
          link_to: z.string().optional(), // Links to another field's answer
        })),
      }),
      z.null(),
    ]).optional(),
  }),

  media: z.array(z.object({
    id: z.string(),
    type: z.string(),
    url: z.string(),
    caption: z.string().optional(),
  })).optional(),

  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.string(),
    status: z.enum(["draft", "published"]),
    version: z.string(),
  }),

  editorial: z.object({
    tags: z.array(z.string()).optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  }).optional(),
});

export const QuestionSchema = z.object({
  id: idPrefix("q_"),
  type: z.literal("question"),

  relations: z.object({
    concept_ids: z.array(idPrefix("concept_")),
    related_card_ids: z.array(idPrefix("card_")).optional(),
  }),

  source: z.object({
    origin: z.enum(["public", "validated", "ai_generated"]),
    provider: z.string().optional(),
    subscription_required: z.boolean().optional(),
  }),

  classification: z.object({
    question_type: z.enum(["mcq", "select_all", "matching"]),
    usage_role: z.enum(["generic", "diagnostic", "establishment", "targeted", "misconception_directed"]),
    cognitive_level: z.enum(["pathophysiology", "diagnosis", "management", "mechanism"]),
  }),

  content: z.object({
    stem: z.string(),
    options: z.array(z.object({
      id: idPrefix("opt_"),
      text: z.string(),
    })),
    correct_option_id: idPrefix("opt_"),
  }),

  explanations: z.object({
    general: z.string(),
    distractors: z.record(z.string(), z.string()).optional(),
  }),

  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.string(),
    version: z.string(),
    status: z.enum(["draft", "published"]),
    tags: z.array(z.string()).optional(),
  }),
});

export const ConceptSchema = z.object({
  id: idPrefix("concept_"),
  type: z.literal("concept"),

  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.string(),
    last_updated_by: z.string(),
    version: z.union([z.string(), z.number()]),
    status: z.enum(["draft", "published"]),
    tags: z.array(z.string()),
    search_keywords: z.array(z.string()).optional(),
    version_history: z.array(z.any()).optional(),
  }),

  editorial: z.object({
    difficulty: z.enum(["basic", "intermediate", "advanced"]).optional(),
    high_yield_score: z.number().optional(),
  }).optional(),

  hierarchy: z.object({
    library_id: z.string(), // May not always have lib_ prefix in fixtures
    domain: z.string(),
    category: z.string(),
    subcategory: z.string(),
    topic: z.string(),
    subtopic: z.string().optional(),
  }),

  content: z.object({
    title: z.string(),
    definition: z.string(),
    summary: z.string(),
  }),

  dependency_graph: z.object({
    prerequisites: z.array(idPrefix("concept_")),
    unlocks: z.array(idPrefix("concept_")),
    related_concepts: z.array(idPrefix("concept_")),
    child_concepts: z.array(idPrefix("concept_")),
    semantic_relations: z.array(idPrefix("concept_")).optional(),
  }),

  mastery_config: z.object({
    threshold: z.number(),
    decay_rate: z.enum(["fast", "standard", "slow"]),
    min_questions_correct: z.number(),
  }),

  media: z.array(z.any()).optional(),
  references: z.array(z.any()).optional(),

  linked_content: z.object({
    card_ids: z.array(idPrefix("card_")),
    question_ids: z.array(idPrefix("q_")),
  }),
});

export const QuestionAttemptSchema = z.object({
  attempt_id: idPrefix("attempt_"),
  type: z.literal("question_attempt"),
  user_id: idPrefix("user_"),
  question_id: idPrefix("q_"),
  timestamp: isoDateTime,

  response: z.object({
    selected_option_id: idPrefix("opt_"),
  }),

  result: z.object({
    correct: z.boolean(),
  }),

  timing: z.object({
    seconds_spent: z.number().nonnegative(),
  }).optional(),

  error_analysis: z.object({
    error_type: z.enum(["misconception", "retrieval_failure", "misreading", "strategy_error", "time_pressure"]),
    confidence_mismatch: z.boolean(),
    derived_from: z.enum(["question", "followup"]),
  }).optional(),
});

// ============================================================================
// Event Schemas
// ============================================================================

const EntitySchema = z.object({
  kind: z.enum([
    "card",
    "question",
    "relationship_card",
    "concept",
    "session",
    "misconception_edge",
    "library_version", // For library_id_map_applied events
  ]),
  id: z.string(),
});

const UserEventBaseSchema = z.object({
  event_id: idPrefix("evt_"),
  type: z.string(),
  user_id: idPrefix("user_"),
  library_id: idPrefix("lib_"),
  occurred_at: isoDateTime,
  received_at: isoDateTime,
  device_id: z.string(),
  entity: EntitySchema,
  payload: z.record(z.any()), // Payloads vary by event type
  schema_version: z.string(),
});

export const UserEventSchema = UserEventBaseSchema;

// Event-specific payload schemas
export const CardReviewedPayloadSchema = z.object({
  grade: z.enum(["again", "hard", "good", "easy"]),
  seconds_spent: z.number().nonnegative(),
  rating_confidence: z.number().int().min(0).max(3).optional(),
});

export const QuestionAttemptedPayloadSchema = z.object({
  selected_option_id: idPrefix("opt_"),
  correct: z.boolean(),
  seconds_spent: z.number().nonnegative(),
});

export const SessionStartedPayloadSchema = z.object({
  planned_load: z.number().nonnegative(),
  queue_size: z.number().nonnegative(),
  cram_mode: z.boolean().optional(),
});

export const SessionEndedPayloadSchema = z.object({
  actual_load: z.number().nonnegative(),
  retention_delta: z.number().optional(),
  fatigue_hit: z.boolean().optional(),
  user_accepted_intervention: z.boolean().optional(),
});

export const ContentFlaggedPayloadSchema = z.object({
  reason: z.enum(["incorrect", "confusing", "outdated", "poorly_worded"]),
  comment: z.string().optional(),
});

export const CardAnnotationUpdatedPayloadSchema = z.object({
  action: z.enum(["added", "removed", "updated"]),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
});

export const MasteryCertificationCompletedPayloadSchema = z.object({
  certification_result: z.enum(["full", "partial", "none"]),
  questions_answered: z.number().nonnegative(),
  correct_count: z.number().nonnegative(), // Direct measurement, not aggregate
  reasoning_quality: z.enum(["good", "weak"]).optional(),
});

// ============================================================================
// View Schemas
// ============================================================================

const LastAppliedCursorSchema = z.object({
  received_at: isoDateTime,
  event_id: idPrefix("evt_"),
});

export const CardScheduleViewSchema = z.object({
  type: z.literal("card_schedule_view"),
  card_id: idPrefix("card_"),
  library_id: idPrefix("lib_").optional(),
  user_id: idPrefix("user_"),
  state: z.union([z.number().int().min(0).max(3), z.enum(["new", "learning", "review", "mastered"])]),
  due: isoDateTime.optional(),
  due_at: isoDateTime.optional(),
  stability: z.number().positive(),
  difficulty: z.number().positive(),
  interval_days: z.number().nonnegative().optional(),
  last_reviewed_at: isoDateTime.optional(),
  last_grade: z.enum(["again", "hard", "good", "easy"]).optional(),
  last_applied: LastAppliedCursorSchema,
  updated_at: isoDateTime,
});

export const CardPerformanceViewSchema = z.object({
  type: z.literal("card_performance_view"),
  card_id: idPrefix("card_"),
  library_id: idPrefix("lib_").optional(),
  user_id: idPrefix("user_"),
  total_reviews: z.number().nonnegative(),
  correct_reviews: z.number().nonnegative(),
  accuracy_rate: z.number().min(0).max(1),
  avg_seconds: z.number().nonnegative(),
  streak: z.number().nonnegative().optional(),
  max_streak: z.number().nonnegative().optional(),
  last_reviewed_at: isoDateTime.optional(),
  last_applied: LastAppliedCursorSchema,
  updated_at: isoDateTime,
});

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates a domain object against its schema
 * @throws {z.ZodError} if validation fails
 */
export function validateCard(data: unknown) {
  return CardSchema.parse(data);
}

export function validateQuestion(data: unknown) {
  return QuestionSchema.parse(data);
}

export function validateConcept(data: unknown) {
  return ConceptSchema.parse(data);
}

export function validateQuestionAttempt(data: unknown) {
  return QuestionAttemptSchema.parse(data);
}

export function validateUserEvent(data: unknown) {
  return UserEventSchema.parse(data);
}

export function validateCardScheduleView(data: unknown) {
  return CardScheduleViewSchema.parse(data);
}

export function validateCardPerformanceView(data: unknown) {
  return CardPerformanceViewSchema.parse(data);
}

/**
 * Safe validation that returns a result instead of throwing
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

