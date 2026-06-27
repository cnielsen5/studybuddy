/** Wizard state persisted in sessionStorage during library creation. */
export type WizardStage =
  | "intent"
  | "sources"
  | "generation"
  | "review"
  | "done";

export type AudienceLevel =
  | "highschool"
  | "undergrad"
  | "grad"
  | "professional"
  | "self_taught";

export type UsagePurpose = "exam_prep" | "deep_understanding" | "reference";

export type CurriculumMode = "custom" | "catalog" | "logical";

export interface CurriculumChoice {
  mode: CurriculumMode;
  name?: string;
  sourceUrl?: string;
  lensId?: string;
  lensName?: string;
}

export interface IntentDialogueForm {
  purposeStatement: string;
  audienceLevel: AudienceLevel;
  curriculumMode: CurriculumMode;
  curriculumName: string;
  curriculumUrl: string;
  lensQuery: string;
  selectedLensId: string;
  selectedLensName: string;
  scopeNotes: string;
  usagePurpose: UsagePurpose;
}

export interface SourceUpload {
  id: string;
  label: string;
  fileName: string;
}

export interface LibraryReviewState {
  summary: {
    conceptCount: number;
    cardCount: number;
    questionCount: number;
    coveragePercent?: number;
    coverageLabel?: string;
    estimatedStudyHours?: number;
    originNote?: string;
  };
  concepts: Array<{
    id: string;
    title: string;
    sectionPath?: string[];
    cardCount: number;
    questionCount: number;
    status: "clean" | "flagged";
    order: number;
  }>;
  flags: Array<{
    id: string;
    type: "scope_question" | "missing_coverage" | "new_concept_confirmation";
    conceptId?: string;
    title: string;
    body: string;
    sourceHint?: string;
    defaultResolution: string;
    resolution: string;
    primaryAction: string;
    secondaryAction?: string;
  }>;
  lensId?: string;
  lensName?: string;
}

export interface GenerationStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "complete" | "error";
  detail?: string;
}

export interface CreateLibraryDraft {
  stage: WizardStage;
  form?: IntentDialogueForm;
  intent?: Record<string, unknown>;
  sourceText: string;
  webUrls: string[];
  uploads: SourceUpload[];
  selectedCatalogIds: string[];
  review?: LibraryReviewState;
  generationSteps?: GenerationStep[];
}

export const CREATE_LIBRARY_STORAGE_KEY = "socrates.createLibrary.draft";
