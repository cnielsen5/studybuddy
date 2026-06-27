import { z } from "zod";
import {
  DomainContextFramingSchema,
  HierarchyLocationSchema,
  SpineDomainLinkedContentSchema,
} from "../types/domainContext.js";

const spineId = z.string().regex(/^spine_[a-z0-9_]+$/);
const domainId = z.string().regex(/^[a-z][a-z0-9_]*$/);
const isoDateTime = z.string().datetime({ offset: true }).or(z.string().datetime());

const spineL4L5SourceReferenceSchema = z.object({
  source: z.string(),
  chapter: z.string().optional(),
  section: z.string().optional(),
  url: z.string().nullable().optional(),
});

/** Unlock target — plain id or forward-reference object. */
export const SpineL4L5UnlockRefSchema = z.union([
  spineId,
  z.object({
    concept_id: spineId,
    _forward_reference: z.literal(true),
  }),
]);

export type SpineL4L5UnlockRef = z.infer<typeof SpineL4L5UnlockRefSchema>;

export function unlockRefId(ref: SpineL4L5UnlockRef): string {
  return typeof ref === "string" ? ref : ref.concept_id;
}

export function isForwardRef(ref: SpineL4L5UnlockRef): boolean {
  return typeof ref === "object" && ref._forward_reference === true;
}

export const SpineL4L5KnowledgeGraphSchema = z.object({
  knowledge_area: z.string(),
  knowledge_cluster: z.string(),
  primary_domain: domainId,
  _shared_concept_note: z.string().nullable().optional(),
});

/** One domain lens on a universal L4/L5 concept (context membership + framing + in-context graph). */
export const SpineL4L5DomainContextSchema = z.object({
  domain_id: domainId,
  framing: DomainContextFramingSchema,
  hierarchy_location: HierarchyLocationSchema,
  dependency_graph: z.object({
    prerequisites_in_context: z.array(spineId),
    unlocks_in_context: z.array(SpineL4L5UnlockRefSchema),
  }),
  linked_content: SpineDomainLinkedContentSchema,
});

export type SpineL4L5DomainContext = z.infer<typeof SpineL4L5DomainContextSchema>;

/** Universal L4/L5 concept — one node, many domain contexts (mirrors L1–L3 SpineConcept). */
export const SpineL4L5ConceptSchema = z.object({
  id: spineId,
  resolution_level: z.union([z.literal(4), z.literal(5)]),
  anchor_concept_id: spineId,
  content: z.object({
    title: z.string(),
    definition: z.string(),
    summary: z.string(),
  }),
  knowledge_graph: SpineL4L5KnowledgeGraphSchema,
  dependency_graph: z.object({
    parent_concept_id: spineId,
    prerequisites: z.array(spineId),
    unlocks: z.array(SpineL4L5UnlockRefSchema),
  }),
  domain_contexts: z.array(SpineL4L5DomainContextSchema).min(1),
  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.string(),
    version: z.string(),
    status: z.literal("draft"),
    source_references: z.array(spineL4L5SourceReferenceSchema),
  }),
  _reviewer_note: z.string().optional(),
});

export type SpineL4L5Concept = z.infer<typeof SpineL4L5ConceptSchema>;

/** One anchor file: all universal L4/L5 concepts under a single L3 parent. */
export const SpineL4L5AnchorBundleSchema = z.object({
  _meta: z.object({
    anchor_l3_id: spineId,
    anchor_primary_domain: domainId,
    model: z.literal("universal-l4-l5").optional(),
    migrated_from: z.array(z.string()).optional(),
    migration_date: z.string().optional(),
    generation_date: z.string().optional(),
    status: z.string(),
    notes: z.string().optional(),
    dedup_summary: z.string().optional(),
    reviewer_clusters: z.array(z.unknown()).optional(),
  }),
  concepts: z.array(SpineL4L5ConceptSchema).min(1),
});

export type SpineL4L5AnchorBundle = z.infer<typeof SpineL4L5AnchorBundleSchema>;

export const SpineL4L5GraphBundleSchema = z.object({
  _meta: z.object({
    spine_version: z.string(),
    generation_date: z.string(),
    status: z.string(),
    notes: z.string(),
    anchor_count: z.number(),
    concept_counts: z.object({
      level_4: z.number(),
      level_5: z.number(),
      total: z.number(),
    }),
    forward_reference_warnings: z
      .array(
        z.object({
          from: z.string(),
          to: z.string(),
          edge: z.enum(["unlocks", "unlocks_in_context"]),
        })
      )
      .optional(),
    graph_consistency_warnings: z.array(z.string()).optional(),
    l5_membership_warnings: z.array(z.string()).optional(),
    citation_uniformity_warnings: z.array(z.string()).optional(),
  }),
  concepts: z.array(SpineL4L5ConceptSchema).min(1),
});

export type SpineL4L5GraphBundle = z.infer<typeof SpineL4L5GraphBundleSchema>;

