import type { ConceptGraphDraft, DraftConcept } from "../types/draftConcept.js";
import { ConceptGraphDraftSchema } from "../types/draftConcept.js";

export interface ConceptGraphValidationIssue {
  severity: "error" | "warning";
  conceptId?: string;
  message: string;
}

export interface ConceptGraphValidationResult {
  valid: boolean;
  issues: ConceptGraphValidationIssue[];
}

export function validateConceptGraphDraft(
  draft: ConceptGraphDraft
): ConceptGraphValidationResult {
  ConceptGraphDraftSchema.parse(draft);

  const issues: ConceptGraphValidationIssue[] = [];
  const ids = new Set<string>();
  const titles = new Map<string, string>();

  for (const concept of draft.concepts) {
    validateConcept(concept, ids, titles, issues);
  }

  for (const edge of draft.suggestedPrerequisites) {
    if (!ids.has(edge.from_concept_id)) {
      issues.push({
        severity: "error",
        conceptId: edge.to_concept_id,
        message: `Prerequisite references missing concept ${edge.from_concept_id}`,
      });
    }
    if (!ids.has(edge.to_concept_id)) {
      issues.push({
        severity: "error",
        conceptId: edge.from_concept_id,
        message: `Prerequisite references missing concept ${edge.to_concept_id}`,
      });
    }
  }

  if (draft.concepts.length === 0) {
    issues.push({ severity: "error", message: "Concept graph has no concepts" });
  }

  if (draft.concepts.length > 50) {
    issues.push({
      severity: "warning",
      message: `Large concept graph (${draft.concepts.length}) — review for atomicity`,
    });
  }

  const lowConfidence = draft.concepts.filter(
    (c) => (c.provenance?.confidence ?? 1) < 0.6
  );
  if (lowConfidence.length > 0) {
    issues.push({
      severity: "warning",
      message: `${lowConfidence.length} concept(s) have low extraction confidence`,
    });
  }

  return {
    valid: issues.every((i) => i.severity !== "error"),
    issues,
  };
}

function validateConcept(
  concept: DraftConcept,
  ids: Set<string>,
  titles: Map<string, string>,
  issues: ConceptGraphValidationIssue[]
): void {
  if (ids.has(concept.id)) {
    issues.push({
      severity: "error",
      conceptId: concept.id,
      message: `Duplicate concept id ${concept.id}`,
    });
  }
  ids.add(concept.id);

  const titleKey = concept.content.title.trim().toLowerCase();
  const existing = titles.get(titleKey);
  if (existing && existing !== concept.id) {
    issues.push({
      severity: "warning",
      conceptId: concept.id,
      message: `Duplicate title "${concept.content.title}" (also ${existing})`,
    });
  }
  titles.set(titleKey, concept.id);

  if (concept.content.definition.length < 10) {
    issues.push({
      severity: "warning",
      conceptId: concept.id,
      message: "Definition is very short",
    });
  }

  for (const prereq of concept.dependency_graph.prerequisites) {
    if (prereq === concept.id) {
      issues.push({
        severity: "error",
        conceptId: concept.id,
        message: "Concept cannot prerequisite itself",
      });
    }
  }

  if (!concept.hierarchy?.domain?.trim() && !concept.domain_contexts?.length) {
    issues.push({
      severity: "error",
      conceptId: concept.id,
      message: "Missing domain_contexts or legacy hierarchy.domain",
    });
  }
}

export function removeConceptFromDraft(
  draft: ConceptGraphDraft,
  conceptId: string
): ConceptGraphDraft {
  const concepts = draft.concepts.filter((c) => c.id !== conceptId);
  if (concepts.length === draft.concepts.length) {
    throw new Error(`Concept not found: ${conceptId}`);
  }

  const updatedConcepts = concepts.map((concept) => ({
    ...concept,
    dependency_graph: {
      ...concept.dependency_graph,
      prerequisites: concept.dependency_graph.prerequisites.filter(
        (id) => id !== conceptId
      ),
      unlocks: concept.dependency_graph.unlocks.filter((id) => id !== conceptId),
      related_concepts: concept.dependency_graph.related_concepts.filter(
        (id) => id !== conceptId
      ),
      child_concepts: concept.dependency_graph.child_concepts.filter(
        (id) => id !== conceptId
      ),
      semantic_relations: concept.dependency_graph.semantic_relations?.filter(
        (id) => id !== conceptId
      ),
    },
  }));

  return ConceptGraphDraftSchema.parse({
    ...draft,
    concepts: updatedConcepts,
    suggestedPrerequisites: draft.suggestedPrerequisites.filter(
      (edge) => edge.from_concept_id !== conceptId && edge.to_concept_id !== conceptId
    ),
  });
}

export function formatConceptGraphSummary(draft: ConceptGraphDraft): string {
  const lines = [
    `Library id: ${draft.proposedLibraryId}`,
    `Concepts: ${draft.concepts.length}`,
    `Prerequisite edges: ${draft.suggestedPrerequisites.length}`,
    `Method: ${draft.extractionMethod}`,
    "",
  ];

  for (const concept of draft.concepts) {
    const conf = concept.provenance?.confidence;
    const confLabel = conf !== undefined ? ` conf=${conf.toFixed(2)}` : "";
    const source = concept.provenance?.sourceSectionTitle ?? "";
    lines.push(
      `- ${concept.id}  ${concept.content.title}${confLabel}${source ? `  ← ${source}` : ""}`
    );
    lines.push(
      `    ${concept.hierarchy.domain} › ${concept.hierarchy.category} › ${concept.hierarchy.subcategory}`
    );
    if (concept.dependency_graph.prerequisites.length > 0) {
      lines.push(
        `    prereqs: ${concept.dependency_graph.prerequisites.join(", ")}`
      );
    }
  }

  if (draft.notes?.length) {
    lines.push("", "Notes:");
    for (const note of draft.notes) {
      lines.push(`  • ${note}`);
    }
  }

  return lines.join("\n");
}
