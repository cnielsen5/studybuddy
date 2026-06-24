import type { LibraryBundle } from "../types/libraryBundle.js";
import { LibraryBundleSchema } from "../types/libraryBundle.js";
import { aggregateLinkedContent } from "../types/domainContext.js";

export const ALLOWED_RELATIONSHIP_TYPES = [
  "prerequisite",
  "unlocks",
  "reinforces",
  "contrasts",
  "causes",
  "associated_with",
] as const;

export const ALLOWED_DIRECTIONALITY = ["forward", "bidirectional"] as const;

export const ALLOWED_CARD_TIERS = [
  "core",
  "extension",
  "certification",
  "remedial",
] as const;

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

export interface LibraryConformanceIssue {
  severity: "error" | "warning";
  entityId?: string;
  message: string;
}

export interface LibraryConformanceResult {
  valid: boolean;
  issues: LibraryConformanceIssue[];
}

interface ConceptLike {
  id: string;
  dependency_graph: {
    prerequisites: string[];
    unlocks: string[];
    related_concepts: string[];
  };
  linked_content: { card_ids: string[]; question_ids: string[] };
}

interface RelationshipLike {
  relationship_id: string;
  endpoints: { from_concept_id: string; to_concept_id: string };
  relation: { relationship_type: string; directionality: string };
  linked_content: { relationship_card_ids: string[]; question_ids: string[] };
}

export interface ValidateLibraryBundleOptions {
  /** Canonical spine node ids — required for tier-2 unlock/prerequisite validation. */
  spineIds?: Set<string>;
}

export function validateLibraryBundle(
  bundle: LibraryBundle,
  options: ValidateLibraryBundleOptions = {}
): LibraryConformanceResult {
  LibraryBundleSchema.parse(bundle);

  const issues: LibraryConformanceIssue[] = [];
  const conceptIds = new Set(bundle.concepts.map((c) => c.id));
  const spineIds = options.spineIds ?? new Set<string>();
  const graphIds = new Set<string>([...conceptIds, ...spineIds]);
  const cardIds = new Set(bundle.cards.map((c) => c.id));
  const questionIds = new Set(bundle.questions.map((q) => q.id));
  const relationshipIds = new Set<string>();

  validateManifest(bundle, issues);
  validateConcepts(bundle.concepts, graphIds, spineIds, cardIds, questionIds, issues);
  validateRelationships(
    bundle.relationships,
    conceptIds,
    cardIds,
    questionIds,
    relationshipIds,
    issues
  );
  validateCards(bundle.cards, conceptIds, questionIds, issues);
  validateQuestions(bundle.questions, conceptIds, cardIds, issues);
  validateCrossLinks(
    bundle.concepts,
    bundle.relationships,
    bundle.cards,
    cardIds,
    issues
  );

  issues.push(
    ...findPrerequisiteMismatches(
      bundle.concepts as ConceptLike[],
      bundle.relationships as RelationshipLike[]
    ).map((message) => ({ severity: "error" as const, message }))
  );
  issues.push(
    ...findOrphanDependencyPrerequisites(
      bundle.concepts as ConceptLike[],
      bundle.relationships as RelationshipLike[]
    ).map((message) => ({ severity: "error" as const, message }))
  );
  issues.push(
    ...findUnlockMismatches(
      bundle.concepts as ConceptLike[],
      bundle.relationships as RelationshipLike[]
    ).map((message) => ({
      severity: "warning" as const,
      message,
    }))
  );

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    issues,
  };
}

function conceptLinkedContent(concept: LibraryBundle["concepts"][number]): {
  card_ids: string[];
  question_ids: string[];
} {
  if (concept.domain_contexts?.length) {
    return aggregateLinkedContent(concept.domain_contexts);
  }
  return concept.linked_content ?? { card_ids: [], question_ids: [] };
}

function validateManifest(bundle: LibraryBundle, issues: LibraryConformanceIssue[]): void {
  const libraryId =
    bundle.concepts[0]?.knowledge_graph?.library_id ??
    bundle.concepts[0]?.hierarchy?.library_id;
  if (libraryId && bundle.manifest.id !== libraryId) {
    issues.push({
      severity: "error",
      entityId: bundle.manifest.id,
      message: "manifest.id must match concept hierarchy.library_id",
    });
  }
}

