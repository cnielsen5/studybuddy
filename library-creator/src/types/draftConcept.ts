import { z } from "zod";
import {
  DomainContextSchema,
  KnowledgeGraphSchema,
  LegacyHierarchySchema,
  LegacyLinkedContentSchema,
} from "./domainContext.js";
import { ResolutionLevelSchema, AnchorConceptIdSchema } from "./resolution.js";

const isoDateTime = z.string().datetime({ offset: true }).or(z.string().datetime());

const universalDependencyGraphSchema = z.object({
  parent_concept_id: z.string().optional(),
  prerequisites: z.array(z.string()),
  unlocks: z.array(z.string()),
  related_concepts: z.array(z.string()),
  child_concepts: z.array(z.string()),
  semantic_relations: z.array(z.string()).optional(),
});

export const DraftConceptSchema = z
  .object({
    id: z.string().regex(/^concept_[a-z0-9_]+$/),
    type: z.literal("concept"),
    resolution_level: ResolutionLevelSchema.default(3),
    /** Canonical spine node this library concept extends (required for L4/L5). */
    anchor_concept_id: AnchorConceptIdSchema.optional(),
    /** @deprecated Use anchor_concept_id */
    spine_concept_id: AnchorConceptIdSchema.optional(),
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
    content: z.object({
      title: z.string().min(1),
      definition: z.string().min(1),
      summary: z.string().min(1),
    }),
    knowledge_graph: KnowledgeGraphSchema.optional(),
    domain_contexts: z.array(DomainContextSchema).optional(),
    /** @deprecated Use domain_contexts — kept for legacy bundles during migration. */
    hierarchy: LegacyHierarchySchema.optional(),
    /** @deprecated Use per-context linked_content — aggregate mirror for tooling. */
    linked_content: LegacyLinkedContentSchema.optional(),
    dependency_graph: universalDependencyGraphSchema,
    mastery_config: z.object({
      threshold: z.number().min(0).max(1),
      decay_rate: z.enum(["fast", "standard", "slow"]),
      min_questions_correct: z.number().int().positive(),
    }),
    media: z.array(z.unknown()).optional(),
    references: z.array(z.unknown()).optional(),
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
  })
  .superRefine((concept, ctx) => {
    const hasContexts = (concept.domain_contexts?.length ?? 0) > 0;
    const hasLegacy = Boolean(concept.hierarchy);

    if (!hasContexts && !hasLegacy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Concept must include domain_contexts (preferred) or legacy hierarchy",
      });
    }

    if (hasContexts && !concept.knowledge_graph) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "domain_contexts require knowledge_graph positioning",
      });
    }
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
