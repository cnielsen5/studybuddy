import type { ClozeData } from "./cloze";

export interface LibraryManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  domain: string;
  status: string;
  tags: string[];
}

export interface LibraryConcept {
  id: string;
  type: "concept";
  content: { title: string; definition: string; summary: string };
  editorial: { difficulty: string; high_yield_score: number };
  hierarchy: { topic: string; subtopic: string };
  dependency_graph: {
    prerequisites: string[];
    unlocks: string[];
    related_concepts: string[];
  };
  linked_content: { card_ids: string[]; question_ids: string[] };
}

export interface LibraryRelationship {
  relationship_id: string;
  endpoints: { from_concept_id: string; to_concept_id: string };
  relation: { relationship_type: string; directionality: string };
  editorial: { importance: string; notes: string };
}

export interface LibraryCard {
  id: string;
  type: "card" | "relationship_card";
  relations: {
    concept_id?: string;
    relationship_id?: string;
    from_concept_id?: string;
    to_concept_id?: string;
  };
  config: { card_type: string; pedagogical_role: string };
  content: {
    front: string;
    back: string;
    cloze_data?: ClozeData | null;
  };
  editorial?: { difficulty: string; tags: string[] };
  metadata?: { difficulty?: string; tags?: string[] };
}

export interface LibraryQuestion {
  id: string;
  content: { stem: string; options: Array<{ id: string; text: string }>; correct_option_id: string };
  classification: { usage_role: string; question_type: string };
  relations: { concept_ids: string[] };
  editorial: { difficulty: string };
}

export interface LibraryBundle {
  manifest: LibraryManifest;
  concepts: LibraryConcept[];
  relationships: LibraryRelationship[];
  cards: LibraryCard[];
  questions: LibraryQuestion[];
}

export interface StudyCard {
  id: string;
  conceptId: string;
  front: string;
  back: string;
  cardType: string;
  role: string;
}

export function toStudyCards(bundle: LibraryBundle): StudyCard[] {
  return bundle.cards.map((card) => {
    const conceptId =
      card.relations.concept_id ??
      card.relations.from_concept_id ??
      card.relations.to_concept_id ??
      "unknown";
    return {
      id: card.id,
      conceptId,
      front: card.content.front,
      back: card.content.back,
      cardType: card.config.card_type,
      role: card.config.pedagogical_role,
      clozeData: card.content.cloze_data ?? null,
    };
  });
}

export function getConceptTitle(bundle: LibraryBundle, conceptId: string): string {
  return bundle.concepts.find((c) => c.id === conceptId)?.content.title ?? conceptId;
}

export function getConceptMapEdges(bundle: LibraryBundle) {
  const edges: Array<{
    id: string;
    from: string;
    to: string;
    type: string;
    label: string;
  }> = [];

  for (const rel of bundle.relationships) {
    edges.push({
      id: rel.relationship_id,
      from: rel.endpoints.from_concept_id,
      to: rel.endpoints.to_concept_id,
      type: rel.relation.relationship_type,
      label: rel.relation.relationship_type,
    });
  }

  for (const concept of bundle.concepts) {
    for (const prereq of concept.dependency_graph.prerequisites) {
      const id = `dep_${prereq}_to_${concept.id}`;
      if (!edges.some((e) => e.from === prereq && e.to === concept.id && e.type === "prerequisite")) {
        edges.push({ id, from: prereq, to: concept.id, type: "prerequisite", label: "prerequisite" });
      }
    }
  }

  return edges;
}
