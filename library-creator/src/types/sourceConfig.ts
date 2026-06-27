import { z } from "zod";

export const CuratedSourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.string().url().optional(),
  /** Spine domain ids this source applies to; empty = all domains. */
  domainIds: z.array(z.string()),
  tags: z.array(z.string()),
  recommended: z.boolean().default(false),
});

export type CuratedSource = z.infer<typeof CuratedSourceSchema>;

export const UploadedSourceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().optional(),
  /** Job artifact path or client blob ref after ingestion. */
  artifactRef: z.string().optional(),
});

export type UploadedSource = z.infer<typeof UploadedSourceSchema>;

export const SourceConfigurationSchema = z.object({
  uploads: z.array(UploadedSourceSchema),
  webUrls: z.array(z.string().url()),
  selectedCatalogIds: z.array(z.string()),
  /** Hidden default — power users may override in advanced settings. */
  similarityThreshold: z.number().min(0).max(1).default(0.9),
});

export type SourceConfiguration = z.infer<typeof SourceConfigurationSchema>;
