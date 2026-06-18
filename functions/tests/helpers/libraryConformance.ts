/**
 * Library bundle conformance rules aligned with socrates-structure-and-organizer.md §5
 */

export const ALLOWED_RELATIONSHIP_TYPES = [
  "prerequisite",
  "unlocks",
  "reinforces",
  "contrasts",
  "causes",
  "associated_with",
] as const;

export const ALLOWED_DIRECTIONALITY = ["forward", "bidirectional"] as const;

export const ALLOWED_CARD_TIERS = ["core", "extension", "certification", "remedial"] as const;

export const ALLOWED_PEDAGOGICAL_ROLES = [
  "recognition",
  "recall",
  "synthesis",
  "application",
  "integration",
] as const;

export const ALLOWED_USAGE_ROLES = [
  "generic",
  "diagnostic",
  "establishment",
  "targeted",
  "misconception_directed",
] as const;

export interface LibraryConceptLike {
  id: string;
  dependency_graph: {
    prerequisites: string[];
    unlocks: string[];
  };
}

export interface LibraryRelationshipLike {
  relationship_id: string;
  endpoints: { from_concept_id: string; to_concept_id: string };
  relation: { relationship_type: string; directionality: string };
}

/** Forward prerequisite edges from relationships[] */
export function prerequisiteEdgesFromRelationships(
  relationships: LibraryRelationshipLike[]
): Array<{ from: string; to: string; id: string }> {
  return relationships
    .filter(
      (r) =>
        r.relation.relationship_type === "prerequisite" &&
        r.relation.directionality === "forward"
    )
    .map((r) => ({
      from: r.endpoints.from_concept_id,
      to: r.endpoints.to_concept_id,
      id: r.relationship_id,
    }));
}

/** Every forward prerequisite relationship must appear in to-concept's dependency_graph */
export function findPrerequisiteMismatches(
  concepts: LibraryConceptLike[],
  relationships: LibraryRelationshipLike[]
): string[] {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const errors: string[] = [];

  for (const edge of prerequisiteEdgesFromRelationships(relationships)) {
    const toConcept = byId.get(edge.to);
    if (!toConcept) {
      errors.push(`${edge.id}: missing to-concept ${edge.to}`);
      continue;
    }
    if (!toConcept.dependency_graph.prerequisites.includes(edge.from)) {
      errors.push(
        `${edge.id}: ${edge.to}.dependency_graph.prerequisites missing ${edge.from}`
      );
    }
  }

  return errors;
}

/** Every dependency_graph prerequisite should have a matching forward prerequisite relationship */
export function findOrphanDependencyPrerequisites(
  concepts: LibraryConceptLike[],
  relationships: LibraryRelationshipLike[]
): string[] {
  const edges = prerequisiteEdgesFromRelationships(relationships);
  const edgeSet = new Set(edges.map((e) => `${e.from}->${e.to}`));
  const errors: string[] = [];

  for (const concept of concepts) {
    for (const prereq of concept.dependency_graph.prerequisites) {
      const key = `${prereq}->${concept.id}`;
      if (!edgeSet.has(key)) {
        errors.push(
          `${concept.id}: prerequisite ${prereq} not backed by a forward prerequisite relationship`
        );
      }
    }
  }

  return errors;
}

/** Unlocks should reflect direct children in the prerequisite tree */
export function findUnlockMismatches(
  concepts: LibraryConceptLike[],
  relationships: LibraryRelationshipLike[]
): string[] {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const errors: string[] = [];

  for (const edge of prerequisiteEdgesFromRelationships(relationships)) {
    const fromConcept = byId.get(edge.from);
    if (!fromConcept) continue;
    if (!fromConcept.dependency_graph.unlocks.includes(edge.to)) {
      errors.push(
        `${edge.id}: ${edge.from}.dependency_graph.unlocks missing ${edge.to}`
      );
    }
  }

  return errors;
}
