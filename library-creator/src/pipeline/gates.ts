import type {
  LibraryCreationJob,
  PipelineStage,
  StageStatus,
} from "../types/pipeline.js";
import { nextStage, PIPELINE_STAGES } from "../types/pipeline.js";

export class PipelineGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PipelineGateError";
  }
}

export function assertStageApproved(
  job: LibraryCreationJob,
  stage: PipelineStage
): void {
  const record = job.stages[stage];
  if (record.status !== "approved") {
    throw new PipelineGateError(
      `Stage "${stage}" must be approved before continuing (current: ${record.status}). Run: library-creator approve ${job.id} ${stage}`
    );
  }
}

export function assertCurrentStage(
  job: LibraryCreationJob,
  expected: PipelineStage
): void {
  if (job.currentStage !== expected) {
    throw new PipelineGateError(
      `Job ${job.id} is at stage "${job.currentStage}", expected "${expected}".`
    );
  }
}

export function canRunStage(
  job: LibraryCreationJob,
  stage: PipelineStage
): boolean {
  const stageIndex = PIPELINE_STAGES.indexOf(stage);
  if (stageIndex <= 0) {
    return true;
  }
  const prior = PIPELINE_STAGES[stageIndex - 1];
  return job.stages[prior].status === "approved";
}

export function markStage(
  job: LibraryCreationJob,
  stage: PipelineStage,
  status: StageStatus,
  artifactPath?: string,
  error?: string
): LibraryCreationJob {
  const now = new Date().toISOString();
  return {
    ...job,
    updatedAt: now,
    status: job.status === "draft" ? "in_progress" : job.status,
    stages: {
      ...job.stages,
      [stage]: {
        status,
        updatedAt: now,
        artifactPath,
        error,
      },
    },
  };
}

export function approveStage(
  job: LibraryCreationJob,
  stage: PipelineStage
): LibraryCreationJob {
  if (job.stages[stage].status !== "awaiting_review") {
    throw new PipelineGateError(
      `Stage "${stage}" is not awaiting review (current: ${job.stages[stage].status}).`
    );
  }

  let updated = markStage(job, stage, "approved");
  const upcoming = nextStage(stage);
  if (upcoming) {
    updated = {
      ...updated,
      currentStage: upcoming,
      stages: {
        ...updated.stages,
        [upcoming]:
          updated.stages[upcoming].status === "pending"
            ? {
                status: "in_progress",
                updatedAt: new Date().toISOString(),
              }
            : updated.stages[upcoming],
      },
    };
  }
  return updated;
}