export interface SpineL4L5ValidationResult {
  hardErrors: string[];
  warnings: string[];
  forwardReferences: Array<{ from: string; to: string; edge: "unlocks" | "unlocks_in_context" }>;
  graphConsistencyWarnings: string[];
  l5MembershipWarnings: string[];
  citationUniformityWarnings: string[];
}

export function validateSpineL4L5Graph(bundle: unknown): SpineL4L5GraphBundle {
  return SpineL4L5GraphBundleSchema.parse(bundle);
}

export function validateSpineL4L5AnchorBundle(bundle: unknown): SpineL4L5AnchorBundle {
  return SpineL4L5AnchorBundleSchema.parse(bundle);
}

/** Tier-1 validation for the universal L4/L5 model. */
export function validateSpineL4L5Structure(
  bundle: SpineL4L5GraphBundle,
  spineL3Ids: Set<string> = new Set()
): SpineL4L5ValidationResult {
  const hardErrors: string[] = [];
  const warnings: string[] = [];
  const forwardReferences: SpineL4L5ValidationResult["forwardReferences"] = [];
  const graphConsistencyWarnings: string[] = [];
  const l5MembershipWarnings: string[] = [];
  const citationUniformityWarnings: string[] = [];

  const byId = new Map(bundle.concepts.map((c) => [c.id, c]));
  const ids = new Set(byId.keys());
  const allGraphIds = new Set<string>([...ids, ...spineL3Ids]);

  // id -> set of member domain_ids
  const membership = new Map<string, Set<string>>();
  for (const c of bundle.concepts) {
    membership.set(c.id, new Set(c.domain_contexts.map((dc) => dc.domain_id)));
  }

  for (const concept of bundle.concepts) {
    // unique domain_contexts
    const ctxDomains = concept.domain_contexts.map((dc) => dc.domain_id);
    if (new Set(ctxDomains).size !== ctxDomains.length) {
      hardErrors.push(`${concept.id}: duplicate domain_id in domain_contexts`);
    }

    // structural parent rules
    if (concept.resolution_level === 4) {
      if (concept.dependency_graph.parent_concept_id !== concept.anchor_concept_id) {
        hardErrors.push(`${concept.id}: L4 parent_concept_id must equal anchor_concept_id`);
      }
    } else {
      const parent = byId.get(concept.dependency_graph.parent_concept_id);
      if (!parent || parent.resolution_level !== 4) {
        hardErrors.push(`${concept.id}: L5 parent_concept_id must reference an L4 in this bundle`);
      } else {
        // L5 contexts must be a subset of parent L4 contexts
        const parentDomains = membership.get(parent.id) ?? new Set();
        for (const dc of concept.domain_contexts) {
          if (!parentDomains.has(dc.domain_id)) {
            l5MembershipWarnings.push(
              `${concept.id}: L5 context ${dc.domain_id} not present on parent L4 ${parent.id}`
            );
          }
        }
      }
    }

    // L5 membership: every context must be max_resolution 5
    if (concept.resolution_level === 5) {
      for (const dc of concept.domain_contexts) {
        if (dc.framing.max_resolution_in_context !== 5) {
          l5MembershipWarnings.push(
            `${concept.id}: L5 concept listed in context ${dc.domain_id} with max_resolution ${dc.framing.max_resolution_in_context} (must be 5)`
          );
        }
      }
    }

    // prerequisites must exist
    for (const prereq of concept.dependency_graph.prerequisites) {
      if (!allGraphIds.has(prereq)) {
        hardErrors.push(`${concept.id}: prerequisite ${prereq} not found`);
      }
    }

    // universal unlocks: forward-ref aware
    for (const unlock of concept.dependency_graph.unlocks) {
      const target = unlockRefId(unlock);
      if (!allGraphIds.has(target)) {
        if (!isForwardRef(unlock)) {
          warnings.push(`${concept.id}: unlock ${target} not in bundle and not flagged forward`);
        }
        forwardReferences.push({ from: concept.id, to: target, edge: "unlocks" });
      }
    }

    // graph consistency: universal == union of contexts
    const universalUnlocks = new Set(concept.dependency_graph.unlocks.map(unlockRefId));
    const universalPrereqs = new Set(concept.dependency_graph.prerequisites);
    const ctxUnlockUnion = new Set<string>();
    const ctxPrereqUnion = new Set<string>();

    for (const dc of concept.domain_contexts) {
      const cUnlocks = dc.dependency_graph.unlocks_in_context.map(unlockRefId);
      const cPrereqs = dc.dependency_graph.prerequisites_in_context;
      for (const u of cUnlocks) {
        ctxUnlockUnion.add(u);
        if (!universalUnlocks.has(u)) {
          graphConsistencyWarnings.push(
            `${concept.id} [${dc.domain_id}]: unlock ${u} in context but missing from universal unlocks`
          );
        }
        // in-context edge target should be a member of this context (unless forward ref / L3)
        if (ids.has(u) && !(membership.get(u)?.has(dc.domain_id))) {
          graphConsistencyWarnings.push(
            `${concept.id} [${dc.domain_id}]: unlock ${u} target is not a member of this context`
          );
        }
      }
      for (const p of cPrereqs) {
        ctxPrereqUnion.add(p);
        if (!universalPrereqs.has(p)) {
          graphConsistencyWarnings.push(
            `${concept.id} [${dc.domain_id}]: prerequisite ${p} in context but missing from universal prerequisites`
          );
        }
        if (ids.has(p) && !(membership.get(p)?.has(dc.domain_id))) {
          graphConsistencyWarnings.push(
            `${concept.id} [${dc.domain_id}]: prerequisite ${p} target is not a member of this context`
          );
        }
      }

      if (Object.keys(dc.linked_content.by_library).length > 0) {
        hardErrors.push(`${concept.id} [${dc.domain_id}]: linked_content.by_library must be empty at spine-build`);
      }
    }

    // orphan universal edges (in universal but no context surfaces them) — only for non-forward in-bundle targets
    for (const u of universalUnlocks) {
      if (ids.has(u) && !ctxUnlockUnion.has(u)) {
        graphConsistencyWarnings.push(
          `${concept.id}: universal unlock ${u} not surfaced in any domain context`
        );
      }
    }
    for (const p of universalPrereqs) {
      if (!ctxPrereqUnion.has(p)) {
        graphConsistencyWarnings.push(
          `${concept.id}: universal prerequisite ${p} not surfaced in any domain context`
        );
      }
    }

    if (!concept.metadata.source_references?.length) {
      hardErrors.push(`${concept.id}: missing source_references`);
    }
  }

  // Citation uniformity per anchor
  const byAnchor = new Map<string, SpineL4L5Concept[]>();
  for (const c of bundle.concepts) {
    const list = byAnchor.get(c.anchor_concept_id) ?? [];
    list.push(c);
    byAnchor.set(c.anchor_concept_id, list);
  }
  for (const [anchor, concepts] of byAnchor) {
    if (concepts.length <= 3) continue;
    const keys = concepts.map((c) => {
      const ref = c.metadata.source_references[0];
      return `${ref?.source}|${ref?.chapter ?? ""}|${ref?.section ?? ""}`;
    });
    if (new Set(keys).size === 1) {
      citationUniformityWarnings.push(
        `${anchor}: all ${concepts.length} concepts share identical source/chapter/section — likely lazy citation`
      );
    }
  }

  return {
    hardErrors,
    warnings,
    forwardReferences,
    graphConsistencyWarnings,
    l5MembershipWarnings,
    citationUniformityWarnings,
  };
}

