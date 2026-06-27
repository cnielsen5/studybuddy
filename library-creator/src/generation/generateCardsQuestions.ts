import type { ConceptGraphDraft } from "../types/draftConcept.js";
import type { DomainProfile } from "../types/domainProfile.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import type { CardsQuestionsDraft } from "../types/draftCardQuestion.js";
import { generateCardsQuestionsHeuristic } from "./heuristicCardsQuestionsGenerator.js";

export interface GenerateCardsQuestionsOptions {
  useAi?: boolean;
}

export async function generateCardsQuestions(
  conceptGraph: ConceptGraphDraft,
  intent: LibraryCreationIntent,
  domainProfile: DomainProfile,
  options: GenerateCardsQuestionsOptions = {}
): Promise<{ draft: CardsQuestionsDraft; concepts: ConceptGraphDraft["concepts"] }> {
  if (options.useAi) {
    console.warn(
      "AI card/question generation is not implemented yet — using heuristic generator."
    );
  }

  const concepts = structuredClone(conceptGraph.concepts);
  const draft = generateCardsQuestionsHeuristic({
    libraryId: conceptGraph.proposedLibraryId,
    concepts,
    intent,
    domainProfile,
  });

  return { draft, concepts };
}
