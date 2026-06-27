import type { ParsedSource } from "../types/parsedSource.js";
import {
  collapseSectionsToRawText,
  sectionsFromMarkdown,
} from "./sectionsFromHeadings.js";
import { collapseBlocksToRawText } from "./contentBlockExtractor.js";

export function ingestText(
  text: string,
  options?: { sourceType?: "text" | "syllabus"; label?: string }
): ParsedSource {
  const sourceType = options?.sourceType ?? detectSourceType(text);
  const sections = sectionsFromMarkdown(text);

  return {
    sourceType,
    sourceLabel: options?.label,
    sections,
    rawText:
      collapseBlocksToRawText(sections) ||
      collapseSectionsToRawText(sections) ||
      text.trim(),
  };
}

function detectSourceType(text: string): "text" | "syllabus" {
  const lower = text.toLowerCase();
  if (
    lower.includes("syllabus") ||
    lower.includes("learning objectives") ||
    lower.includes("week 1") ||
    lower.includes("course schedule")
  ) {
    return "syllabus";
  }
  return "text";
}