function validateConcepts(
  concepts: LibraryBundle["concepts"],
  graphIds: Set<string>,
  spineIds: Set<string>,
  cardIds: Set<string>,
  questionIds: Set<string>,
  issues: LibraryConformanceIssue[]
): void {
  for (const concept of concepts) {
    if (!concept.id.startsWith("concept_")) {
      issues.push({
        severity: "error",
        entityId: concept.id,
        message: "Concept id must use concept_ prefix",
      });
    }

    const level = concept.resolution_level ?? 3;
    const anchor =
      concept.anchor_concept_id?.trim() || concept.spine_concept_id?.trim();
    if (level >= 4 && !anchor) {
      issues.push({
        severity: spineIds.size > 0 ? "error" : "warning",
        entityId: concept.id,
        message:
          "Library concepts at resolution 4+ require anchor_concept_id before spine-linked export",
      });
    }

    for (const id of [
      ...concept.dependency_graph.prerequisites,
      ...concept.dependency_graph.unlocks,
      ...concept.dependency_graph.related_concepts,
      ...concept.dependency_graph.child_concepts,
    ]) {
      if (!graphIds.has(id)) {
        issues.push({
          severity: "error",
          entityId: concept.id,
          message:
            id.startsWith("spine_")
              ? `Concept references missing spine node ${id}`
              : `Concept references missing concept ${id}`,
        });
      }
    }

    const parentId = concept.dependency_graph.parent_concept_id;
    if (parentId && !graphIds.has(parentId)) {
      issues.push({
        severity: "error",
        entityId: concept.id,
        message: `Concept references missing parent ${parentId}`,
      });
    }

    const anchorId = concept.anchor_concept_id ?? concept.spine_concept_id;
    if (anchorId?.startsWith("spine_") && spineIds.size > 0 && !spineIds.has(anchorId)) {
      issues.push({
        severity: "error",
        entityId: concept.id,
        message: `anchor_concept_id ${anchorId} is not present in the loaded spine`,
      });
    }

    for (const cardId of conceptLinkedContent(concept).card_ids) {
      if (!cardIds.has(cardId)) {
        issues.push({
          severity: "error",
          entityId: concept.id,
          message: `Concept references missing card ${cardId}`,
        });
      }
    }

    for (const questionId of conceptLinkedContent(concept).question_ids) {
      if (!questionIds.has(questionId)) {
        issues.push({
          severity: "error",
          entityId: concept.id,
          message: `Concept references missing question ${questionId}`,
        });
      }
    }
  }
}

function validateRelationships(
  relationships: LibraryBundle["relationships"],
  conceptIds: Set<string>,
  cardIds: Set<string>,
  questionIds: Set<string>,
  relationshipIds: Set<string>,
  issues: LibraryConformanceIssue[]
): void {
  for (const relationship of relationships) {
    if (relationshipIds.has(relationship.relationship_id)) {
      issues.push({
        severity: "error",
        entityId: relationship.relationship_id,
        message: `Duplicate relationship id ${relationship.relationship_id}`,
      });
    }
    relationshipIds.add(relationship.relationship_id);

    if (!ALLOWED_RELATIONSHIP_TYPES.includes(
      relationship.relation.relationship_type as (typeof ALLOWED_RELATIONSHIP_TYPES)[number]
    )) {
      issues.push({
        severity: "error",
        entityId: relationship.relationship_id,
        message: `Invalid relationship_type ${relationship.relation.relationship_type}`,
      });
    }

    if (!ALLOWED_DIRECTIONALITY.includes(
      relationship.relation.directionality as (typeof ALLOWED_DIRECTIONALITY)[number]
    )) {
      issues.push({
        severity: "error",
        entityId: relationship.relationship_id,
        message: `Invalid directionality ${relationship.relation.directionality}`,
      });
    }

    if (
      !conceptIds.has(relationship.endpoints.from_concept_id) ||
      !conceptIds.has(relationship.endpoints.to_concept_id)
    ) {
      issues.push({
        severity: "error",
        entityId: relationship.relationship_id,
        message: "Relationship endpoints must reference existing concepts",
      });
    }

    for (const cardId of relationship.linked_content.relationship_card_ids) {
      if (!cardIds.has(cardId)) {
        issues.push({
          severity: "error",
          entityId: relationship.relationship_id,
          message: `Relationship references missing card ${cardId}`,
        });
      }
    }

    for (const questionId of relationship.linked_content.question_ids) {
      if (!questionIds.has(questionId)) {
        issues.push({
          severity: "error",
          entityId: relationship.relationship_id,
          message: `Relationship references missing question ${questionId}`,
        });
      }
    }
  }
}

function validateCards(
  cards: LibraryBundle["cards"],
  conceptIds: Set<string>,
  questionIds: Set<string>,
  issues: LibraryConformanceIssue[]
): void {
  for (const card of cards) {
    if (!card.id.startsWith("card_")) {
      issues.push({
        severity: "error",
        entityId: card.id,
        message: "Card id must use card_ prefix",
      });
    }

    if (!conceptIds.has(card.relations.concept_id)) {
      issues.push({
        severity: "error",
        entityId: card.id,
        message: `Card references missing concept ${card.relations.concept_id}`,
      });
    }

    if (!ALLOWED_CARD_TIERS.includes(card.config.card_tier)) {
      issues.push({
        severity: "error",
        entityId: card.id,
        message: "Card missing valid card_tier",
      });
    }

    if (!ALLOWED_PEDAGOGICAL_ROLES.includes(card.config.pedagogical_role)) {
      issues.push({
        severity: "error",
        entityId: card.id,
        message: "Card missing valid pedagogical_role",
      });
    }

    if (card.content.front.length === 0 || card.content.back.length === 0) {
      issues.push({
        severity: "error",
        entityId: card.id,
        message: "Card content must include front and back",
      });
    }

    for (const questionId of card.relations.related_question_ids ?? []) {
      if (!questionIds.has(questionId)) {
        issues.push({
          severity: "error",
          entityId: card.id,
          message: `Card references missing question ${questionId}`,
        });
      }
    }
  }
}

