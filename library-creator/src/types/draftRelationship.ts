import { z } from "zod";

const isoDateTime = z.string().datetime({ offset: true }).or(z.string().datetime());

export const DraftRelationshipSchema = z.object({
  relationship_id: z.string().regex(/^rel_[a-z0-9_]+$/),
  type: z.literal("relationship"),
  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.literal("library_creator"),
    last_updated_by: z.literal("library_creator"),
    version: z.string(),
    status: z.literal("draft"),
    tags: z.array(z.string()),
    version_history: z.array(z.unknown()).default([]),
  }),
  graph_context: z.object({
    library_id: z.string(),
    domain: z.string(),
    category: z.string(),
    subcategory: z.string(),
  }),
  endpoints: z.object({
    from_concept_id: z.string().regex(/^concept_[a-z0-9_]+$/),
    to_concept_id: z.string().regex(/^concept_[a-z0-9_]+$/),
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
    relationship_card_ids: z.array(z.string()).default([]),
    question_ids: z.array(z.string()).default([]),
  }),
  provenance: z
    .object({
      generationMethod: z.enum(["heuristic", "openai"]),
      sourceReason: z.string().optional(),
    })
    .optional(),
});

export type DraftRelationship = z.infer<typeof DraftRelationshipSchema>;

export const RelationshipsDraftSchema = z.object({
  libraryId: z.string().regex(/^lib_[a-z0-9_]+$/),
  relationships: z.array(DraftRelationshipSchema),
  generationMethod: z.enum(["heuristic", "openai"]),
  notes: z.array(z.string()).optional(),
});

export type RelationshipsDraft = z.infer<typeof RelationshipsDraftSchema>;
