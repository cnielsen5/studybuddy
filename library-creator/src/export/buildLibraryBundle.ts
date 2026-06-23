import type { CardsQuestionsDraft, DraftCard, DraftQuestion } from "../types/draftCardQuestion.js";
import type { ConceptGraphDraft, DraftConcept } from "../types/draftConcept.js";
import type { DraftRelationship } from "../types/draftRelationship.js";
import type { RelationshipsDraft } from "../types/draftRelationship.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import {
  LibraryBundleSchema,
  type LibraryBundle,
} from "../types/libraryBundle.js";

export interface BuildLibraryBundleInput {
  job: { id: string; name: string; createdAt: string };
  intent: LibraryCreationIntent;
  conceptGraph: ConceptGraphDraft;
  cardsQuestions: CardsQuestionsDraft;
  relationships: RelationshipsDraft;
  options?: {
    publish?: boolean;
    version?: string;
  };
}

export function buildLibraryBundle(input: BuildLibraryBundleInput): LibraryBundle {
  const now = new Date().toISOString();
  const publish = input.options?.publish ?? false;
  const contentStatus = publish ? "published" : "draft";

  const concepts = input.conceptGraph.concepts.map((concept) =>
    exportConcept(concept, contentStatus, now)
  );
  const cards = input.cardsQuestions.cards.map((card) =>
    exportCard(card, contentStatus, now, publish)
  );
  const questions = input.cardsQuestions.questions.map((question) =>
    exportQuestion(question, contentStatus, now, publish)
  );
  const relationshipEntities = input.relationships.relationships.map((relationship) =>
    exportRelationship(relationship, contentStatus, now)
  );

  const manifest = {
    id: input.conceptGraph.proposedLibraryId,
    name: input.intent.libraryTitle || input.job.name,
    version: input.options?.version ?? "0.1.0",
    description: buildDescription(input),
    domain: input.intent.domain,
    created_at: input.job.createdAt,
    updated_at: now,
    status: contentStatus,
    tags: collectTags(concepts, input.intent),
  };

  return LibraryBundleSchema.parse({
    manifest,
    concepts,
    relationships: relationshipEntities,
    cards,
    questions,
  });
}

function exportConcept(
  concept: DraftConcept,
  status: "draft" | "published",
  now: string
): LibraryBundle["concepts"][number] {
  const { provenance: _provenance, ...rest } = concept;
  void _provenance;

  return {
    ...rest,
    metadata: {
      ...concept.metadata,
      updated_at: now,
      status,
    },
    media: concept.media ?? [],
    references: concept.references ?? [],
    dependency_graph: {
      prerequisites: concept.dependency_graph.prerequisites,
      unlocks: concept.dependency_graph.unlocks,
      related_concepts: concept.dependency_graph.related_concepts,
      child_concepts: concept.dependency_graph.child_concepts,
      semantic_relations: concept.dependency_graph.semantic_relations ?? [],
    },
  };
}

function exportCard(
  card: DraftCard,
  status: "draft" | "published",
  now: string,
  publish: boolean
): LibraryBundle["cards"][number] {
  const { provenance: _provenance, ...rest } = card;
  void _provenance;

  return {
    id: rest.id,
    type: rest.type,
    relations: rest.relations,
    config: rest.config,
    content: {
      front: rest.content.front,
      back: rest.content.back,
      cloze_data: rest.content.cloze_data ?? null,
    },
    media: rest.media ?? [],
    editorial: rest.editorial,
    metadata: {
      ...rest.metadata,
      updated_at: now,
      status,
      created_by: publish ? "library_creator" : rest.metadata.created_by,
    },
  };
}

function exportQuestion(
  question: DraftQuestion,
  status: "draft" | "published",
  now: string,
  publish: boolean
): LibraryBundle["questions"][number] {
  const { provenance: _provenance, ...rest } = question;
  void _provenance;

  return {
    id: rest.id,
    type: rest.type,
    relations: {
      concept_ids: rest.relations.concept_ids,
      related_card_ids: rest.relations.related_card_ids ?? [],
    },
    source: {
      origin: publish ? "validated" : "ai_generated",
      provider: "library_creator",
      subscription_required: false,
    },
    classification: rest.classification,
    content: rest.content,
    explanations: rest.explanations,
    editorial: rest.editorial,
    media: rest.media ?? [],
    references: rest.references ?? [],
    metadata: {
      ...rest.metadata,
      updated_at: now,
      status,
    },
  };
}

function exportRelationship(
  relationship: DraftRelationship,
  status: "draft" | "published",
  now: string
): LibraryBundle["relationships"][number] {
  const { provenance: _provenance, ...rest } = relationship;
  void _provenance;

  return {
    relationship_id: rest.relationship_id,
    type: rest.type,
    metadata: {
      ...rest.metadata,
      updated_at: now,
      status,
    },
    graph_context: rest.graph_context,
    endpoints: rest.endpoints,
    relation: rest.relation,
    editorial: rest.editorial,
    linked_content: {
      relationship_card_ids: rest.linked_content.relationship_card_ids ?? [],
      question_ids: rest.linked_content.question_ids ?? [],
    },
  };
}

function buildDescription(input: BuildLibraryBundleInput): string {
  const title = input.intent.libraryTitle || input.job.name;
  return `${title} — ${input.intent.domain} library generated by StudyBuddy library-creator.`;
}

function collectTags(
  concepts: LibraryBundle["concepts"],
  intent: LibraryCreationIntent
): string[] {
  const tags = new Set<string>(["library-creator", intent.purpose]);
  for (const concept of concepts) {
    for (const tag of concept.metadata.tags) {
      tags.add(tag);
    }
  }
  return [...tags].slice(0, 12);
}
