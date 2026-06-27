import type { IntentDialogueAnswers } from "../types/intentDialogue.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import { buildIntentFromDialogue } from "../intent/buildIntentFromDialogue.js";
import { searchLensCatalog, LENS_CATALOG, getLensCatalogEntry } from "../intent/lensCatalog.js";
import { buildSourceConfiguration } from "../sources/buildSourceConfiguration.js";
import { resolveSourceText } from "../sources/resolveSourceText.js";
import {
  CURATED_SOURCE_CATALOG,
  filterCatalogForDomain,
  getCuratedSource,
} from "../sources/sourceCatalog.js";
import type { SourceConfiguration } from "../types/sourceConfig.js";
import type {
  LibraryReviewState,
  ReconcileFlag,
  ConceptPreviewNode,
  LibraryPreviewSummary,
  GenerationProgressStep,
} from "../types/reconcile.js";
import type { IntentDialogueAnswers as DialogueAnswers } from "../types/intentDialogue.js";

export {
  buildIntentFromDialogue,
  searchLensCatalog,
  LENS_CATALOG,
  getLensCatalogEntry,
  buildSourceConfiguration,
  resolveSourceText,
  CURATED_SOURCE_CATALOG,
  filterCatalogForDomain,
  getCuratedSource,
};

export type {
  LibraryCreationIntent,
  IntentDialogueAnswers,
  DialogueAnswers,
  SourceConfiguration,
  LibraryReviewState,
  ReconcileFlag,
  ConceptPreviewNode,
  LibraryPreviewSummary,
  GenerationProgressStep,
};

export type { CurriculumChoice } from "../types/intentDialogue.js";
