import { z } from "zod";
import { ResolutionRangeSchema } from "./resolution.js";

export const AudienceLevelSchema = z.enum([
  "highschool",
  "undergrad",
  "grad",
  "professional",
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
  audience: AudienceProfileSchema,
  purpose: LibraryPurposeSchema,
  scopeBoundaries: z.array(z.string()),
  externalAugmentationAllowed: z.boolean(),
  similarityThreshold: z.number().min(0).max(1),
  libraryTitle: z.string().min(1),
  libraryDescription: z.string().optional(),
});

export type LibraryCreationIntent = z.infer<typeof LibraryCreationIntentSchema>;
