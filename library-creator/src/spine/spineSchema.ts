import { z } from "zod";
import {
  ConceptSourceReferenceSchema,
  DomainContextSchema,
  spineLinkedContentIsEmpty,
} from "../types/domainContext.js";
import { ResolutionLevelSchema } from "../types/resolution.js";

const spineId = z.string().regex(/^spine_[a-z0-9_]+$/);
const spineOrConceptId = z
  .string()
  .regex(/^(spine_|concept_)[a-z0-9_]+$/);

const isoDateTime = z.string().datetime({ offset: true }).or(z.string().datetime());

export const SpineKnowledgeGraphSchema = z.object({
  knowledge_area: z.string(),
  knowledge_cluster: z.string(),
  primary_domain: z.string().regex(/^[a-z][a-z0-9_]*$/),
  library_id: z.string().optional(),
  _shared_concept_note: z.string().optional(),
  _placement_note: z.string().optional(),
});

export const SpineConceptSchema = z.object({
  id: spineId,
  resolution_level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  content: z.object({
    title: z.string(),
    definition: z.string(),
    summary: z.string(),
  }),
  knowledge_graph: SpineKnowledgeGraphSchema,
  dependency_graph: z.object({
    parent_concept_id: spineId.nullable(),
    prerequisites: z.array(spineOrConceptId),
    unlocks: z.array(spineOrConceptId),
  }),
  domain_contexts: z.array(DomainContextSchema).min(1),
  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.string(),
    version: z.string(),
    status: z.literal("draft"),
    source_references: z.array(ConceptSourceReferenceSchema).optional(),
  }),
});

export type SpineConcept = z.infer<typeof SpineConceptSchema>;

export const SpineGraphBundleSchema = z.object({
  _meta: z.object({
    spine_version: z.string(),
    domains_included: z.array(z.string()),
    resolution_levels_included: z.array(z.union([z.literal(1), z.literal(2), z.literal(3)])),
    status: z.string(),
    notes: z.string(),
    concept_counts: z
      .object({
        level_1: z.number(),
        level_2: z.number(),
        level_3: z.number(),
        total: z.number(),
      })
      .optional(),
    forward_reference_warnings: z
      .array(
        z.object({
          from: z.string(),
          to: z.string(),
          edge: z.enum(["unlocks", "unlocks_in_context"]),
        })
      )
      .optional(),
  }),
  concepts: z.array(SpineConceptSchema).min(1),
});

export type SpineGraphBundle = z.infer<typeof SpineGraphBundleSchema>;

export interface SpineForwardReference {
  from: string;
  to: string;
  edge: "unlocks" | "unlocks_in_context";
}

export interface SpineStructureValidationResult {
  hardErrors: string[];
  warnings: string[];
  forwardReferences: SpineForwardReference[];
}

export function validateSpineGraph(bundle: unknown): SpineGraphBundle {
  return SpineGraphBundleSchema.parse(bundle);
}

/**
 * Tier-1 spine validation: prerequisites are hard errors; unlocks are warnings + log.
 */
export function validateSpineGraphStructure(
  bundle: SpineGraphBundle
): SpineStructureValidationResult {
  const hardErrors: string[] = [];
  const warnings: string[] = [];
  const forwardReferences: SpineForwardReference[] = [];
  const ids = new Set(bundle.concepts.map((concept) => concept.id));

  for (const concept of bundle.concepts) {
    if (concept.resolution_level === 1 && concept.dependency_graph.parent_concept_id !== null) {
      hardErrors.push(`${concept.id}: level-1 root must have parent_concept_id null`);
    }
    if (concept.resolution_level > 1 && !concept.dependency_graph.parent_concept_id) {
      hardErrors.push(`${concept.id}: level ${concept.resolution_level} missing parent_concept_id`);
    }
    const parentId = concept.dependency_graph.parent_concept_id;
    if (parentId && !ids.has(parentId)) {
      hardErrors.push(`${concept.id}: parent ${parentId} not found in bundle`);
    }

    for (const prereq of concept.dependency_graph.prerequisites) {
      if (prereq.startsWith("spine_") && !ids.has(prereq)) {
        hardErrors.push(`${concept.id}: prerequisite ${prereq} does not exist in spine`);
      }
    }

    for (const unlock of concept.dependency_graph.unlocks) {
      if (unlock.startsWith("spine_") && !ids.has(unlock)) {
        warnings.push(
          `${concept.id}: unlock ${unlock} not yet defined in spine — forward reference`
        );
        forwardReferences.push({ from: concept.id, to: unlock, edge: "unlocks" });
      }
    }

    for (const context of concept.domain_contexts) {
      for (const unlock of context.dependency_graph.unlocks_in_context) {
        if (unlock.startsWith("spine_") && !ids.has(unlock)) {
          warnings.push(
            `${concept.id} [${context.domain_id}]: unlock_in_context ${unlock} not yet defined — forward reference`
          );
          forwardReferences.push({
            from: concept.id,
            to: unlock,
            edge: "unlocks_in_context",
          });
        }
      }
    }

    if (concept.resolution_level === 3) {
      const refs = concept.metadata.source_references ?? [];
      if (refs.length === 0) {
        hardErrors.push(`${concept.id}: level-3 missing source_references`);
      }
      for (const context of concept.domain_contexts) {
        if (!spineLinkedContentIsEmpty(context.linked_content)) {
          hardErrors.push(`${concept.id}: linked_content must be empty at spine-build`);
        }
      }
    }
    if (concept.metadata.status !== "draft") {
      hardErrors.push(`${concept.id}: metadata.status must be draft`);
    }
  }

  return { hardErrors, warnings, forwardReferences };
}

export function reconcileForwardReferences(
  forwardReferences: SpineForwardReference[],
  completedSpineIds: Set<string>
): SpineForwardReference[] {
  return forwardReferences.filter((ref) => !completedSpineIds.has(ref.to));
}

/** @deprecated Use validateSpineGraphStructure — returns hard errors only. */
export function validateSpineGraphStructureLegacy(bundle: SpineGraphBundle): string[] {
  return validateSpineGraphStructure(bundle).hardErrors;
}
