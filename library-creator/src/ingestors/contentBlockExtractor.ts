import * as cheerio from "cheerio";
import type { Cheerio, CheerioAPI } from "cheerio";
import type { AnyNode, Element } from "domhandler";
import type { ContentBlockType, ParsedSection } from "../types/parsedSource.js";
import { normalizeParsedSection } from "../types/parsedSource.js";
import {
  defaultObjectiveTrail,
  objectiveTrailFromIntro,
  titleFromContentLine,
} from "./contentTitles.js";

const SKIP_ANCESTOR_SELECTOR =
  "nav, header, footer, aside, script, style, noscript, .nav, .footer, .header";

const OBJECTIVE_INTRO =
  /after studying|learning objectives|you will be able to|chapter objectives|by the end of/i;

const OBJECTIVE_LINE =
  /^(?:[-*•]\s*)?(Distinguish|Describe|Identify|Define|Explain|Compare|Contrast|List|Name|Recognize|Analyze|Apply|Calculate|Demonstrate|Discuss|Evaluate|Label|Summarize|Use|Understand|Differentiate|Outline|Predict|State)\b/i;

export interface ExtractContentBlocksOptions {
  pageTitle?: string;
  contentRootHint?: string;
}

/**
 * Extract ordered content blocks from HTML.
 * Blocks capture document structure for later semantic concept extraction —
 * heading rank here is provenance, not concept hierarchy.
 */
export function extractContentBlocksFromHtml(
  html: string,
  options: ExtractContentBlocksOptions = {}
): { sections: ParsedSection[]; contentRoot: string; notes: string[] } {
  const cheerioApi = cheerio.load(html);
  const $ = cheerioApi;
  const { root, contentRoot } = findContentRoot($);
  const notes: string[] = [];

  if (!root.length) {
    return { sections: [], contentRoot: "none", notes: ["No content root found"] };
  }

  const blocks: ParsedSection[] = [];
  let sequence = 0;
  let headingTrail: string[] = [];
  let inObjectiveContext = false;
  let pendingObjectiveIntro = "";
  let objectiveTrail: string[] = [];

  const pushBlock = (params: {
    title: string;
    body: string;
    blockType: ContentBlockType;
    headingRank?: number;
    headingTrailOverride?: string[];
  }) => {
    const body = params.body.trim();
    if (!body && !params.title.trim()) {
      return;
    }

    const trail =
      params.headingTrailOverride ??
      (params.blockType === "objective_item" && headingTrail.length === 0
        ? objectiveTrail
        : headingTrail);

    sequence += 1;
    blocks.push(
      normalizeParsedSection({
        title: params.title.trim() || `Block ${sequence}`,
        body,
        sequence,
        level: params.headingRank ?? 0,
        blockType: params.blockType,
        structuralHeadingTrail: [...trail],
      })
    );
  };

  const walk = (elements: Cheerio<AnyNode>) => {
    elements.each((_, element) => {
      if (element.type !== "tag") {
        return;
      }
      if (isSkipped($, element)) {
        return;
      }

      const tag = element.tagName?.toLowerCase() ?? "";
      const text = normalizeWhitespace($(element).text());

      if (/^h[1-6]$/.test(tag)) {
        const title = text;
        if (title) {
          const rank = Number.parseInt(tag[1], 10);
          headingTrail = setHeadingTrail(headingTrail, rank, title);
          inObjectiveContext = OBJECTIVE_INTRO.test(title);
        }
        return;
      }

      if (tag === "ul" || tag === "ol") {
        const listIntro = inObjectiveContext ? pendingObjectiveIntro : "";
        $(element)
          .children("li")
          .each((_, li) => {
            const liText = extractListItemText($, li);
            if (!liText) {
              return;
            }
            const isObjective =
              inObjectiveContext ||
              OBJECTIVE_LINE.test(liText) ||
              OBJECTIVE_INTRO.test(listIntro);

            pushBlock({
              title: titleFromContentLine(liText),
              body: liText,
              blockType: isObjective ? "objective_item" : "list_item",
            });
          });
        inObjectiveContext = false;
        pendingObjectiveIntro = "";
        objectiveTrail = [];
        return;
      }

      if (tag === "p") {
        if (OBJECTIVE_INTRO.test(text)) {
          inObjectiveContext = true;
          pendingObjectiveIntro = text;
          objectiveTrail = objectiveTrailFromIntro(
            text,
            options.pageTitle,
            headingTrail
          );
          return;
        }

        if (inObjectiveContext && OBJECTIVE_LINE.test(text)) {
          pushBlock({
            title: titleFromContentLine(text),
            body: text,
            blockType: "objective_item",
          });
          return;
        }

        if (text.length >= 40) {
          pushBlock({
            title: inferParagraphTitle(text, headingTrail),
            body: text,
            blockType: "paragraph",
          });
        }
        inObjectiveContext = false;
        return;
      }

      if (tag === "figure" || tag === "figcaption") {
        const caption = tag === "figure" ? $(element).find("figcaption").text() : text;
        const captionText = normalizeWhitespace(caption);
        if (captionText) {
          pushBlock({
            title: "Figure",
            body: captionText,
            blockType: "figure_caption",
          });
        }
        return;
      }

      if (tag === "section" || tag === "article" || tag === "div") {
        walk($(element).children());
      }
    });
  };

  walk(root.children());

  if (blocks.length === 0) {
    const fallbackText = normalizeWhitespace(root.text());
    if (fallbackText) {
      notes.push("Fell back to flat text extraction");
      sequence += 1;
      blocks.push(
        normalizeParsedSection({
          title: options.pageTitle ?? "Document",
          body: fallbackText,
          sequence,
          level: 0,
          blockType: "document",
          structuralHeadingTrail: [],
        })
      );
    }
  }

  const expanded = enrichObjectiveTrails(
    expandDenseBlocks(blocks),
    options.pageTitle
  );
  if (expanded.length > blocks.length) {
    notes.push(`Split ${expanded.length - blocks.length} dense blocks into atomic items`);
  }

  return { sections: resequence(expanded), contentRoot, notes };
}

