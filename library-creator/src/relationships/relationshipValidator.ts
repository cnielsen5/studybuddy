import type { DraftConcept } from "../types/draftConcept.js";
import {
  RelationshipsDraftSchema,
  type DraftRelationship,
  type RelationshipsDraft,
} from "../types/draftRelationship.js";

export interface RelationshipValidationIssue {
  severity: "error" | "warning";
  relationshipId?: string;
  message: string;
}

export interface RelationshipValidationResult {
  valid: boolean;
  issues: RelationshipValidationIssue[];
}

export function validateRelationshipsDraft(
  draft: RelationshipsDraft,
  concepts: DraftConcept[]
): RelationshipValidationResult {
  RelationshipsDraftSchema.parse(draft);

  const issues: RelationshipValidationIssue[] = [];
  const conceptIds = new Set(concepts.map((c) => c.id));
  const relationshipIds = new Set<string>();

  for (const relationship of draft.relationships) {
    validateRelationshipEntity(relationship, conceptIds, relationshipIds, issues);
  }

  issues.push(
    ...findPrerequisiteMismatches(concepts, draft.relationships).map((message) => ({
      severity: "error" as const,
      message,
    }))
  );
  issues.push(
    ...findOrphanDependencyPrerequisites(concepts, draft.relationships).map(
      (message) => ({
        severity: "error" as const,
        message,
      })
    )
  );
  issues.push(
    ...findUnlockMismatches(concepts, draft.relationships).map((message) => ({
      severity: "warning" as const,
      message,
    }))
  );

  if (draft.relationships.length === 0 && concepts.length > 1) {
    issues.push({
      severity: "warning",
      message: "No relationships mapped — concept map will be flat",
    });
  }

  return {
    valid: issues.every((i) => i.severity !== "error"),
    issues,
  };
}

function validateRelationshipEntity(
  relationship: DraftRelationship,
  conceptIds: Set<string>,
  relationshipIds: Set<string>,
  issues: RelationshipValidationIssue[]
): void {
  if (relationshipIds.has(relationship.relationship_id)) {
    issues.push({
      severity: "error",
      relationshipId: relationship.relationship_id,
      message: `Duplicate relationship id ${relationship.relationship_id}`,
    });
  }
  relationshipIds.add(relationship.relationship_id);

  const { from_concept_id, to_concept_id } = relationship.endpoints;
  if (from_concept_id === to_concept_id) {
    issues.push({
      severity: "error",
      relationshipId: relationship.relationship_id,
      message: "Relationship cannot connect a concept to itself",
    });
  }

  if (!conceptIds.has(from_concept_id)) {
    issues.push({
      severity: "error",
      relationshipId: relationship.relationship_id,
      message: `Missing from-concept ${from_concept_id}`,
    });
  }
  if (!conceptIds.has(to_concept_id)) {
    issues.push({
      severity: "error",
      relationshipId: relationship.relationship_id,
      message: `Missing to-concept ${to_concept_id}`,
    });
  }

  if (
    relationship.relation.relationship_type === "prerequisite" &&
    relationship.relation.directionality !== "forward"
  ) {
    issues.push({
      severity: "error",
      relationshipId: relationship.relationship_id,
      message: "Prerequisite relationships must use forward directionality",
    });
  }
}

function prerequisiteEdgesFromRelationships(
  relationships: DraftRelationship[]
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

function findPrerequisiteMismatches(
  concepts: DraftConcept[],
  relationships: DraftRelationship[]
): string[] {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const errors: string[] = [];

  for (const edge of prerequisiteEdgesFromRelationships(relationships)) {
    const toConcept = byId.get(edge.to);
    if (!toConcept) {
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

function findOrphanDependencyPrerequisites(
  concepts: DraftConcept[],
  relationships: DraftRelationship[]
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

function findUnlockMismatches(
  concepts: DraftConcept[],
  relationships: DraftRelationship[]
): string[] {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const errors: string[] = [];

  for (const edge of prerequisiteEdgesFromRelationships(relationships)) {
    const fromConcept = byId.get(edge.from);
    if (!fromConcept) {
      continue;
    }
    if (!fromConcept.dependency_graph.unlocks.includes(edge.to)) {
      errors.push(
        `${edge.id}: ${edge.from}.dependency_graph.unlocks missing ${edge.to}`
      );
    }
  }

  return errors;
}

export function formatRelationshipsSummary(
  draft: RelationshipsDraft,
  concepts: DraftConcept[]
): string {
  const byType = new Map<string, number>();
  for (const relationship of draft.relationships) {
    const type = relationship.relation.relationship_type;
    byType.set(type, (byType.get(type) ?? 0) + 1);
  }

  const lines = [
    `Library id: ${draft.libraryId}`,
    `Relationships: ${draft.relationships.length}`,
    `Concepts: ${concepts.length}`,
    `Method: ${draft.generationMethod}`,
    "",
    "By type:",
  ];

  for (const [type, count] of byType.entries()) {
    lines.push(`  • ${type}: ${count}`);
  }

  lines.push("", "Edges:");
  for (const relationship of draft.relationships) {
    const { from_concept_id, to_concept_id } = relationship.endpoints;
    lines.push(
      `- ${relationship.relationship_id}  ${from_concept_id} → ${to_concept_id}  (${relationship.relation.relationship_type}, ${relationship.relation.directionality})`
    );
  }

  if (draft.notes?.length) {
    lines.push("", "Notes:");
    for (const note of draft.notes) {
      lines.push(`  • ${note}`);
    }
  }

  return lines.join("\n");
}
