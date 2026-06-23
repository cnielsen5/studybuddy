import { z } from "zod";
import { DomainProfileSchema } from "./domainProfile.js";
import { ConceptGraphDraftSchema } from "./draftConcept.js";
import { CardsQuestionsDraftSchema } from "./draftCardQuestion.js";
import { RelationshipsDraftSchema } from "./draftRelationship.js";
import {
  LibraryBundleSchema,
  LibraryExportRecordSchema,
} from "./libraryBundle.js";
import { LibraryCreationIntentSchema } from "./intent.js";
import { ParsedSourceSchema, SourceRefSchema } from "./parsedSource.js";

export const PIPELINE_STAGES = [
  "ingestion",
  "intent",
  "domain_profile",
  "concept_graph",
  "cards_questions",
  "relationships",
  "export",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const StageStatusSchema = z.enum([
  "pending",
  "in_progress",
  "awaiting_review",
  "approved",
  "skipped",
]);

export type StageStatus = z.infer<typeof StageStatusSchema>;

export const StageRecordSchema = z.object({
  status: StageStatusSchema,
  updatedAt: z.string().datetime(),
  artifactPath: z.string().optional(),
  error: z.string().optional(),
});

export type StageRecord = z.infer<typeof StageRecordSchema>;

export const LibraryCreationJobSchema = z.object({
  id: z.string().regex(/^lc_[a-z0-9]+$/),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  status: z.enum(["draft", "in_progress", "completed", "abandoned"]),
  currentStage: z.enum(PIPELINE_STAGES),
  sourceRefs: z.array(SourceRefSchema),
  stages: z.object({
    ingestion: StageRecordSchema,
    intent: StageRecordSchema,
    domain_profile: StageRecordSchema,
    concept_graph: StageRecordSchema,
    cards_questions: StageRecordSchema,
    relationships: StageRecordSchema,
    export: StageRecordSchema,
  }),
  /** Parsed artifacts kept inline for CLI inspection (also written to disk). */
  artifacts: z
    .object({
      parsedSource: ParsedSourceSchema.optional(),
      intent: LibraryCreationIntentSchema.optional(),
      domainProfile: DomainProfileSchema.optional(),
      conceptGraph: ConceptGraphDraftSchema.optional(),
      cardsQuestions: CardsQuestionsDraftSchema.optional(),
      relationships: RelationshipsDraftSchema.optional(),
      libraryBundle: LibraryBundleSchema.optional(),
      exportRecord: LibraryExportRecordSchema.optional(),
    })
    .optional(),
});

export type LibraryCreationJob = z.infer<typeof LibraryCreationJobSchema>;

export function nextStage(stage: PipelineStage): PipelineStage | null {
  const index = PIPELINE_STAGES.indexOf(stage);
  if (index < 0 || index >= PIPELINE_STAGES.length - 1) {
    return null;
  }
  return PIPELINE_STAGES[index + 1];
}

export function createInitialStageRecord(
  status: StageStatus = "pending"
): StageRecord {
  return {
    status,
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyJob(name: string, id: string): LibraryCreationJob {
  const now = new Date().toISOString();
  return {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    status: "draft",
    currentStage: "ingestion",
    sourceRefs: [],
    stages: {
      ingestion: createInitialStageRecord("in_progress"),
      intent: createInitialStageRecord(),
      domain_profile: createInitialStageRecord(),
      concept_graph: createInitialStageRecord(),
      cards_questions: createInitialStageRecord(),
      relationships: createInitialStageRecord(),
      export: createInitialStageRecord(),
    },
    artifacts: {},
  };
}
