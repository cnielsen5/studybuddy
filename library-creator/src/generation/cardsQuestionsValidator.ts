import type {
  CardsQuestionsDraft,
  DraftCard,
  DraftQuestion,
} from "../types/draftCardQuestion.js";
import { CardsQuestionsDraftSchema } from "../types/draftCardQuestion.js";
import type { DraftConcept } from "../types/draftConcept.js";

export interface CardsQuestionsValidationIssue {
  severity: "error" | "warning";
  entityId?: string;
  message: string;
}

export interface CardsQuestionsValidationResult {
  valid: boolean;
  issues: CardsQuestionsValidationIssue[];
}

export function validateCardsQuestionsDraft(
  draft: CardsQuestionsDraft,
  concepts: DraftConcept[]
): CardsQuestionsValidationResult {
  CardsQuestionsDraftSchema.parse(draft);

  const issues: CardsQuestionsValidationIssue[] = [];
  const conceptIds = new Set(concepts.map((c) => c.id));
  const cardIds = new Set<string>();
  const questionIds = new Set<string>();

  for (const card of draft.cards) {
    validateCard(card, conceptIds, cardIds, issues);
  }

  for (const question of draft.questions) {
    validateQuestion(question, conceptIds, cardIds, questionIds, issues);
  }

  for (const card of draft.cards) {
    for (const qId of card.relations.related_question_ids ?? []) {
      if (!questionIds.has(qId)) {
        issues.push({
          severity: "error",
          entityId: card.id,
          message: `Card references missing question ${qId}`,
        });
      }
    }
  }

  for (const concept of concepts) {
    const linkedCards = draft.cards.filter(
      (c) => c.relations.concept_id === concept.id
    );
    const linkedQuestions = draft.questions.filter((q) =>
      q.relations.concept_ids.includes(concept.id)
    );

    if (linkedCards.length === 0) {
      issues.push({
        severity: "error",
        entityId: concept.id,
        message: `Concept ${concept.id} has no generated cards`,
      });
    }

    if (linkedQuestions.length === 0) {
      issues.push({
        severity: "warning",
        entityId: concept.id,
        message: `Concept ${concept.id} has no generated questions`,
      });
    }
  }

  if (draft.cards.length === 0) {
    issues.push({ severity: "error", message: "No cards generated" });
  }

  return {
    valid: issues.every((i) => i.severity !== "error"),
    issues,
  };
}

function validateCard(
  card: DraftCard,
  conceptIds: Set<string>,
  cardIds: Set<string>,
  issues: CardsQuestionsValidationIssue[]
): void {
  if (cardIds.has(card.id)) {
    issues.push({
      severity: "error",
      entityId: card.id,
      message: `Duplicate card id ${card.id}`,
    });
  }
  cardIds.add(card.id);

  if (!conceptIds.has(card.relations.concept_id)) {
    issues.push({
      severity: "error",
      entityId: card.id,
      message: `Card references unknown concept ${card.relations.concept_id}`,
    });
  }

  if (card.config.card_type === "cloze") {
    if (!card.content.cloze_data?.cloze_fields.length) {
      issues.push({
        severity: "error",
        entityId: card.id,
        message: "Cloze card missing cloze_fields",
      });
    }
  } else if (card.content.cloze_data) {
    issues.push({
      severity: "error",
      entityId: card.id,
      message: "Non-cloze card must not include cloze_data",
    });
  }

  for (const qId of card.relations.related_question_ids ?? []) {
    if (!qId.startsWith("q_")) {
      issues.push({
        severity: "error",
        entityId: card.id,
        message: `Invalid related question id ${qId}`,
      });
    }
  }
}

function validateQuestion(
  question: DraftQuestion,
  conceptIds: Set<string>,
  cardIds: Set<string>,
  questionIds: Set<string>,
  issues: CardsQuestionsValidationIssue[]
): void {
  if (questionIds.has(question.id)) {
    issues.push({
      severity: "error",
      entityId: question.id,
      message: `Duplicate question id ${question.id}`,
    });
  }
  questionIds.add(question.id);

  for (const conceptId of question.relations.concept_ids) {
    if (!conceptIds.has(conceptId)) {
      issues.push({
        severity: "error",
        entityId: question.id,
        message: `Question references unknown concept ${conceptId}`,
      });
    }
  }

  const optionIds = new Set(question.content.options.map((o) => o.id));
  if (!optionIds.has(question.content.correct_option_id)) {
    issues.push({
      severity: "error",
      entityId: question.id,
      message: "correct_option_id not found in options",
    });
  }

  for (const cardId of question.relations.related_card_ids ?? []) {
    if (!cardIds.has(cardId)) {
      issues.push({
        severity: "warning",
        entityId: question.id,
        message: `Question references unknown card ${cardId}`,
      });
    }
  }
}

export function formatCardsQuestionsSummary(
  draft: CardsQuestionsDraft,
  concepts: DraftConcept[]
): string {
  const cardsByConcept = new Map<string, number>();
  const questionsByConcept = new Map<string, number>();

  for (const card of draft.cards) {
    cardsByConcept.set(
      card.relations.concept_id,
      (cardsByConcept.get(card.relations.concept_id) ?? 0) + 1
    );
  }
  for (const question of draft.questions) {
    for (const conceptId of question.relations.concept_ids) {
      questionsByConcept.set(
        conceptId,
        (questionsByConcept.get(conceptId) ?? 0) + 1
      );
    }
  }

  const lines = [
    `Library id: ${draft.libraryId}`,
    `Cards: ${draft.cards.length}`,
    `Questions: ${draft.questions.length}`,
    `Concepts covered: ${concepts.length}`,
    `Method: ${draft.generationMethod}`,
    "",
  ];

  for (const concept of concepts) {
    lines.push(
      `- ${concept.id}  ${concept.content.title}  (${cardsByConcept.get(concept.id) ?? 0} cards, ${questionsByConcept.get(concept.id) ?? 0} questions)`
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
