import { z } from "zod";

const isoDateTime = z.string().datetime({ offset: true }).or(z.string().datetime());

export const DraftConceptSchema = z.object({
  id: z.string().regex(/^concept_[a-z0-9_]+$/),
  type: z.literal("concept"),
  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.literal("library_creator"),
    last_updated_by: z.literal("library_creator"),
    version: z.string(),
    status: z.literal("draft"),
    tags: z.array(z.string()),
    search_keywords: z.array(z.string()).optional(),
    version_history: z.array(z.unknown()).optional(),
  }),
  editorial: z
    .object({
      difficulty: z.enum(["basic", "intermediate", "advanced"]),
      high_yield_score: z.number().min(0).max(10),
    })
    .optional(),
  hierarchy: z.object({
    library_id: z.string(),
    domain: z.string(),
    category: z.string(),
    subcategory: z.string(),
    topic: z.string(),
    subtopic: z.string().optional(),
  }),
  content: z.object({
    title: z.string().min(1),
    definition: z.string().min(1),
    summary: z.string().min(1),
  }),
  dependency_graph: z.object({
    prerequisites: z.array(z.string()),
    unlocks: z.array(z.string()),
    related_concepts: z.array(z.string()),
    child_concepts: z.array(z.string()),
    semantic_relations: z.array(z.string()).optional(),
  }),
  mastery_config: z.object({
    threshold: z.number().min(0).max(1),
    decay_rate: z.enum(["fast", "standard", "slow"]),
    min_questions_correct: z.number().int().positive(),
  }),
  media: z.array(z.unknown()).optional(),
  references: z.array(z.unknown()).optional(),
  linked_content: z.object({
    card_ids: z.array(z.string()),
    question_ids: z.array(z.string()),
  }),
  /** Review metadata — stripped before Golden Master export. */
  provenance: z
    .object({
      sourceSectionIndex: z.number().int().nonnegative().optional(),
      sourceSectionTitle: z.string().optional(),
      sourceUrl: z.string().url().optional(),
      sourcePageTitle: z.string().optional(),
      extractionMethod: z.enum(["heuristic", "openai"]),
      confidence: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

export type DraftConcept = z.infer<typeof DraftConceptSchema>;

export const SuggestedPrerequisiteSchema = z.object({
  from_concept_id: z.string(),
  to_concept_id: z.string(),
  reason: z.string().optional(),
});

export type SuggestedPrerequisite = z.infer<typeof SuggestedPrerequisiteSchema>;

export const ConceptGraphDraftSchema = z.object({
  proposedLibraryId: z.string().regex(/^lib_[a-z0-9_]+$/),
  concepts: z.array(DraftConceptSchema).min(1),
  suggestedPrerequisites: z.array(SuggestedPrerequisiteSchema),
  extractionMethod: z.enum(["heuristic", "openai"]),
  notes: z.array(z.string()).optional(),
});

export type ConceptGraphDraft = z.infer<typeof ConceptGraphDraftSchema>;