function validateQuestions(
  questions: LibraryBundle["questions"],
  conceptIds: Set<string>,
  cardIds: Set<string>,
  issues: LibraryConformanceIssue[]
): void {
  for (const question of questions) {
    if (!question.id.startsWith("q_")) {
      issues.push({
        severity: "error",
        entityId: question.id,
        message: "Question id must use q_ prefix",
      });
    }

    if (!ALLOWED_USAGE_ROLES.includes(question.classification.usage_role)) {
      issues.push({
        severity: "error",
        entityId: question.id,
        message: "Question missing valid usage_role",
      });
    }

    for (const conceptId of question.relations.concept_ids) {
      if (!conceptIds.has(conceptId)) {
        issues.push({
          severity: "error",
          entityId: question.id,
          message: `Question references missing concept ${conceptId}`,
        });
      }
    }

    for (const cardId of question.relations.related_card_ids ?? []) {
      if (!cardIds.has(cardId)) {
        issues.push({
          severity: "error",
          entityId: question.id,
          message: `Question references missing card ${cardId}`,
        });
      }
    }

    const optionIds = new Set(question.content.options.map((option) => option.id));
    if (!optionIds.has(question.content.correct_option_id)) {
      issues.push({
        severity: "error",
        entityId: question.id,
        message: "Question correct_option_id must match an option",
      });
    }
  }
}

function validateCrossLinks(
  concepts: LibraryBundle["concepts"],
  relationships: LibraryBundle["relationships"],
  cards: LibraryBundle["cards"],
  cardIds: Set<string>,
  issues: LibraryConformanceIssue[]
): void {
  const linkedCards = new Set<string>();
  for (const concept of concepts) {
    for (const cardId of conceptLinkedContent(concept).card_ids) {
      linkedCards.add(cardId);
    }
  }
  for (const relationship of relationships) {
    for (const cardId of relationship.linked_content.relationship_card_ids) {
      linkedCards.add(cardId);
    }
  }

  for (const card of cards) {
    if (!linkedCards.has(card.id)) {
      issues.push({
        severity: "warning",
        entityId: card.id,
        message: "Card is not linked from any concept or relationship",
      });
    }
  }

  if (cards.length > 0 && linkedCards.size !== cardIds.size) {
    issues.push({
      severity: "warning",
      message: "Some cards in the bundle are not referenced from linked_content",
    });
  }
}

function prerequisiteEdgesFromRelationships(
  relationships: RelationshipLike[]
): Array<{ from: string; to: string; id: string }> {
  return relationships
    .filter(
      (relationship) =>
        relationship.relation.relationship_type === "prerequisite" &&
        relationship.relation.directionality === "forward"
    )
    .map((relationship) => ({
      from: relationship.endpoints.from_concept_id,
      to: relationship.endpoints.to_concept_id,
      id: relationship.relationship_id,
    }));
}

function findPrerequisiteMismatches(
  concepts: ConceptLike[],
  relationships: RelationshipLike[]
): string[] {
  const byId = new Map(concepts.map((concept) => [concept.id, concept]));
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

function findOrphanDependencyPrerequisites(
  concepts: ConceptLike[],
  relationships: RelationshipLike[]
): string[] {
  const edges = prerequisiteEdgesFromRelationships(relationships);
  const edgeSet = new Set(edges.map((edge) => `${edge.from}->${edge.to}`));
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
  concepts: ConceptLike[],
  relationships: RelationshipLike[]
): string[] {
  const byId = new Map(concepts.map((concept) => [concept.id, concept]));
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

export function formatLibraryExportSummary(bundle: LibraryBundle): string {
  return [
    `Library: ${bundle.manifest.name}`,
    `Id: ${bundle.manifest.id}`,
    `Version: ${bundle.manifest.version}`,
    `Domain: ${bundle.manifest.domain}`,
    `Status: ${bundle.manifest.status}`,
    "",
    `Concepts: ${bundle.concepts.length}`,
    `Relationships: ${bundle.relationships.length}`,
    `Cards: ${bundle.cards.length}`,
    `Questions: ${bundle.questions.length}`,
  ].join("\n");
}
