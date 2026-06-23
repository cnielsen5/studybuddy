import type { ParsedSection } from "../types/parsedSource.js";
import { normalizeParsedSection } from "../types/parsedSource.js";
import { titleFromContentLine } from "./contentTitles.js";

const MARKDOWN_HEADING = /^(#{1,6})\s+(.+)$/;

const OBJECTIVE_LINE =
  /^(?:[-*•]\s*)?(Distinguish|Describe|Identify|Define|Explain|Compare|Contrast|List|Name|Recognize|Analyze|Apply|Calculate|Demonstrate|Discuss|Evaluate|Label|Summarize|Use|Understand|Differentiate|Outline|Predict|State)\b/i;

/**
 * Split markdown or plain text into content blocks.
 * Heading rank is structural provenance only — not concept hierarchy.
 */
export function sectionsFromMarkdown(text: string): ParsedSection[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const sections: ParsedSection[] = [];
  let headingTrail: string[] = [];
  let current: ParsedSection | null = null;
  let bodyLines: string[] = [];
  let sequence = 0;

  const flush = () => {
    if (!current) return;
    current.body = bodyLines.join("\n").trim();
    sections.push(current);
    current = null;
    bodyLines = [];
  };

  for (const line of lines) {
    const match = line.match(MARKDOWN_HEADING);
    if (match) {
      flush();
      const rank = match[1].length;
      const title = match[2].trim();
      headingTrail = setHeadingTrail(headingTrail, rank, title);

      sequence += 1;
      current = normalizeParsedSection({
        title,
        body: "",
        sequence,
        level: rank,
        blockType: "heading_section",
        structuralHeadingTrail: headingTrail.slice(0, -1),
      });
      continue;
    }

    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      flush();
      sequence += 1;
      const body = bulletMatch[1].trim();
      sections.push(
        normalizeParsedSection({
          title: titleFromContentLine(body),
          body,
          sequence,
          level: 0,
          blockType: OBJECTIVE_LINE.test(body) ? "objective_item" : "list_item",
          structuralHeadingTrail: [...headingTrail],
        })
      );
      continue;
    }

    bodyLines.push(line);
  }

  flush();

  if (sections.length === 0) {
    const trimmed = text.trim();
    if (!trimmed) {
      return [];
    }
    return [
      normalizeParsedSection({
        title: "Document",
        body: trimmed,
        sequence: 1,
        level: 0,
        blockType: "document",
        structuralHeadingTrail: [],
      }),
    ];
  }

  return sections;
}

/** @deprecated Use collapseBlocksToRawText from contentBlockExtractor */
export function collapseSectionsToRawText(sections: ParsedSection[]): string {
  return sections
    .map((section) => {
      const trail =
        section.structuralHeadingTrail.length > 0
          ? `[${section.structuralHeadingTrail.join(" > ")}] `
          : "";
      return `${trail}${section.title}\n\n${section.body}`.trim();
    })
    .join("\n\n")
    .trim();
}

export function headingLevelFromTag(tag: string): number {
  const match = tag.match(/^h([1-6])$/i);
  if (!match) {
    return 0;
  }
  return Number.parseInt(match[1], 10);
}

function setHeadingTrail(trail: string[], rank: number, title: string): string[] {
  const parents = trail.filter(Boolean).slice(0, rank - 1);
  return [...parents, title];
}
