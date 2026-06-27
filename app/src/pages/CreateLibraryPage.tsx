import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IntentDialogueStep } from "../components/libraryCreation/IntentDialogueStep.tsx";
import { SourceConfigStep } from "../components/libraryCreation/SourceConfigStep.tsx";
import { GenerationProgressStep } from "../components/libraryCreation/GenerationProgressStep.tsx";
import { LibraryReviewStep } from "../components/libraryCreation/LibraryReviewStep.tsx";
import { useAuth } from "../lib/auth.tsx";
import { buildIntentFromForm } from "../lib/libraryCreation/pipeline.ts";
import { buildSourceConfiguration } from "@lc/sources/buildSourceConfiguration.js";
import {
  canUseCloudLibraryGeneration,
  createLibraryJobId,
  runLibraryGeneration,
} from "../lib/libraryCreation/generation.ts";
import type { LibraryCreationIntent } from "@lc/types/intent.js";
import {
  CREATE_LIBRARY_STORAGE_KEY,
  type CreateLibraryDraft,
  type GenerationStep,
  type IntentDialogueForm,
} from "../lib/libraryCreation/types.ts";
import { formatCallableError } from "../lib/libraryCreation/errors.ts";

const DEFAULT_FORM: IntentDialogueForm = {
  purposeStatement: "",
  audienceLevel: "undergrad",
  curriculumMode: "logical",
  curriculumName: "",
  curriculumUrl: "",
  lensQuery: "ABOS",
  selectedLensId: "lens_abos_orthopaedic_2025",
  selectedLensName: "ABOS Orthopaedic Surgery Board Certification 2025",
  scopeNotes: "",
  usagePurpose: "exam_prep",
};

function loadDraft(): CreateLibraryDraft {
  try {
    const raw = sessionStorage.getItem(CREATE_LIBRARY_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CreateLibraryDraft;
  } catch {
    /* ignore */
  }
  return {
    stage: "intent",
    sourceText: "",
    webUrls: [],
    uploads: [],
    selectedCatalogIds: [],
  };
}

export function CreateLibraryPage() {
  const { user, configured } = useAuth();
  const [draft, setDraft] = useState<CreateLibraryDraft>(loadDraft);
  const [intent, setIntent] = useState<LibraryCreationIntent | null>(null);
  const [form, setForm] = useState<IntentDialogueForm>(
    () => loadDraft().form ?? DEFAULT_FORM
  );
  const [genSteps, setGenSteps] = useState<GenerationStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<"cloud" | "client" | null>(
    null
  );
  const [cloudJobId, setCloudJobId] = useState<string | null>(null);

  const persist = useCallback((next: CreateLibraryDraft) => {
    setDraft(next);
    sessionStorage.setItem(CREATE_LIBRARY_STORAGE_KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    if (draft.intent) {
      setIntent(draft.intent as unknown as LibraryCreationIntent);
    }
  }, [draft.intent]);

  async function runGeneration(
    nextIntent: LibraryCreationIntent,
    sourceText: string,
    selectedCatalogIds: string[]
  ) {
    const jobId = createLibraryJobId();
    persist({
      ...draft,
      stage: "generation",
      intent: nextIntent as unknown as Record<string, unknown>,
      sourceText,
    });
    setError(null);
    setGenSteps([]);
    setCloudJobId(jobId);

    const useCloud = configured && user && canUseCloudLibraryGeneration();

    if (useCloud && !user) {
      setError("Sign in to run full library generation with spine anchoring.");
      persist({ ...draft, stage: "sources" });
      return;
    }

    try {
      const intentForGeneration = form.purposeStatement.trim()
        ? buildIntentFromForm(form)
        : nextIntent;

      const sourceConfiguration = buildSourceConfiguration(intentForGeneration, {
        selectedCatalogIds,
      });

      const result = await runLibraryGeneration({
        uid: user?.uid ?? "anonymous",
        jobId,
        intent: intentForGeneration,
        sourceText,
        sourceConfiguration,
        onProgress: setGenSteps,
      });

      setGenerationMode(result.mode);
      persist({
        ...draft,
        stage: "review",
        intent: intentForGeneration as unknown as Record<string, unknown>,
        sourceText,
        review: result.review,
        generationSteps: genSteps,
      });
      setDraft((d) => ({
        ...d,
        stage: "review",
        review: result.review,
      }));
    } catch (err) {
      setError(formatCallableError(err));
      persist({ ...draft, stage: "sources" });
    }
  }

  return (
    <div className="page create-library-page">
      <header className="page-header row">
        <div>
          <h1>Create a library</h1>
          <p className="subtitle">Like talking to an expert librarian — we handle the rest.</p>
        </div>
        <Link to="/" className="btn secondary">
          Home
        </Link>
      </header>

      {!user && configured && (
        <div className="banner banner-warn">
          <p>
            Sign in from Home to run full generation with universal spine anchoring. Without
            sign-in, a local preview runs in your browser.
          </p>
        </div>
      )}

      <nav className="wizard-progress" aria-label="Creation progress">
        {(["intent", "sources", "generation", "review"] as const).map((step, i) => (
          <span
            key={step}
            className={
              draft.stage === step
                ? "wizard-step active"
                : ["intent", "sources", "generation", "review"].indexOf(draft.stage) > i
                  ? "wizard-step done"
                  : "wizard-step"
            }
          >
            {i + 1}. {step.replace("_", " ")}
          </span>
        ))}
      </nav>

      {error && (
        <div className="banner banner-error">
          <p>{error}</p>
        </div>
      )}

      {draft.stage === "intent" && (
        <IntentDialogueStep
          initial={form}
          onNext={(f) => {
            setForm(f);
            const built = buildIntentFromForm(f);
            setIntent(built);
            persist({
              ...draft,
              stage: "sources",
              form: f,
              intent: built as unknown as Record<string, unknown>,
            });
          }}
        />
      )}

      {draft.stage === "sources" && intent && (
        <SourceConfigStep
          intent={intent}
          sourceText={draft.sourceText}
          webUrls={draft.webUrls}
          uploads={draft.uploads}
          selectedCatalogIds={draft.selectedCatalogIds}
          onBack={() => persist({ ...draft, stage: "intent" })}
          onNext={(payload) => {
            persist({
              ...draft,
              ...payload,
              stage: "generation",
            });
            void runGeneration(intent, payload.sourceText, payload.selectedCatalogIds);
          }}
        />
      )}

      {draft.stage === "generation" && (
        <>
          <GenerationProgressStep steps={genSteps} />
          {cloudJobId && user && (
            <p className="hint">Job {cloudJobId} — progress syncs from the server.</p>
          )}
        </>
      )}

      {draft.stage === "review" && draft.review && (
        <LibraryReviewStep
          review={draft.review}
          onBack={() => persist({ ...draft, stage: "sources" })}
          onPublish={() => {
            persist({ ...draft, stage: "done" });
            if (generationMode === "cloud") {
              alert(
                "Library generated on the server with spine anchoring. Export to your catalog is the next step (publishLibraryFromJob)."
              );
            } else {
              alert(
                "Local preview saved. Sign in and retry for full spine anchoring via Cloud Functions."
              );
            }
          }}
        />
      )}

      {draft.stage === "done" && (
        <div className="panel">
          <h2>Library created</h2>
          <p>
            {generationMode === "cloud"
              ? "Your library was built on the server with universal spine anchoring."
              : "Your preview library is ready in this browser session."}
          </p>
          <Link to="/library" className="btn primary">
            Browse libraries
          </Link>
        </div>
      )}
    </div>
  );
}
