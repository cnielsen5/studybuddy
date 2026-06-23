import type { DraftConcept } from "../types/draftConcept.js";
import type { DomainProfile } from "../types/domainProfile.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import {
  CardsQuestionsDraftSchema,
  type CardsQuestionsDraft,
  type DraftCard,
  type DraftQuestion,
} from "../types/draftCardQuestion.js";

export interface GenerateCardsQuestionsInput {
  libraryId: string;
  concepts: DraftConcept[];
  intent: LibraryCreationIntent;
  domainProfile: DomainProfile;
}

export function generateCardsQuestionsHeuristic(
  input: GenerateCardsQuestionsInput
): CardsQuestionsDraft {
  const now = new Date().toISOString();
  const cards: DraftCard[] = [];
  const questions: DraftQuestion[] = [];
  const usedCardIds = new Set<string>();
  const usedQuestionIds = new Set<string>();

  for (const concept of input.concepts) {
    const conceptSlug = conceptSlugFromId(concept.id);
    const cardIds: string[] = [];
    const questionIds: string[] = [];

    const recallCard = buildRecallCard(concept, conceptSlug, now, usedCardIds);
    cards.push(recallCard);
    cardIds.push(recallCard.id);

    if (input.domainProfile.cardTypeWeights.cloze >= 0.2) {
      const clozeCard = buildClozeCard(concept, conceptSlug, now, usedCardIds);
      if (clozeCard) {
        cards.push(clozeCard);
        cardIds.push(clozeCard.id);
      }
    }

    if (input.domainProfile.cardTierWeights.extension >= 0.15) {
      const appCard = buildApplicationCard(concept, conceptSlug, now, usedCardIds);
      cards.push(appCard);
      cardIds.push(appCard.id);
    }

    const questionCount = Math.min(
      3,
      Math.max(1, Math.round(input.domainProfile.questionDensity))
    );

    for (let i = 0; i < questionCount; i += 1) {
      const usageRole = pickQuestionRole(
        i,
        input.domainProfile,
        input.intent.purpose
      );
      const question = buildQuestion(
        concept,
        conceptSlug,
        input.concepts,
        usageRole,
        now,
        usedQuestionIds,
        i + 1,
        i === 0 ? recallCard.id : undefined
      );
      questions.push(question);
      questionIds.push(question.id);
    }

    if (questionIds.length > 0) {
      recallCard.relations.related_question_ids = [questionIds[0]];
    }

    concept.linked_content.card_ids = cardIds;
    concept.linked_content.question_ids = questionIds;
  }

  const draft: CardsQuestionsDraft = {
    libraryId: input.libraryId,
    cards,
    questions,
    generationMethod: "heuristic",
    notes: [
      `Generated ${cards.length} cards and ${questions.length} questions for ${input.concepts.length} concepts.`,
      `Domain archetype: ${input.domainProfile.archetypeId}.`,
      `Question density target: ${input.domainProfile.questionDensity} per concept.`,
    ],
  };

  return CardsQuestionsDraftSchema.parse(draft);
}

function conceptSlugFromId(conceptId: string): string {
  return conceptId.replace(/^concept_/, "").slice(0, 32);
}

