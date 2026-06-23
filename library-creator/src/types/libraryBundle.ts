import { z } from "zod";

const isoDateTime = z.string().datetime({ offset: true }).or(z.string().datetime());

export const LibraryManifestSchema = z.object({
  id: z.string().regex(/^lib_[a-z0-9_]+$/),
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().min(1),
  domain: z.string().min(1),
  created_at: isoDateTime,
  updated_at: isoDateTime,
  status: z.enum(["draft", "published"]),
  tags: z.array(z.string()),
});

export type LibraryManifest = z.infer<typeof LibraryManifestSchema>;

export const ExportedConceptSchema = z.object({
  id: z.string().regex(/^concept_[a-z0-9_]+$/),
  type: z.literal("concept"),
  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.string(),
    last_updated_by: z.string(),
    version: z.string(),
    status: z.enum(["draft", "published"]),
    tags: z.array(z.string()),
    search_keywords: z.array(z.string()).optional(),
    version_history: z.array(z.unknown()).optional(),
  }),
  editorial: z
    .object({
      difficulty: z.enum(["basic", "intermediate", "advanced"]),
      high_yield_score: z.number(),
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
    title: z.string(),
    definition: z.string(),
    summary: z.string(),
  }),
  dependency_graph: z.object({
    prerequisites: z.array(z.string()),
    unlocks: z.array(z.string()),
    related_concepts: z.array(z.string()),
    child_concepts: z.array(z.string()),
    semantic_relations: z.array(z.string()).optional(),
  }),
  mastery_config: z.object({
    threshold: z.number(),
    decay_rate: z.enum(["fast", "standard", "slow"]),
    min_questions_correct: z.number().int().positive(),
  }),
  media: z.array(z.unknown()),
  references: z.array(z.unknown()),
  linked_content: z.object({
    card_ids: z.array(z.string()),
    question_ids: z.array(z.string()),
  }),
});

export const ExportedRelationshipSchema = z.object({
  relationship_id: z.string().regex(/^rel_[a-z0-9_]+$/),
  type: z.literal("relationship"),
  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.string(),
    last_updated_by: z.string(),
    version: z.string(),
    status: z.enum(["draft", "published"]),
    tags: z.array(z.string()),
    version_history: z.array(z.unknown()).optional(),
  }),
  graph_context: z.object({
    library_id: z.string(),
    domain: z.string(),
    category: z.string(),
    subcategory: z.string(),
  }),
  endpoints: z.object({
    from_concept_id: z.string(),
    to_concept_id: z.string(),
  }),
  relation: z.object({
    relationship_type: z.enum([
      "prerequisite",
      "unlocks",
      "reinforces",
      "contrasts",
      "causes",
      "associated_with",
    ]),
    directionality: z.enum(["forward", "bidirectional"]),
  }),
  editorial: z.object({
    importance: z.enum(["low", "medium", "high"]),
    notes: z.string(),
  }),
  linked_content: z.object({
    relationship_card_ids: z.array(z.string()),
    question_ids: z.array(z.string()),
  }),
});

export const ExportedCardSchema = z.object({
  id: z.string().regex(/^card_[a-z0-9_]+$/),
  type: z.literal("card"),
  relations: z.object({
    concept_id: z.string(),
    related_question_ids: z.array(z.string()).optional(),
  }),
  config: z.object({
    card_type: z.enum(["basic", "cloze", "image_occlusion"]),
    pedagogical_role: z.enum([
      "recognition",
      "recall",
      "synthesis",
      "application",
      "integration",
    ]),
    card_tier: z.enum(["core", "extension", "certification", "remedial"]),
  }),
  content: z.object({
    front: z.string(),
    back: z.string(),
    cloze_data: z.unknown().optional(),
  }),
  media: z.array(z.unknown()),
  editorial: z.object({
    difficulty: z.enum(["easy", "medium", "hard"]),
    tags: z.array(z.string()),
  }),
  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.string(),
    status: z.enum(["draft", "published"]),
    version: z.string(),
  }),
});

export const ExportedQuestionSchema = z.object({
  id: z.string().regex(/^q_[a-z0-9_]+$/),
  type: z.literal("question"),
  relations: z.object({
    concept_ids: z.array(z.string()).min(1),
    related_card_ids: z.array(z.string()).optional(),
  }),
  source: z.object({
    origin: z.enum(["public", "validated", "ai_generated"]),
    provider: z.string(),
    subscription_required: z.boolean(),
  }),
  classification: z.object({
    question_type: z.literal("mcq"),
    usage_role: z.enum([
      "generic",
      "diagnostic",
      "establishment",
      "targeted",
      "misconception_directed",
    ]),
    cognitive_level: z.enum([
      "pathophysiology",
      "diagnosis",
      "management",
      "mechanism",
    ]),
  }),
  content: z.object({
    stem: z.string(),
    options: z.array(
      z.object({
        id: z.string().regex(/^opt_[A-D]$/),
        text: z.string(),
      })
    ),
    correct_option_id: z.string(),
  }),
  explanations: z.object({
    general: z.string(),
    distractors: z.record(z.string(), z.string()).optional(),
  }),
  editorial: z.object({
    difficulty: z.enum(["easy", "medium", "hard"]),
    tags: z.array(z.string()),
  }),
  media: z.array(z.unknown()),
  references: z.array(z.unknown()),
  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.string(),
    status: z.enum(["draft", "published"]),
    version: z.string(),
  }),
});

export const LibraryBundleSchema = z.object({
  manifest: LibraryManifestSchema,
  concepts: z.array(ExportedConceptSchema).min(1),
  relationships: z.array(ExportedRelationshipSchema),
  cards: z.array(ExportedCardSchema).min(1),
  questions: z.array(ExportedQuestionSchema),
});

export type LibraryBundle = z.infer<typeof LibraryBundleSchema>;

export const LibraryExportRecordSchema = z.object({
  exportedAt: isoDateTime,
  libraryId: z.string(),
  artifactPath: z.string(),
  publishStatus: z.enum(["draft", "published"]),
  stats: z.object({
    concepts: z.number().int().nonnegative(),
    relationships: z.number().int().nonnegative(),
    cards: z.number().int().nonnegative(),
    questions: z.number().int().nonnegative(),
  }),
  notes: z.array(z.string()).optional(),
});

export type LibraryExportRecord = z.infer<typeof LibraryExportRecordSchema>;
