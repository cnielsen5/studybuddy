import { buildSourceConfiguration } from "@lc/sources/buildSourceConfiguration.js";
import type { LibraryCreationIntent } from "@lc/types/intent.js";
import type { SourceConfiguration } from "@lc/types/sourceConfig.js";
import {
  canUseCloudLibraryGeneration,
  createLibraryJobId,
  generateLibraryPreviewViaFunction,
  subscribeToLibraryJobProgress,
} from "./api.ts";
import {
  buildIntentFromForm,
  runClientGeneration,
  searchLensCatalog,
  filterCatalogForDomain,
} from "./pipeline.ts";
import type { GenerationStep, LibraryReviewState } from "./types.ts";

export {
  buildIntentFromForm,
  searchLensCatalog,
  filterCatalogForDomain,
  buildSourceConfiguration,
  canUseCloudLibraryGeneration,
  createLibraryJobId,
  runClientGeneration,
};

export interface RunGenerationOptions {
  uid: string;
  intent: LibraryCreationIntent;
  sourceText: string;
  sourceConfiguration?: SourceConfiguration;
  jobId?: string;
  onProgress: (steps: GenerationStep[]) => void;
}

export interface RunGenerationResult {
  jobId: string;
  review: LibraryReviewState;
  mode: "cloud" | "client";
}

/**
 * Stage 3 — prefer Cloud Function (full spine anchoring); fall back to client heuristic.
 */
export async function runLibraryGeneration(
  options: RunGenerationOptions
): Promise<RunGenerationResult> {
  const jobId = options.jobId ?? createLibraryJobId();
  const sourceConfiguration =
    options.sourceConfiguration ?? buildSourceConfiguration(options.intent);

  if (canUseCloudLibraryGeneration()) {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = subscribeToLibraryJobProgress(
        options.uid,
        jobId,
        options.onProgress
      );

      const result = await generateLibraryPreviewViaFunction({
        uid: options.uid,
        jobId,
        intent: options.intent,
        sourceText: options.sourceText,
        sourceConfiguration,
      });

      options.onProgress(result.progress);
      return { jobId, review: result.review, mode: "cloud" };
    } finally {
      unsubscribe?.();
    }
  }

  const review = await runClientGeneration(
    options.intent,
    options.sourceText,
    options.onProgress,
    sourceConfiguration
  );
  return { jobId, review, mode: "client" };
}