function uniqueCardId(base: string, used: Set<string>): string {
  let id = `card_${base}`;
  let n = 2;
  while (used.has(id)) {
    id = `card_${base}_${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

function uniqueQuestionId(base: string, used: Set<string>): string {
  let id = `q_${base}`;
  let n = 2;
  while (used.has(id)) {
    id = `q_${base}_${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

function buildRecallCard(
  concept: DraftConcept,
  conceptSlug: string,
  now: string,
  used: Set<string>
): DraftCard {
  const title = concept.content.title;
  return {
    id: uniqueCardId(`${conceptSlug}_def`, used),
    type: "card",
    relations: { concept_id: concept.id },
    config: {
      card_type: "basic",
      pedagogical_role: "recall",
      card_tier: "core",
    },
    content: {
      front: `What is ${stripLeadingVerb(title)}?`,
      back: concept.content.definition,
      cloze_data: null,
    },
    media: [],
    editorial: {
      difficulty: mapCardDifficulty(concept),
      tags: ["core", "recall"],
    },
    metadata: draftMetadata(now),
    provenance: {
      conceptId: concept.id,
      generationMethod: "heuristic",
      sourceConceptTitle: title,
    },
  };
}

function buildClozeCard(
  concept: DraftConcept,
  conceptSlug: string,
  now: string,
  used: Set<string>
): DraftCard | null {
  const target = pickClozeTarget(concept.content.definition);
  if (!target) {
    return null;
  }

  return {
    id: uniqueCardId(`${conceptSlug}_cloze`, used),
    type: "card",
    relations: { concept_id: concept.id },
    config: {
      card_type: "cloze",
      pedagogical_role: "recall",
      card_tier: "core",
    },
    content: {
      front: "Fill in the blank.",
      back: target.template,
      cloze_data: {
        template_text: target.template,
        cloze_fields: [
          {
            field_id: "cloze_1",
            answer: target.answer,
            hint: "Key term",
          },
        ],
      },
    },
    media: [],
    editorial: {
      difficulty: mapCardDifficulty(concept),
      tags: ["core", "cloze"],
    },
    metadata: draftMetadata(now),
    provenance: {
      conceptId: concept.id,
      generationMethod: "heuristic",
      sourceConceptTitle: concept.content.title,
    },
  };
}

function buildApplicationCard(
  concept: DraftConcept,
  conceptSlug: string,
  now: string,
  used: Set<string>
): DraftCard {
  const summary = concept.content.summary || concept.content.definition;
  return {
    id: uniqueCardId(`${conceptSlug}_app`, used),
    type: "card",
    relations: { concept_id: concept.id },
    config: {
      card_type: "basic",
      pedagogical_role: "application",
      card_tier: "extension",
    },
    content: {
      front: `How does ${concept.content.title} apply in practice?`,
      back: summary,
      cloze_data: null,
    },
    media: [],
    editorial: {
      difficulty:
        concept.editorial?.difficulty === "advanced" ? "hard" : "medium",
      tags: ["extension", "application"],
    },
    metadata: draftMetadata(now),
    provenance: {
      conceptId: concept.id,
      generationMethod: "heuristic",
      sourceConceptTitle: concept.content.title,
    },
  };
}

function buildQuestion(
  concept: DraftConcept,
  conceptSlug: string,
  allConcepts: DraftConcept[],
  usageRole: DraftQuestion["classification"]["usage_role"],
  now: string,
  used: Set<string>,
  index: number,
  relatedCardId?: string
): DraftQuestion {
  const distractors = pickDistractors(concept, allConcepts, 3);
  const { options, correctOptionId } = buildMcqOptions(
    concept.content.definition,
    distractors
  );
  const roleSuffix = usageRole.replace(/_/g, "").slice(0, 6);
  const id = uniqueQuestionId(
    `${conceptSlug}_${roleSuffix}_${String(index).padStart(2, "0")}`,
    used
  );

  const stem =
    usageRole === "diagnostic"
      ? `Which answer best reflects a misunderstanding of ${concept.content.title}?`
      : usageRole === "establishment"
        ? `Which statement best introduces ${concept.content.title}?`
        : `Which statement best describes ${concept.content.title}?`;

  const distractorExplanations: Record<string, string> = {};
  for (const option of options) {
    if (option.id !== correctOptionId) {
      distractorExplanations[option.id] =
        "This option does not match the source definition.";
    }
  }

  return {
    id,
    type: "question",
    relations: {
      concept_ids: [concept.id],
      related_card_ids: relatedCardId ? [relatedCardId] : [],
    },
    source: {
      origin: "ai_generated",
      provider: "library_creator",
      subscription_required: false,
    },
    classification: {
      question_type: "mcq",
      usage_role: usageRole,
      cognitive_level: inferCognitiveLevel(concept.hierarchy.domain),
    },
    content: {
      stem,
      options,
      correct_option_id: correctOptionId,
    },
    explanations: {
      general: concept.content.definition,
      distractors: distractorExplanations,
    },
    editorial: {
      difficulty: mapCardDifficulty(concept),
      tags: [usageRole, "generated"],
    },
    media: [],
    references: [],
    metadata: draftMetadata(now),
    provenance: {
      conceptId: concept.id,
      generationMethod: "heuristic",
    },
  };
}

function pickQuestionRole(
  index: number,
  profile: DomainProfile,
  purpose: LibraryCreationIntent["purpose"]
): DraftQuestion["classification"]["usage_role"] {
  if (index === 0) {
    return "generic";
  }
  if (index === 1) {
    if (profile.prefersDiagnosticQuestions || purpose === "exam_prep") {
      return "diagnostic";
    }
    return "establishment";
  }
  return purpose === "exam_prep" ? "targeted" : "generic";
}

function pickDistractors(
  concept: DraftConcept,
  allConcepts: DraftConcept[],
  count: number
): string[] {
  const pool = allConcepts
    .filter((c) => c.id !== concept.id)
    .map((c) => c.content.definition)
    .filter((def) => def.trim().length > 10);

  const picked: string[] = [];
  for (const def of pool) {
    if (picked.length >= count) {
      break;
    }
    if (!picked.includes(def)) {
      picked.push(def.slice(0, 120));
    }
  }

  while (picked.length < count) {
    picked.push(
      [
        "This concept is unrelated to the learning objective.",
        "The statement reverses cause and effect.",
        "This describes a different topic entirely.",
      ][picked.length] ?? "None of the above applies."
    );
  }

  return picked.slice(0, count);
}

function buildMcqOptions(
  correct: string,
  distractors: string[]
): {
  options: DraftQuestion["content"]["options"];
  correctOptionId: DraftQuestion["content"]["correct_option_id"];
} {
  const labels = ["A", "B", "C", "D"] as const;
  const texts = [correct.slice(0, 160), ...distractors.map((d) => d.slice(0, 160))];
  const shuffled = shuffleOptions(texts);
  const correctIndex = shuffled.indexOf(texts[0]);
  const options = shuffled.map((text, index) => ({
    id: `opt_${labels[index]}`,
    text,
  }));
  return {
    options,
    correctOptionId: options[correctIndex].id,
  };
}

function shuffleOptions(texts: string[]): string[] {
  const copy = [...texts];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickClozeTarget(
  definition: string
): { template: string; answer: string } | null {
  const trimmed = definition.trim();
  const termMatch = trimmed.match(
    /\b([A-Z][a-z]+(?:\s+[a-z]+){0,3})\b/
  );
  if (termMatch && termMatch[1].length >= 4) {
    const answer = termMatch[1];
    const template = trimmed.replace(answer, "[[cloze_1]]");
    if (template.includes("[[cloze_1]]")) {
      return { template, answer };
    }
  }

  const words = trimmed.split(/\s+/).filter((w) => w.length >= 5);
  const answer = words[Math.floor(words.length / 2)] ?? words[0];
  if (!answer || answer.length < 4) {
    return null;
  }
  const template = trimmed.replace(answer, "[[cloze_1]]");
  if (!template.includes("[[cloze_1]]")) {
    return null;
  }
  return { template, answer: answer.replace(/[.,;:!?]+$/, "") };
}

function stripLeadingVerb(title: string): string {
  return title.replace(/^(define|describe|distinguish|identify|explain)\s+/i, "");
}

function mapCardDifficulty(
  concept: DraftConcept
): "easy" | "medium" | "hard" {
  switch (concept.editorial?.difficulty) {
    case "advanced":
      return "hard";
    case "intermediate":
      return "medium";
    default:
      return "easy";
  }
}

function inferCognitiveLevel(
  domain: string
): DraftQuestion["classification"]["cognitive_level"] {
  const lower = domain.toLowerCase();
  if (lower.includes("anatomy") || lower.includes("physiology")) {
    return "mechanism";
  }
  if (lower.includes("law") || lower.includes("legal")) {
    return "management";
  }
  if (lower.includes("medicine") || lower.includes("clinical")) {
    return "diagnosis";
  }
  return "mechanism";
}

function draftMetadata(now: string) {
  return {
    created_at: now,
    updated_at: now,
    created_by: "library_creator" as const,
    status: "draft" as const,
    version: "0.1.0",
  };
}
