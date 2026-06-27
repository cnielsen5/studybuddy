import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { getAppInstance, getDb, isFirebaseConfigured } from "../firebase.ts";
import type { LibraryCreationIntent } from "@lc/types/intent.js";
import type { SourceConfiguration } from "@lc/types/sourceConfig.js";
import type { GenerationStep, LibraryReviewState } from "./types.ts";

let emulatorConnected = false;

function getFunctionsInstance() {
  const functions = getFunctions(getAppInstance(), "us-central1");
  if (
    import.meta.env.DEV &&
    import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === "true" &&
    !emulatorConnected
  ) {
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    emulatorConnected = true;
  }
  return functions;
}

export function createLibraryJobId(): string {
  const suffix =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return `lc_${suffix}`;
}

export function subscribeToLibraryJobProgress(
  uid: string,
  jobId: string,
  onProgress: (steps: GenerationStep[]) => void
): Unsubscribe {
  const db = getDb();
  return onSnapshot(doc(db, "users", uid, "libraryCreationJobs", jobId), (snap) => {
    const data = snap.data();
    if (data?.progress && Array.isArray(data.progress)) {
      onProgress(data.progress as GenerationStep[]);
    }
  });
}

export interface GenerateLibraryPreviewResult {
  jobId: string;
  pipelineJobId: string;
  review: LibraryReviewState;
  progress: GenerationStep[];
}

/** Remove null leaves so Firebase/JSON round-trips do not fail Zod `.optional()` fields. */
export function sanitizeCallablePayload<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_, v) => (v === null ? undefined : v)));
}

export async function generateLibraryPreviewViaFunction(input: {
  uid: string;
  jobId: string;
  intent: LibraryCreationIntent;
  sourceText: string;
  sourceConfiguration?: SourceConfiguration;
}): Promise<GenerateLibraryPreviewResult> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }

  const fn = httpsCallable(getFunctionsInstance(), "generateLibraryPreview");
  const response = await fn(
    sanitizeCallablePayload({
      jobId: input.jobId,
      intent: input.intent,
      sourceText: input.sourceText,
      sourceConfiguration: input.sourceConfiguration,
    })
  );

  return response.data as GenerateLibraryPreviewResult;
}

export async function publishLibraryViaFunction(input: {
  jobId: string;
  review: LibraryReviewState;
}): Promise<{ exportPath: string; jobId: string; pipelineJobId: string }> {
  const fn = httpsCallable(getFunctionsInstance(), "publishLibraryFromJob");
  const response = await fn({
    jobId: input.jobId,
    review: { flags: input.review.flags },
  });
  return response.data as { exportPath: string; jobId: string; pipelineJobId: string };
}

export function canUseCloudLibraryGeneration(): boolean {
  return isFirebaseConfigured();
}
