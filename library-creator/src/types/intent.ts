import { z } from "zod";
import { ResolutionRangeSchema } from "./resolution.js";
import { CurriculumChoiceSchema } from "./intentDialogue.js";

export const AudienceLevelSchema = z.enum([
  "highschool",
  "undergrad",
  "grad",
  "professional",
  "self_taught",
]);

export const TargetDepthSchema = z.enum(["survey", "working", "mastery"]);

export const LibraryPurposeSchema = z.enum([
  "exam_prep",
  "deep_understanding",
  "reference",
]);

export type LibraryPurpose = z.infer<typeof LibraryPurposeSchema>;

export const AudienceProfileSchema = z.object({
  level: AudienceLevelSchema,
  priorKnowledge: z.array(z.string()),
  targetDepth: TargetDepthSchema,
  resolutionRange: ResolutionRangeSchema,
});

export type AudienceProfile = z.infer<typeof AudienceProfileSchema>;

export const LibraryCreationIntentSchema = z.object({
  domain: z.string().min(1),
  /** Free-text purpose from Stage 1 — e.g. "studying for USMLE Step 1". */
  purposeStatement: z.string().optional(),
  /** Canonical spine domain for placement (medicine_clinical, mathematics, …). */
  spineDomainId: z.string().optional(),
  audience: AudienceProfileSchema,
  purpose: LibraryPurposeSchema,
  scopeBoundaries: z.array(z.string()),
  /** Optional free-text scope from Stage 1 (include/exclude notes). */
  scopeNotes: z.string().optional(),
  curriculum: CurriculumChoiceSchema.optional(),
  /** Set when curriculum.mode === "catalog". */
  curriculumLensId: z.string().optional(),
  externalAugmentationAllowed: z.boolean(),
  similarityThreshold: z.number().min(0).max(1),
  libraryTitle: z.string().min(1),
  libraryDescription: z.string().optional(),
});

export type LibraryCreationIntent = z.infer<typeof LibraryCreationIntentSchema>;
