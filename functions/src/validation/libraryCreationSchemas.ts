import { z } from "zod";

/** Firebase JSON may send null for omitted optional fields — treat like undefined. */
const optionalString = () => z.string().nullish();
const optionalUrl = () => z.string().url().nullish();

const ResolutionRangeSchema = z.object({
  min: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  max: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
});

const CurriculumChoiceSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("custom"),
    name: z.string().min(1),
    sourceUrl: optionalUrl(),
    uploadRef: optionalString(),
  }),
  z.object({
    mode: z.literal("catalog"),
    lensId: z.string().min(1),
    lensName: z.string().min(1),
  }),
  z.object({
    mode: z.literal("logical"),
  }),
]);

export const LibraryCreationIntentPayloadSchema = z.object({
  domain: z.string().min(1),
  purposeStatement: optionalString(),
  spineDomainId: optionalString(),
  audience: z.object({
    level: z.enum(["highschool", "undergrad", "grad", "professional", "self_taught"]),
    priorKnowledge: z.array(z.string()).default([]),
    targetDepth: z.enum(["survey", "working", "mastery"]),
    resolutionRange: ResolutionRangeSchema,
  }),
  purpose: z.enum(["exam_prep", "deep_understanding", "reference"]),
  scopeBoundaries: z.array(z.string()).default([]),
  scopeNotes: optionalString(),
  curriculum: CurriculumChoiceSchema.optional(),
  curriculumLensId: optionalString(),
  externalAugmentationAllowed: z.boolean().default(true),
  similarityThreshold: z.number().min(0).max(1).default(0.9),
  libraryTitle: z.string().min(1),
  libraryDescription: optionalString(),
});

export const SourceConfigurationPayloadSchema = z
  .object({
    uploads: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        fileName: z.string(),
      })
    ).default([]),
    webUrls: z.array(z.string().url()).default([]),
    selectedCatalogIds: z.array(z.string()).default([]),
    similarityThreshold: z.number().min(0).max(1).optional(),
  })
  .nullish();

export const GenerateLibraryPreviewRequestSchema = z
  .object({
    jobId: z.string().regex(/^lc_[a-z0-9]+$/),
    intent: LibraryCreationIntentPayloadSchema,
    sourceText: z.string().max(500_000).default(""),
    sourceConfiguration: SourceConfigurationPayloadSchema,
  })
  .superRefine((data, ctx) => {
    const hasText = data.sourceText.trim().length > 0;
    const cfg = data.sourceConfiguration;
    const hasCatalog = (cfg?.selectedCatalogIds?.length ?? 0) > 0;
    const hasUrls = (cfg?.webUrls?.length ?? 0) > 0;
    const hasUploads = (cfg?.uploads?.length ?? 0) > 0;
    if (!hasText && !hasCatalog && !hasUrls && !hasUploads) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Provide pasted text or keep at least one curated source, URL, or upload selected.",
        path: ["sourceText"],
      });
    }
  });

export const PublishLibraryRequestSchema = z.object({
  jobId: z.string().regex(/^lc_[a-z0-9]+$/),
  review: z.object({
    flags: z.array(
      z.object({
        id: z.string(),
        resolution: z.string(),
      })
    ),
  }),
});

export type GenerateLibraryPreviewRequest = z.infer<
  typeof GenerateLibraryPreviewRequestSchema
>;
