import { z } from "zod";

export const ReconcileFlagTypeSchema = z.enum([
  "scope_question",
  "missing_coverage",
  "new_concept_confirmation",
]);

export type ReconcileFlagType = z.infer<typeof ReconcileFlagTypeSchema>;

export const ReconcileFlagResolutionSchema = z.enum([
  "pending",
  "include",
  "exclude",
  "add_coverage",
  "skip_known",
  "confirmed",
  "edited",
  "removed",
  "skipped_all",
]);

export type ReconcileFlagResolution = z.infer<typeof ReconcileFlagResolutionSchema>;

export const ReconcileFlagSchema = z.object({
  id: z.string().min(1),
  type: ReconcileFlagTypeSchema,
  conceptId: z.string().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  sourceHint: z.string().optional(),
  /** Conservative default if user proceeds without resolving. */
  defaultResolution: ReconcileFlagResolutionSchema,
  resolution: ReconcileFlagResolutionSchema.default("pending"),
  /** Primary action label shown in UI. */
  primaryAction: z.string(),
  secondaryAction: z.string().optional(),
});

export type ReconcileFlag = z.infer<typeof ReconcileFlagSchema>;

export const ConceptPreviewNodeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sectionPath: z.array(z.string()).optional(),
  cardCount: z.number().int().nonnegative(),
  questionCount: z.number().int().nonnegative(),
  status: z.enum(["clean", "flagged"]),
  order: z.number().int().nonnegative(),
});

export type ConceptPreviewNode = z.infer<typeof ConceptPreviewNodeSchema>;

export const LibraryPreviewSummarySchema = z.object({
  conceptCount: z.number().int().nonnegative(),
  cardCount: z.number().int().nonnegative(),
  questionCount: z.number().int().nonnegative(),
  coveragePercent: z.number().min(0).max(100).optional(),
  coverageLabel: z.string().optional(),
  estimatedStudyHours: z.number().positive().optional(),
  /** Friendly framing shown when concepts were drawn from the existing spine. */
  originNote: z.string().optional(),
});

export type LibraryPreviewSummary = z.infer<typeof LibraryPreviewSummarySchema>;

export const LibraryReviewStateSchema = z.object({
  summary: LibraryPreviewSummarySchema,
  concepts: z.array(ConceptPreviewNodeSchema),
  flags: z.array(ReconcileFlagSchema),
  lensId: z.string().optional(),
  lensName: z.string().optional(),
});

export type LibraryReviewState = z.infer<typeof LibraryReviewStateSchema>;

export const GenerationProgressStepSchema = z.object({
  id: z.enum([
    "understand_material",
    "map_foundations",
    "build_concept_map",
    "generate_cards",
  ]),
  label: z.string().min(1),
  status: z.enum(["pending", "in_progress", "complete", "error"]),
  detail: z.string().optional(),
});

export type GenerationProgressStep = z.infer<typeof GenerationProgressStepSchema>;

export const MAX_FLAGS_BEFORE_SELF_CORRECTION = 8;