function setHeadingTrail(trail: string[], rank: number, title: string): string[] {
  const parents = trail.filter(Boolean).slice(0, rank - 1);
  return [...parents, title];
}

function findContentRoot($: CheerioAPI): {
  root: Cheerio<AnyNode>;
  contentRoot: string;
} {
  const selectors = [
    '[data-type="page"]',
    "main [data-type='document']",
    "main.os-main",
    "main",
    "article",
    "#content",
    '[role="main"]',
  ];

  for (const selector of selectors) {
    const candidate = $(selector).first();
    if (candidate.length && normalizeWhitespace(candidate.text()).length > 100) {
      return { root: candidate, contentRoot: selector };
    }
  }

  return { root: $("body"), contentRoot: "body" };
}

function isSkipped($: CheerioAPI, element: Element): boolean {
  const el = $(element);
  if (el.closest(SKIP_ANCESTOR_SELECTOR).length > 0) {
    return true;
  }
  if (el.attr("aria-hidden") === "true") {
    return true;
  }
  return false;
}

function extractListItemText($: CheerioAPI, li: Element): string {
  const clone = $(li).clone();
  clone.find("ul, ol").remove();
  return normalizeWhitespace(clone.text());
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function inferParagraphTitle(text: string, headingTrail: string[]): string {
  if (headingTrail.length > 0) {
    return headingTrail[headingTrail.length - 1];
  }
  const sentence = text.match(/^(.{8,120}?)[.!?](\s|$)/);
  return sentence?.[1]?.trim() ?? titleFromContentLine(text, 80);
}

/** Backfill trails on objective blocks that were extracted before any heading. */
export function enrichObjectiveTrails(
  sections: ParsedSection[],
  pageTitle?: string
): ParsedSection[] {
  const fallbackTrail = defaultObjectiveTrail(pageTitle);

  return sections.map((section) => {
    if (
      section.blockType === "objective_item" &&
      section.structuralHeadingTrail.length === 0
    ) {
      return normalizeParsedSection({
        ...section,
        structuralHeadingTrail: fallbackTrail,
      });
    }
    return section;
  });
}

/** Split legacy/dense sections where many objectives were merged into one body. */
export function expandDenseBlocks(sections: ParsedSection[]): ParsedSection[] {
  const expanded: ParsedSection[] = [];

  for (const section of sections) {
    if (
      section.blockType === "heading_section" ||
      section.blockType === "document" ||
      section.body.includes("\n")
    ) {
      const lines = section.body
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const objectiveLines = lines.filter((line) => OBJECTIVE_LINE.test(line));
      const proseLines = lines.filter((line) => !OBJECTIVE_LINE.test(line));

      if (objectiveLines.length >= 2) {
        for (const line of objectiveLines) {
          expanded.push(
            normalizeParsedSection({
              ...section,
              title: titleFromContentLine(line),
              body: line,
              blockType: "objective_item",
              level: 0,
            })
          );
        }
        if (proseLines.length > 0) {
          expanded.push(
            normalizeParsedSection({
              ...section,
              title: section.title,
              body: proseLines.join("\n"),
              blockType: "paragraph",
              level: 0,
            })
          );
        }
        continue;
      }
    }

    expanded.push(section);
  }

  return expanded;
}

function resequence(sections: ParsedSection[]): ParsedSection[] {
  return sections.map((section, index) =>
    normalizeParsedSection({
      ...section,
      sequence: index + 1,
      pageOrSlide: index + 1,
    })
  );
}

export function collapseBlocksToRawText(sections: ParsedSection[]): string {
  return sections
    .map((section) => {
      const trail =
        section.structuralHeadingTrail.length > 0
          ? `[${section.structuralHeadingTrail.join(" > ")}] `
          : "";
      const tag = section.blockType !== "paragraph" ? `(${section.blockType}) ` : "";
      return `${trail}${tag}${section.title}\n\n${section.body}`.trim();
    })
    .join("\n\n")
    .trim();
}
