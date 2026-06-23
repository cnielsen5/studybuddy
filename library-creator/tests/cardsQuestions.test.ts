import { generateCardsQuestionsHeuristic } from "../src/generation/heuristicCardsQuestionsGenerator.js";
import { validateCardsQuestionsDraft } from "../src/generation/cardsQuestionsValidator.js";
import { extractConceptGraphHeuristic } from "../src/extraction/heuristicConceptExtractor.js";
import { loadDomainProfile } from "../src/profiles/loadProfile.js";
import type { LibraryCreationIntent } from "../src/types/intent.js";
import { normalizeParsedSection } from "../src/types/parsedSource.js";

const baseIntent: LibraryCreationIntent = {
  libraryTitle: "Anatomy Chapter 1",
  domain: "Anatomy and Physiology",
  purpose: "exam_prep",
  audience: {
    level: "undergrad",
    priorKnowledge: ["basic biology"],
    targetDepth: "working",
  },
  scopeBoundaries: [],
  externalAugmentationAllowed: false,
  similarityThreshold: 0.9,
};

describe("generateCardsQuestionsHeuristic", () => {
  it("generates linked cards and questions for each concept", () => {
    const conceptGraph = extractConceptGraphHeuristic(
      {
        sourceType: "website",
        sections: [
          normalizeParsedSection({
            title: "Define homeostasis",
            body: "Define homeostasis and explain its importance to normal human functioning.",
            sequence: 1,
            level: 0,
            blockType: "objective_item",
            structuralHeadingTrail: ["Introduction"],
          }),
          normalizeParsedSection({
            title: "Feedback loops",
            body: "Feedback loops regulate homeostasis through sensors, control centers, and effectors.",
            sequence: 2,
            level: 0,
            blockType: "objective_item",
            structuralHeadingTrail: ["Introduction"],
          }),
        ],
        rawText: "",
      },
      baseIntent,
      loadDomainProfile("anatomy")
    );

    const profile = loadDomainProfile("anatomy");
    const concepts = structuredClone(conceptGraph.concepts);
    const draft = generateCardsQuestionsHeuristic({
      libraryId: conceptGraph.proposedLibraryId,
      concepts,
      intent: baseIntent,
      domainProfile: profile,
    });

    expect(draft.cards.length).toBeGreaterThanOrEqual(conceptGraph.concepts.length);
    expect(draft.questions.length).toBeGreaterThanOrEqual(
      conceptGraph.concepts.length
    );

    for (const concept of concepts) {
      expect(concept.linked_content.card_ids.length).toBeGreaterThan(0);
      expect(concept.linked_content.question_ids.length).toBeGreaterThan(0);
    }

    const validation = validateCardsQuestionsDraft(draft, concepts);
    expect(validation.valid).toBe(true);
  });

  it("creates valid cloze cards when cloze weight is enabled", () => {
    const conceptGraph = extractConceptGraphHeuristic(
      {
        sourceType: "text",
        sections: [
          normalizeParsedSection({
            title: "Homeostasis",
            body: "Homeostasis is the maintenance of stable internal conditions in the body.",
            sequence: 1,
            level: 0,
            blockType: "paragraph",
            structuralHeadingTrail: [],
          }),
        ],
        rawText: "",
      },
      baseIntent,
      loadDomainProfile("anatomy")
    );

    const concepts = structuredClone(conceptGraph.concepts);
    const draft = generateCardsQuestionsHeuristic({
      libraryId: conceptGraph.proposedLibraryId,
      concepts,
      intent: baseIntent,
      domainProfile: loadDomainProfile("anatomy"),
    });

    const clozeCards = draft.cards.filter((c) => c.config.card_type === "cloze");
    expect(clozeCards.length).toBeGreaterThan(0);
    expect(clozeCards[0].content.cloze_data?.cloze_fields[0]?.answer).toBeTruthy();
  });
});
