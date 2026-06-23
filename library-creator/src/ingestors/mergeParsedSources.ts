import type { ParsedSource } from "../types/parsedSource.js";
import { ParsedSourceSchema } from "../types/parsedSource.js";
import { collapseBlocksToRawText } from "./contentBlockExtractor.js";
import { normalizeParsedSection } from "../types/parsedSource.js";

export interface MergeParsedSourcesOptions {
  /** Label for the combined source (defaults to first page title). */
  label?: string;
}

/**
 * Merge multiple page ingests into one ParsedSource for concept extraction.
 * Blocks are ordered by URL input order; each block keeps its sourceUrl.
 */
export function mergeParsedSources(
  sources: ParsedSource[],
  options: MergeParsedSourcesOptions = {}
): ParsedSource {
  if (sources.length === 0) {
    throw new Error("mergeParsedSources requires at least one source");
  }

  const sections = sources.flatMap((source, sourceIndex) =>
    source.sections.map((section, sectionIndex) =>
      normalizeParsedSection({
        ...section,
        sequence: sourceIndex * 10_000 + sectionIndex + 1,
        sourceUrl: section.sourceUrl ?? source.sourceUrl,
        sourcePageTitle:
          section.sourcePageTitle ??
          source.metadata?.pageTitle ??
          source.sourceLabel,
      })
    )
  );

  const resequenced = sections.map((section, index) =>
    normalizeParsedSection({
      ...section,
      sequence: index + 1,
      pageOrSlide: index + 1,
    })
  );

  const sourceUrls = [
    ...new Set(sources.map((s) => s.sourceUrl).filter(Boolean) as string[]),
  ];
  const notes = sources.flatMap((s) => s.metadata?.extractionNotes ?? []);

  const merged: ParsedSource = {
    sourceType: sources[0].sourceType,
    sourceUrl: sourceUrls[0],
    sourceLabel:
      options.label ??
      (sourceUrls.length > 1
        ? `Merged library (${sourceUrls.length} pages)`
        : sources[0].sourceLabel),
    sections: resequenced,
    rawText: collapseBlocksToRawText(resequenced),
    metadata: {
      fetchedAt: new Date().toISOString(),
      contentType: "text/html",
      crawlScope: sourceUrls.length > 1 ? "section" : sources[0].metadata?.crawlScope,
      pageTitle: options.label ?? sources[0].metadata?.pageTitle,
      sourceUrls: sourceUrls.length > 0 ? sourceUrls : undefined,
      extractionNotes:
        notes.length > 0
          ? [`Merged ${sources.length} sources`, ...notes]
          : [`Merged ${sources.length} sources`],
    },
  };

  return ParsedSourceSchema.parse(merged);
}
