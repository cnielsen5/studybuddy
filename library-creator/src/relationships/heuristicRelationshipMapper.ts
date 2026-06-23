import type { ConceptGraphDraft, DraftConcept } from "../types/draftConcept.js";
import type { DomainProfile } from "../types/domainProfile.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import {
  RelationshipsDraftSchema,
  type DraftRelationship,
  type RelationshipsDraft,
} from "../types/draftRelationship.js";

export interface MapRelationshipsInput {
  conceptGraph: ConceptGraphDraft;
  intent: LibraryCreationIntent;
  domainProfile: DomainProfile;
}

export function mapRelationshipsHeuristic(
  input: MapRelationshipsInput
): { draft: RelationshipsDraft; concepts: DraftConcept[] } {
  const now = new Date().toISOString();
  const concepts = structuredClone(input.conceptGraph.concepts);
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const relationships: DraftRelationship[] = [];
  const usedIds = new Set<string>();
  const edgeKeys = new Set<string>();

  const addRelationship = (
    fromId: string,
    toId: string,
    relation: DraftRelationship["relation"],
    options: {
      importance: DraftRelationship["editorial"]["importance"];
      notes: string;
      tags: string[];
      sourceReason?: string;
    }
  ): void => {
    if (fromId === toId) {
      return;
    }
    const key = edgeKey(fromId, toId, relation.relationship_type);
    if (edgeKeys.has(key)) {
      return;
    }
    edgeKeys.add(key);

    const from = byId.get(fromId);
    const to = byId.get(toId);
    if (!from || !to) {
      return;
    }

    relationships.push({
      relationship_id: uniqueRelationshipId(fromId, toId, relation.relationship_type, usedIds),
      type: "relationship",
      metadata: relationshipMetadata(now, options.tags),
      graph_context: {
        library_id: input.conceptGraph.proposedLibraryId,
        domain: from.hierarchy.domain,
        category: from.hierarchy.category,
        subcategory: from.hierarchy.subcategory || to.hierarchy.subcategory,
      },
      endpoints: {
        from_concept_id: fromId,
        to_concept_id: toId,
      },
      relation,
      editorial: {
        importance: options.importance,
        notes: options.notes,
      },
      linked_content: {
        relationship_card_ids: [],
        question_ids: [],
      },
      provenance: {
        generationMethod: "heuristic",
        sourceReason: options.sourceReason,
      },
    });

    syncConceptGraphForEdge(from, to, relation);
  };

  for (const edge of input.conceptGraph.suggestedPrerequisites) {
    const reason =
      edge.reason ?? "Suggested prerequisite from concept graph extraction.";
    addRelationship(edge.from_concept_id, edge.to_concept_id, {
      relationship_type: "prerequisite",
      directionality: "forward",
    }, {
      importance: inferImportance(input.intent, byId.get(edge.to_concept_id)),
      notes: reason,
      tags: ["prerequisite"],
      sourceReason: reason,
    });
  }

  for (const concept of concepts) {
    for (const prereqId of concept.dependency_graph.prerequisites) {
      addRelationship(prereqId, concept.id, {
        relationship_type: "prerequisite",
        directionality: "forward",
      }, {
        importance: inferImportance(input.intent, concept),
        notes: `${concept.content.title} builds on prior concept ${prereqId}.`,
        tags: ["prerequisite"],
        sourceReason: "concept.dependency_graph.prerequisites",
      });
    }
  }

  const semanticBudget = Math.max(
    0,
    Math.floor(concepts.length * input.domainProfile.relationshipDensity)
  );
  if (semanticBudget > 0) {
    addSemanticRelationships(concepts, semanticBudget, addRelationship);
  }

  const draft: RelationshipsDraft = {
    libraryId: input.conceptGraph.proposedLibraryId,
    relationships,
    generationMethod: "heuristic",
    notes: [
      `Mapped ${relationships.length} relationships for ${concepts.length} concepts.`,
      `${relationships.filter((r) => r.relation.relationship_type === "prerequisite").length} prerequisite edges.`,
      `${relationships.filter((r) => r.relation.relationship_type !== "prerequisite").length} semantic edges.`,
      `Domain archetype: ${input.domainProfile.archetypeId}.`,
    ],
  };

  return {
    draft: RelationshipsDraftSchema.parse(draft),
    concepts,
  };
}

