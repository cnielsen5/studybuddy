import { buildIntentFromDialogue } from "@lc/intent/buildIntentFromDialogue.js";
import { searchLensCatalog } from "@lc/intent/lensCatalog.js";
import { buildSourceConfiguration } from "@lc/sources/buildSourceConfiguration.js";
import { resolveSourceText } from "@lc/sources/resolveSourceText.js";
import type { SourceConfiguration } from "@lc/types/sourceConfig.js";
import { filterCatalogForDomain } from "@lc/sources/sourceCatalog.js";
import { extractConceptGraphHeuristic } from "@lc/extraction/heuristicConceptExtractor.js";
import { generateCardsQuestionsHeuristic } from "@lc/generation/heuristicCardsQuestionsGenerator.js";
import { ingestText } from "@lc/ingestors/textCore.js";
import { buildLibraryReviewState } from "@lc/pipeline/libraryPreview.js";
import { buildReconcileFlags } from "@lc/pipeline/reconcileFlags.js";
import type { DomainProfile } from "@lc/types/domainProfile.js";
import type { LibraryCreationIntent } from "@lc/types/intent.js";
import type { IntentDialogueAnswers } from "@lc/types/intentDialogue.js";
import type { GenerationStep, LibraryReviewState } from "./types.ts";

const DOMAIN_PROFILES: Record<string, DomainProfile> = {
  anatomy: {
    archetypeId: "anatomy",
    primaryLearningMode: "memorization",
    cardTierWeights: { core: 0.6, extension: 0.2, certification: 0.1, remedial: 0.1 },
    cardTypeWeights: { basic: 0.35, cloze: 0.25, imageOcclusion: 0.4 },
    pedagogicalRoleWeights: {
      recognition: 0.35,
      recall: 0.4,
      application: 0.15,
      integration: 0.1,
    },
    questionDensity: 2,
    relationshipDensity: 0.5,
    prefersDiagnosticQuestions: true,
  },
  mixed: {
    archetypeId: "mixed",
    primaryLearningMode: "mixed",
    cardTierWeights: { core: 0.5, extension: 0.3, certification: 0.1, remedial: 0.1 },
    cardTypeWeights: { basic: 0.4, cloze: 0.3, imageOcclusion: 0.3 },
    pedagogicalRoleWeights: {
      recognition: 0.3,
      recall: 0.35,
      application: 0.2,
      integration: 0.15,
    },
    questionDensity: 1.5,
    relationshipDensity: 0.4,
    prefersDiagnosticQuestions: false,
  },
};

export function formToDialogueAnswers(form: {
  purposeStatement: string;
  audienceLevel: IntentDialogueAnswers["audienceLevel"];
  curriculumMode: "custom" | "catalog" | "logical";
  curriculumName: string;
  curriculumUrl: string;
  selectedLensId: string;
  selectedLensName: string;
  scopeNotes: string;
  usagePurpose: IntentDialogueAnswers["usagePurpose"];
}): IntentDialogueAnswers {
  let curriculum: IntentDialogueAnswers["curriculum"];
  if (form.curriculumMode === "custom") {
    curriculum = {
      mode: "custom",
      name: form.curriculumName || "My curriculum",
      sourceUrl: form.curriculumUrl || undefined,
    };
  } else if (form.curriculumMode === "catalog" && form.selectedLensId) {
    curriculum = {
      mode: "catalog",
      lensId: form.selectedLensId,
      lensName: form.selectedLensName,
    };
  } else {
    curriculum = { mode: "logical" };
  }

  return {
    purposeStatement: form.purposeStatement,
    audienceLevel: form.audienceLevel,
    curriculum,
    scopeNotes: form.scopeNotes || undefined,
    usagePurpose: form.usagePurpose,
  };
}

export function buildIntentFromForm(form: Parameters<typeof formToDialogueAnswers>[0]) {
  return buildIntentFromDialogue(formToDialogueAnswers(form));
}

export { searchLensCatalog, filterCatalogForDomain, buildSourceConfiguration };

function profileForIntent(intent: LibraryCreationIntent): DomainProfile {
  const domain = intent.domain.toLowerCase();
  if (domain.includes("anat") || domain.includes("medicine") || domain.includes("ortho")) {
    return DOMAIN_PROFILES.anatomy;
  }
  return DOMAIN_PROFILES.mixed;
}

const GENERATION_LABELS: GenerationStep[] = [
  { id: "understand_material", label: "Understanding your material…", status: "pending" },
  { id: "map_foundations", label: "Mapping to knowledge foundations…", status: "pending" },
  { id: "build_concept_map", label: "Building your concept map…", status: "pending" },
  { id: "generate_cards", label: "Generating cards and questions…", status: "pending" },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Browser-side generation (heuristic, no spine index).
 * Full spine anchoring runs via `npm run pipeline:create` in library-creator.
 */
export async function runClientGeneration(
  intent: LibraryCreationIntent,
  sourceText: string,
  onProgress: (steps: GenerationStep[]) => void,
  sourceConfiguration?: SourceConfiguration
): Promise<LibraryReviewState> {
  const configuration = sourceConfiguration ?? buildSourceConfiguration(intent);
  const resolvedText = resolveSourceText(sourceText, intent, configuration);
  let steps = GENERATION_LABELS.map((s) => ({ ...s }));
  const set = (id: string, status: GenerationStep["status"], detail?: string) => {
    steps = steps.map((s) => (s.id === id ? { ...s, status, detail } : s));
    onProgress([...steps]);
  };

  set("understand_material", "in_progress");
  await delay(400);
  const parsed = ingestText(resolvedText, { label: intent.libraryTitle });
  set("understand_material", "complete");

  set("map_foundations", "in_progress");
  await delay(300);
  const profile = profileForIntent(intent);
  set("map_foundations", "complete", "Preview mode — run CLI for full spine anchoring");

  set("build_concept_map", "in_progress");
  await delay(500);
  const conceptGraph = extractConceptGraphHeuristic(parsed, intent, profile);
  set("build_concept_map", "complete");

  set("generate_cards", "in_progress");
  await delay(400);
  const concepts = structuredClone(conceptGraph.concepts);
  const cardsQuestions = generateCardsQuestionsHeuristic({
    libraryId: conceptGraph.proposedLibraryId,
    concepts,
    intent,
    domainProfile: profile,
  });
  set("generate_cards", "complete");

  const flags = buildReconcileFlags({
    intent,
    conceptGraph: { ...conceptGraph, concepts },
    placements: [],
    cardsQuestions,
  });

  return buildLibraryReviewState({
    intent,
    conceptGraph: { ...conceptGraph, concepts },
    cardsQuestions,
    flags,
  });
}
