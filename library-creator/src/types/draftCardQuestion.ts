import { z } from "zod";

const isoDateTime = z.string().datetime({ offset: true }).or(z.string().datetime());

export const DraftCardSchema = z.object({
  id: z.string().regex(/^card_[a-z0-9_]+$/),
  type: z.literal("card"),
  relations: z.object({
    concept_id: z.string().regex(/^concept_[a-z0-9_]+$/),
    related_question_ids: z.array(z.string().regex(/^q_[a-z0-9_]+$/)).optional(),
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
    front: z.string().min(1),
    back: z.string().min(1),
    cloze_data: z
      .union([
        z.object({
          template_text: z.string(),
          cloze_fields: z.array(
            z.object({
              field_id: z.string(),
              answer: z.string(),
              hint: z.string().optional(),
            })
          ),
        }),
        z.null(),
      ])
      .optional(),
  }),
  media: z.array(z.unknown()).default([]),
  editorial: z.object({
    difficulty: z.enum(["easy", "medium", "hard"]),
    tags: z.array(z.string()),
  }),
  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.literal("library_creator"),
    status: z.literal("draft"),
    version: z.string(),
  }),
  provenance: z
    .object({
      conceptId: z.string(),
      generationMethod: z.enum(["heuristic", "openai"]),
      sourceConceptTitle: z.string().optional(),
    })
    .optional(),
});

export type DraftCard = z.infer<typeof DraftCardSchema>;

export const DraftQuestionSchema = z.object({
  id: z.string().regex(/^q_[a-z0-9_]+$/),
  type: z.literal("question"),
  relations: z.object({
    concept_ids: z.array(z.string().regex(/^concept_[a-z0-9_]+$/)).min(1),
    related_card_ids: z.array(z.string().regex(/^card_[a-z0-9_]+$/)).optional(),
  }),
  source: z.object({
    origin: z.literal("ai_generated"),
    provider: z.literal("library_creator"),
    subscription_required: z.literal(false),
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
    stem: z.string().min(1),
    options: z
      .array(
        z.object({
          id: z.string().regex(/^opt_[A-D]$/),
          text: z.string().min(1),
        })
      )
      .length(4),
    correct_option_id: z.string().regex(/^opt_[A-D]$/),
  }),
  explanations: z.object({
    general: z.string().min(1),
    distractors: z.record(z.string(), z.string()).optional(),
  }),
  editorial: z.object({
    difficulty: z.enum(["easy", "medium", "hard"]),
    tags: z.array(z.string()),
  }),
  media: z.array(z.unknown()).default([]),
  references: z.array(z.unknown()).default([]),
  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.literal("library_creator"),
    status: z.literal("draft"),
    version: z.string(),
  }),
  provenance: z
    .object({
      conceptId: z.string(),
      generationMethod: z.enum(["heuristic", "openai"]),
    })
    .optional(),
});

export type DraftQuestion = z.infer<typeof DraftQuestionSchema>;

export const CardsQuestionsDraftSchema = z.object({
  libraryId: z.string().regex(/^lib_[a-z0-9_]+$/),
  cards: z.array(DraftCardSchema),
  questions: z.array(DraftQuestionSchema),
  generationMethod: z.enum(["heuristic", "openai"]),
  notes: z.array(z.string()).optional(),
});

export type CardsQuestionsDraft = z.infer<typeof CardsQuestionsDraftSchema>;
