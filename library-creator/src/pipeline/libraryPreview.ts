import type { ConceptGraphDraft, DraftConcept } from "../types/draftConcept.js";
import type { CardsQuestionsDraft } from "../types/draftCardQuestion.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import type { CurriculumLens } from "../types/curriculumLens.js";
import type {
  ConceptPreviewNode,
  LibraryPreviewSummary,
  LibraryReviewState,
  ReconcileFlag,
} from "../types/reconcile.js";

function cardCountForConcept(
  conceptId: string,
  cardsQuestions?: CardsQuestionsDraft
): { cards: number; questions: number } {
  if (!cardsQuestions) return { cards: 0, questions: 0 };
  const cards = cardsQuestions.cards.filter(
    (c) => c.relations.concept_id === conceptId
  ).length;
  const questions = cardsQuestions.questions.filter((q) =>
    q.relations.concept_ids.includes(conceptId)
  ).length;
  return { cards, questions };
}

function estimateStudyHours(cardCount: number, questionCount: number): number {
  const minutes = cardCount * 1.5 + questionCount * 2;
  return Math.max(1, Math.round((minutes / 60) * 10) / 10);
}

export function buildLibraryPreviewSummary(
  conceptGraph: ConceptGraphDraft,
  cardsQuestions: CardsQuestionsDraft | undefined,
  _intent: LibraryCreationIntent,
  lens?: CurriculumLens,
  originNote?: string
): LibraryPreviewSummary {
  const cardCount = cardsQuestions?.cards.length ?? 0;
  const questionCount = cardsQuestions?.questions.length ?? 0;

  let coveragePercent: number | undefined;
  let coverageLabel: string | undefined;

  if (lens) {
    const mappedIds = new Set(lens.concept_mappings.map((m) => m.spine_concept_id));
    const covered = conceptGraph.concepts.filter((c) =>
      c.anchor_concept_id ? mappedIds.has(c.anchor_concept_id) : false
    ).length;
    const totalMapped = mappedIds.size || 1;
    coveragePercent = Math.min(100, Math.round((covered / totalMapped) * 100));
    coverageLabel = lens.name.replace(/Board Certification.*$/, "").trim();
  }

  return {
    conceptCount: conceptGraph.concepts.length,
    cardCount,
    questionCount,
    coveragePercent,
    coverageLabel,
    estimatedStudyHours: estimateStudyHours(cardCount, questionCount),
    originNote,
  };
}

export function buildConceptPreviewNodes(
  conceptGraph: ConceptGraphDraft,
  flags: ReconcileFlag[],
  cardsQuestions: CardsQuestionsDraft | undefined,
  _intent: LibraryCreationIntent,
  lens?: CurriculumLens
): ConceptPreviewNode[] {
  const flaggedIds = new Set(
    flags.filter((f) => f.resolution === "pending").map((f) => f.conceptId).filter(Boolean)
  );

  if (lens) {
    const byAnchor = new Map<string, DraftConcept>();
    for (const c of conceptGraph.concepts) {
      if (c.anchor_concept_id) byAnchor.set(c.anchor_concept_id, c);
    }

    const nodes: ConceptPreviewNode[] = [];
    let order = 0;

    for (const section of lens.sections.sort((a, b) => a.order - b.order)) {
      const mappings = lens.concept_mappings
        .filter((m) => m.section_id === section.id)
        .sort(
          (a, b) =>
            a.lens_specific.order_in_section - b.lens_specific.order_in_section
        );

      for (const mapping of mappings) {
        const concept = byAnchor.get(mapping.spine_concept_id);
        if (!concept) continue;
        const counts = cardCountForConcept(concept.id, cardsQuestions);
        nodes.push({
          id: concept.id,
          title: concept.content.title,
          sectionPath: [section.title],
          cardCount: counts.cards,
          questionCount: counts.questions,
          status: flaggedIds.has(concept.id) ? "flagged" : "clean",
          order: order++,
        });
      }
    }

    const placed = new Set(nodes.map((n) => n.id));
    for (const concept of conceptGraph.concepts) {
      if (placed.has(concept.id)) continue;
      const counts = cardCountForConcept(concept.id, cardsQuestions);
      nodes.push({
        id: concept.id,
        title: concept.content.title,
        sectionPath: ["Additional topics"],
        cardCount: counts.cards,
        questionCount: counts.questions,
        status: flaggedIds.has(concept.id) ? "flagged" : "clean",
        order: order++,
      });
    }

    return nodes;
  }

  return conceptGraph.concepts.map((concept, order) => {
    const counts = cardCountForConcept(concept.id, cardsQuestions);
    return {
      id: concept.id,
      title: concept.content.title,
      cardCount: counts.cards,
      questionCount: counts.questions,
      status: flaggedIds.has(concept.id) ? ("flagged" as const) : ("clean" as const),
      order,
    };
  });
}

export function buildLibraryReviewState(input: {
  intent: LibraryCreationIntent;
  conceptGraph: ConceptGraphDraft;
  cardsQuestions?: CardsQuestionsDraft;
  flags: ReconcileFlag[];
  lens?: CurriculumLens;
  /** Friendly framing shown when concepts were drawn from the existing spine. */
  originNote?: string;
}): LibraryReviewState {
  const { intent, conceptGraph, cardsQuestions, flags, lens, originNote } = input;

  return {
    summary: buildLibraryPreviewSummary(conceptGraph, cardsQuestions, intent, lens, originNote),
    concepts: buildConceptPreviewNodes(
      conceptGraph,
      flags,
      cardsQuestions,
      intent,
      lens
    ),
    flags,
    lensId: lens?.id,
    lensName: lens?.name,
  };
}
