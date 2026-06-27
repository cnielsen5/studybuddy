import { z } from "zod";
import { ResolutionLevelSchema } from "./resolution.js";

const lensId = z.string().regex(/^lens_[a-z0-9_]+$/);
const sectionId = z.string().regex(/^lens_section_[a-z0-9_]+$/);
const spineId = z.string().regex(/^spine_[a-z0-9_]+$/);
const domainId = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/, "domain_id must be lowercase slug (e.g. medicine_clinical)");
const isoDateTime = z.string().datetime({ offset: true }).or(z.string().datetime());

/** Per-concept placement metadata within a curriculum lens. */
export const LensConceptSpecificSchema = z.object({
  title_in_lens: z.string().optional(),
  order_in_section: z.number().int().nonnegative(),
  high_yield_in_lens: z.boolean(),
  depth_in_lens: ResolutionLevelSchema,
  notes: z.string().optional(),
});

export type LensConceptSpecific = z.infer<typeof LensConceptSpecificSchema>;

/** Flat section row — use parent_section_id for nesting; build trees via buildSectionTree(). */
export const CurriculumSectionSchema = z.object({
  id: sectionId,
  title: z.string().min(1),
  parent_section_id: sectionId.nullable().default(null),
  order: z.number().int().nonnegative(),
  /** Examination or curriculum weight as a percentage (0–100). */
  weight: z.number().min(0).max(100).optional(),
});

export type CurriculumSection = z.infer<typeof CurriculumSectionSchema>;

export const ConceptMappingSchema = z.object({
  spine_concept_id: spineId,
  section_id: sectionId,
  lens_specific: LensConceptSpecificSchema,
});

export type ConceptMapping = z.infer<typeof ConceptMappingSchema>;

export const CurriculumLensMetadataSchema = z.object({
  created_at: isoDateTime,
  source_url: z.string().url().optional(),
  status: z.enum(["active", "archived"]),
});

export type CurriculumLensMetadata = z.infer<typeof CurriculumLensMetadataSchema>;

/**
 * Named organizational view over the spine — same concepts and cards,
 * different scope, grouping, order, and high-yield designation.
 */
export const CurriculumLensSchema = z.object({
  id: lensId,
  name: z.string().min(1),
  source: z.string().min(1),
  domain_id: domainId,
  version: z.string().min(1),
  description: z.string(),
  intended_audience: z.string(),
  sections: z.array(CurriculumSectionSchema).min(1),
  concept_mappings: z.array(ConceptMappingSchema),
  metadata: CurriculumLensMetadataSchema,
});

export type CurriculumLens = z.infer<typeof CurriculumLensSchema>;

export function parseCurriculumLens(input: unknown): CurriculumLens {
  return CurriculumLensSchema.parse(input);
}

export interface CurriculumLensValidationIssue {
  code: string;
  message: string;
}

/** Structural validation beyond Zod — section graph, mapping integrity. */
export function validateCurriculumLensStructure(
  lens: CurriculumLens,
  options: { knownSpineIds?: Set<string> } = {}
): CurriculumLensValidationIssue[] {
  const issues: CurriculumLensValidationIssue[] = [];
  const sectionIds = new Set(lens.sections.map((s) => s.id));

  for (const section of lens.sections) {
    if (section.parent_section_id && !sectionIds.has(section.parent_section_id)) {
      issues.push({
        code: "orphan_section_parent",
        message: `Section ${section.id} references missing parent ${section.parent_section_id}`,
      });
    }
    if (section.parent_section_id === section.id) {
      issues.push({
        code: "section_self_parent",
        message: `Section ${section.id} cannot be its own parent`,
      });
    }
  }

  const mappingKeys = new Set<string>();
  for (const mapping of lens.concept_mappings) {
    if (!sectionIds.has(mapping.section_id)) {
      issues.push({
        code: "mapping_unknown_section",
        message: `Mapping for ${mapping.spine_concept_id} references unknown section ${mapping.section_id}`,
      });
    }
    const key = `${mapping.spine_concept_id}::${mapping.section_id}`;
    if (mappingKeys.has(key)) {
      issues.push({
        code: "duplicate_mapping",
        message: `Duplicate mapping: ${mapping.spine_concept_id} in section ${mapping.section_id}`,
      });
    }
    mappingKeys.add(key);

    if (options.knownSpineIds && !options.knownSpineIds.has(mapping.spine_concept_id)) {
      issues.push({
        code: "unknown_spine_concept",
        message: `Mapping references spine concept not in index: ${mapping.spine_concept_id}`,
      });
    }
  }

  return issues;
}

export interface SectionTreeNode extends CurriculumSection {
  children: SectionTreeNode[];
}

/** Build a nested section tree from flat rows ordered by parent_section_id. */
export function buildSectionTree(sections: CurriculumSection[]): SectionTreeNode[] {
  const byId = new Map<string, SectionTreeNode>();
  for (const section of sections) {
    byId.set(section.id, { ...section, children: [] });
  }
  const roots: SectionTreeNode[] = [];
  for (const node of byId.values()) {
    if (node.parent_section_id && byId.has(node.parent_section_id)) {
      byId.get(node.parent_section_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortNodes = (nodes: SectionTreeNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    for (const node of nodes) sortNodes(node.children);
  };
  sortNodes(roots);
  return roots;
}

/** Depth-first flattened sections (parent before children). */
export function flattenSections(sections: CurriculumSection[]): CurriculumSection[] {
  const tree = buildSectionTree(sections);
  const out: CurriculumSection[] = [];
  const walk = (nodes: SectionTreeNode[]) => {
    for (const node of nodes) {
      const { children, ...section } = node;
      out.push(section);
      walk(children);
    }
  };
  walk(tree);
  return out;
}

export function sectionWeightMap(lens: CurriculumLens): Map<string, number | undefined> {
  return new Map(lens.sections.map((s) => [s.id, s.weight]));
}
