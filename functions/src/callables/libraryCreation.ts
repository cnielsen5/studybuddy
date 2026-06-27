import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { requireAuth } from "../http/requireAuth";
import { sanitizeForFirestore } from "../http/firestoreSanitize";
import {
  GenerateLibraryPreviewRequestSchema,
  PublishLibraryRequestSchema,
} from "../validation/libraryCreationSchemas";

/** Monorepo content bundled at functions/runtime/content by prebuild. */
function functionsRuntimeRoot(): string {
  return join(__dirname, "../../runtime");
}

async function loadLibraryCreatorModules() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("../vendor/libraryCreator.cjs") as {
    UserFacingLibraryPipeline: new (options?: {
      service?: unknown;
      repoRoot?: string;
    }) => {
      runWithIntent: (
        intent: unknown,
        options: Record<string, unknown>
      ) => Promise<{
        jobId: string;
        review: {
          summary: { conceptCount: number };
        };
        progress: unknown[];
      }>;
      publish: (
        jobId: string,
        review: unknown
      ) => Promise<{ exportPath: string }>;
    };
    JobStore: new (jobsDir?: string) => unknown;
    LibraryCreationService: new (store?: unknown) => unknown;
  };
  return mod;
}

function jobDocPath(uid: string, jobId: string): string {
  return `users/${uid}/libraryCreationJobs/${jobId}`;
}

/**
 * Stage 3 — full pipeline with spine anchoring (callable from app wizard).
 * Writes progress steps to Firestore for live UI updates.
 */
export const generateLibraryPreview = onCall(
  {
    timeoutSeconds: 300,
    memory: "1GiB",
    region: "us-central1",
  },
  async (request) => {
    const uid = requireAuth(request);
    const parsed = GenerateLibraryPreviewRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        parsed.error.errors.map((e) => e.message).join("; ")
      );
    }

    const { jobId, intent, sourceText, sourceConfiguration } = parsed.data;
    const db = admin.firestore();
    const jobRef = db.doc(jobDocPath(uid, jobId));

    await jobRef.set(
      {
        status: "running",
        progress: [],
        intent: { libraryTitle: intent.libraryTitle, domain: intent.domain },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    try {
      const { UserFacingLibraryPipeline, JobStore, LibraryCreationService } =
        await loadLibraryCreatorModules();

      const jobsDir = join(tmpdir(), "library-creator-jobs", uid, jobId);
      mkdirSync(jobsDir, { recursive: true });

      const store = new JobStore(jobsDir);
      const service = new LibraryCreationService(store);
      const repoRoot = functionsRuntimeRoot();

      const pipeline = new UserFacingLibraryPipeline({ service, repoRoot });

      const result = await pipeline.runWithIntent(intent, {
        sourceText,
        sourceConfiguration,
        userId: uid,
        jobName: intent.libraryTitle,
        repoRoot,
        onProgress: async (steps: Array<Record<string, unknown>>) => {
          await jobRef.set(
            {
              progress: sanitizeForFirestore(steps),
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        },
      });

      await jobRef.set(
        {
          status: "complete",
          progress: sanitizeForFirestore(result.progress),
          review: sanitizeForFirestore(result.review),
          pipelineJobId: result.jobId,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      logger.info("Library preview generated", {
        uid,
        jobId,
        concepts: result.review.summary.conceptCount,
      });

      return {
        jobId,
        pipelineJobId: result.jobId,
        review: result.review,
        progress: result.progress,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("generateLibraryPreview failed", { uid, jobId, message });
      await jobRef.set(
        {
          status: "error",
          error: message,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      throw new HttpsError("internal", message);
    }
  }
);

/**
 * Stage 5 — export Golden Master bundle after user approves review flags.
 */
export const publishLibraryFromJob = onCall(
  {
    timeoutSeconds: 120,
    memory: "512MiB",
    region: "us-central1",
  },
  async (request) => {
    const uid = requireAuth(request);
    const parsed = PublishLibraryRequestSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError("invalid-argument", "Invalid publish payload.");
    }

    const { jobId } = parsed.data;
    const db = admin.firestore();
    const jobSnap = await db.doc(jobDocPath(uid, jobId)).get();
    if (!jobSnap.exists) {
      throw new HttpsError("not-found", "Library creation job not found.");
    }

    const data = jobSnap.data()!;
    const pipelineJobId = data.pipelineJobId as string | undefined;
    const review = data.review as Record<string, unknown> | undefined;

    if (!pipelineJobId || !review) {
      throw new HttpsError(
        "failed-precondition",
        "Job has no generated review. Run generation first."
      );
    }

    try {
      const { UserFacingLibraryPipeline, JobStore, LibraryCreationService } =
        await loadLibraryCreatorModules();

      const jobsDir = join(tmpdir(), "library-creator-jobs", uid, jobId);
      const store = new JobStore(jobsDir);
      const service = new LibraryCreationService(store);
      const pipeline = new UserFacingLibraryPipeline({
        service,
        repoRoot: functionsRuntimeRoot(),
      });

      const { exportPath } = await pipeline.publish(pipelineJobId, review);

      await db.doc(jobDocPath(uid, jobId)).set(
        {
          status: "published",
          exportPath,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return { exportPath, jobId, pipelineJobId };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("publishLibraryFromJob failed", { uid, jobId, message });
      throw new HttpsError("internal", message);
    }
  }
);