// ---------------------------------------------------------------------------
// Legacy per-context schema — migration input only (single domain_context).
// ---------------------------------------------------------------------------

const legacyDependencyGraph = z.object({
  prerequisites_in_context: z.array(spineId),
  unlocks_in_context: z.array(SpineL4L5UnlockRefSchema),
});

export const SpineL4L5LegacyConceptSchema = z.object({
  id: spineId,
  resolution_level: z.union([z.literal(4), z.literal(5)]),
  anchor_concept_id: spineId,
  domain_id: domainId,
  content: z.object({ title: z.string(), definition: z.string(), summary: z.string() }),
  knowledge_graph: SpineL4L5KnowledgeGraphSchema,
  dependency_graph: z.object({
    parent_concept_id: spineId,
    prerequisites: z.array(spineId),
    unlocks: z.array(SpineL4L5UnlockRefSchema),
  }),
  domain_context: z.object({
    domain_id: domainId,
    framing: DomainContextFramingSchema,
    hierarchy_location: HierarchyLocationSchema,
    dependency_graph: legacyDependencyGraph,
    linked_content: SpineDomainLinkedContentSchema,
  }),
  metadata: z.object({
    created_at: isoDateTime,
    updated_at: isoDateTime,
    created_by: z.string(),
    version: z.string(),
    status: z.literal("draft"),
    source_references: z.array(spineL4L5SourceReferenceSchema),
  }),
  _reviewer_note: z.string().optional(),
});

export type SpineL4L5LegacyConcept = z.infer<typeof SpineL4L5LegacyConceptSchema>;

export const SpineL4L5LegacyUnitBundleSchema = z.object({
  _meta: z.object({
    parent_l3_id: spineId,
    domain_id: domainId,
    generation_date: z.string().optional(),
    status: z.string(),
    notes: z.string().optional(),
  }),
  concepts: z.array(SpineL4L5LegacyConceptSchema).min(1),
});

export type SpineL4L5LegacyUnitBundle = z.infer<typeof SpineL4L5LegacyUnitBundleSchema>;

export function validateSpineL4L5LegacyUnitBundle(bundle: unknown): SpineL4L5LegacyUnitBundle {
  return SpineL4L5LegacyUnitBundleSchema.parse(bundle);
}