function addSemanticRelationships(
  concepts: DraftConcept[],
  budget: number,
  addRelationship: (
    fromId: string,
    toId: string,
    relation: DraftRelationship["relation"],
    options: {
      importance: DraftRelationship["editorial"]["importance"];
      notes: string;
      tags: string[];
      sourceReason?: string;
    }
  ) => void
): void {
  const groups = new Map<string, DraftConcept[]>();
  for (const concept of concepts) {
    const key = `${concept.hierarchy.category}::${concept.hierarchy.subcategory}`;
    const group = groups.get(key) ?? [];
    group.push(concept);
    groups.set(key, group);
  }

  let added = 0;
  for (const group of groups.values()) {
    if (group.length < 2 || added >= budget) {
      continue;
    }
    for (let i = 0; i < group.length - 1 && added < budget; i += 1) {
      const a = group[i];
      const b = group[i + 1];
      addRelationship(a.id, b.id, {
        relationship_type: "reinforces",
        directionality: "bidirectional",
      }, {
        importance: "medium",
        notes: `${a.content.title} and ${b.content.title} reinforce each other within ${a.hierarchy.subcategory}.`,
        tags: ["semantic", "reinforces"],
        sourceReason: "same subcategory cluster",
      });
      added += 1;
    }
  }
}

function syncConceptGraphForEdge(
  from: DraftConcept,
  to: DraftConcept,
  relation: DraftRelationship["relation"]
): void {
  if (
    relation.relationship_type === "prerequisite" &&
    relation.directionality === "forward"
  ) {
    if (!to.dependency_graph.prerequisites.includes(from.id)) {
      to.dependency_graph.prerequisites.push(from.id);
    }
    if (!from.dependency_graph.unlocks.includes(to.id)) {
      from.dependency_graph.unlocks.push(to.id);
    }
    return;
  }

  if (relation.relationship_type === "reinforces") {
    if (!from.dependency_graph.related_concepts.includes(to.id)) {
      from.dependency_graph.related_concepts.push(to.id);
    }
    if (!to.dependency_graph.related_concepts.includes(from.id)) {
      to.dependency_graph.related_concepts.push(from.id);
    }
    for (const concept of [from, to]) {
      const relations = concept.dependency_graph.semantic_relations ?? [];
      if (!relations.includes(relation.relationship_type)) {
        concept.dependency_graph.semantic_relations = [
          ...relations,
          relation.relationship_type,
        ];
      }
    }
  }
}

function inferImportance(
  intent: LibraryCreationIntent,
  concept?: DraftConcept
): DraftRelationship["editorial"]["importance"] {
  if (intent.purpose === "exam_prep") {
    return (concept?.editorial?.high_yield_score ?? 0) >= 8 ? "high" : "medium";
  }
  return "medium";
}

function edgeKey(fromId: string, toId: string, type: string): string {
  return `${fromId}->${toId}:${type}`;
}

function uniqueRelationshipId(
  fromId: string,
  toId: string,
  type: string,
  used: Set<string>
): string {
  const fromSlug = fromId.replace(/^concept_/, "").slice(0, 16);
  const toSlug = toId.replace(/^concept_/, "").slice(0, 16);
  const typeSlug = type === "prerequisite" ? "pre" : type.slice(0, 4);
  let id = `rel_${fromSlug}_to_${toSlug}_${typeSlug}`.replace(/__+/g, "_");
  let n = 2;
  while (used.has(id)) {
    id = `rel_${fromSlug}_to_${toSlug}_${typeSlug}_${n}`;
    n += 1;
  }
  used.add(id);
  return id.slice(0, 64);
}

function relationshipMetadata(now: string, tags: string[]) {
  return {
    created_at: now,
    updated_at: now,
    created_by: "library_creator" as const,
    last_updated_by: "library_creator" as const,
    version: "0.1.0",
    status: "draft" as const,
    tags,
    version_history: [],
  };
}
