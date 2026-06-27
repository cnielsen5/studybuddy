import { z } from "zod";

/** How this block was found in the source — not concept map hierarchy. */
export const ContentBlockTypeSchema = z.enum([
  "heading_section",
  "objective_item",
  "list_item",
  "paragraph",
  "figure_caption",
  "document",
]);

export type ContentBlockType = z.infer<typeof ContentBlockTypeSchema>;

const ParsedSectionCoreSchema = z.object({
  title: z.string(),
  body: z.string(),
  sequence: z.number().int().positive(),
  pageOrSlide: z.number().int().nonnegative().optional(),
  level: z.number().int().min(0).max(6),
  blockType: ContentBlockTypeSchema,
  structuralHeadingTrail: z.array(z.string()),
  /** Present when merged from multi-URL ingest. */
  sourceUrl: z.string().url().optional(),
  sourcePageTitle: z.string().optional(),
});

/** Backward-compatible parse for artifacts saved before blockType/sequence existed. */
export const ParsedSectionSchema = z.preprocess((value) => {
  if (typeof value !== "object" || value === null) {
    return value;
  }
  const section = value as Record<string, unknown>;
  const sequence =
    typeof section.sequence === "number"
      ? section.sequence
      : typeof section.pageOrSlide === "number"
        ? section.pageOrSlide
        : 1;

  return {
    ...section,
    sequence,
    pageOrSlide: section.pageOrSlide ?? sequence,
    level: typeof section.level === "number" ? section.level : 0,
    blockType: section.blockType ?? "heading_section",
    structuralHeadingTrail: section.structuralHeadingTrail ?? [],
  };
}, ParsedSectionCoreSchema);

export type ParsedSection = z.infer<typeof ParsedSectionSchema>;

export const ParsedSourceTypeSchema = z.enum([
  "pdf",
  "pptx",
  "syllabus",
  "text",
  "website",
]);

export type ParsedSourceType = z.infer<typeof ParsedSourceTypeSchema>;

export const ParsedSourceSchema = z.object({
  sourceType: ParsedSourceTypeSchema,
  sourceUrl: z.string().url().optional(),
  sourceLabel: z.string().optional(),
  sections: z.array(ParsedSectionSchema),
  rawText: z.string(),
  metadata: z
    .object({
      fetchedAt: z.string().datetime().optional(),
      contentType: z.string().optional(),
      crawlScope: z.enum(["single_page", "section", "sitemap"]).optional(),
      pageTitle: z.string().optional(),
      contentRoot: z.string().optional(),
      extractionNotes: z.array(z.string()).optional(),
      sourceUrls: z.array(z.string().url()).optional(),
    })
    .optional(),
});

export type ParsedSource = z.infer<typeof ParsedSourceSchema>;

export const SourceRefSchema = z.object({
  kind: z.enum(["url", "file", "paste"]),
  value: z.string(),
  addedAt: z.string().datetime(),
});

export type SourceRef = z.infer<typeof SourceRefSchema>;

export function normalizeParsedSection(
  partial: Omit<ParsedSection, "pageOrSlide"> & { pageOrSlide?: number }
): ParsedSection {
  return ParsedSectionSchema.parse({
    ...partial,
    pageOrSlide: partial.pageOrSlide ?? partial.sequence,
    structuralHeadingTrail: partial.structuralHeadingTrail ?? [],
  });
}
