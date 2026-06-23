import * as cheerio from "cheerio";
import { JSDOM } from "jsdom";
import type { ParsedSource } from "../types/parsedSource.js";
import { ParsedSourceSchema, normalizeParsedSection } from "../types/parsedSource.js";
import {
  collapseBlocksToRawText,
  expandDenseBlocks,
  extractContentBlocksFromHtml,
} from "./contentBlockExtractor.js";

const DEFAULT_USER_AGENT =
  "StudyBuddy-LibraryCreator/0.1 (+https://github.com/cnielsen5/studybuddy)";

export interface WebsiteIngestOptions {
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

export async function ingestWebsite(
  url: string,
  options: WebsiteIngestOptions = {}
): Promise<ParsedSource> {
  const parsedUrl = new URL(url);
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(`Unsupported URL protocol: ${parsedUrl.protocol}`);
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 30_000
  );

  let response: Response;
  try {
    response = await fetchImpl(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "text/html";
  const html = await response.text();
  const pageTitle = extractPageTitle(html, url);

  return buildParsedSourceFromHtml(html, {
    url,
    pageTitle,
    contentType,
  });
}

export function parseWebsiteHtml(
  html: string,
  url: string,
  pageTitle?: string
): ParsedSource {
  return buildParsedSourceFromHtml(html, {
    url,
    pageTitle: pageTitle ?? extractPageTitle(html, url),
    contentType: "text/html",
  });
}

function buildParsedSourceFromHtml(
  html: string,
  meta: { url: string; pageTitle: string; contentType: string }
): ParsedSource {
  const dom = new JSDOM(html, { url: meta.url });
  const contentHtml = pickContentHtml(dom.window.document, html);

  let { sections, contentRoot, notes } = extractContentBlocksFromHtml(
    contentHtml,
    { pageTitle: meta.pageTitle }
  );

  sections = expandDenseBlocks(sections).map((section) =>
    normalizeParsedSection({
      ...section,
      sourceUrl: meta.url,
      sourcePageTitle: meta.pageTitle,
    })
  );

  if (sections.length < 2) {
    notes = [
      ...notes,
      "Structured extraction yielded few blocks; trying full-page pass",
    ];
    const fallback = extractContentBlocksFromHtml(html, {
      pageTitle: meta.pageTitle,
    });
    if (fallback.sections.length > sections.length) {
      sections = expandDenseBlocks(fallback.sections).map((section) =>
        normalizeParsedSection({
          ...section,
          sourceUrl: meta.url,
          sourcePageTitle: meta.pageTitle,
        })
      );
      contentRoot = fallback.contentRoot;
      notes = [...notes, ...fallback.notes];
    }
  }

  return ParsedSourceSchema.parse({
    sourceType: "website",
    sourceUrl: meta.url,
    sourceLabel: meta.pageTitle,
    sections,
    rawText: collapseBlocksToRawText(sections),
    metadata: {
      fetchedAt: new Date().toISOString(),
      contentType: meta.contentType,
      crawlScope: "single_page",
      pageTitle: meta.pageTitle,
      contentRoot,
      extractionNotes: notes,
    },
  });
}

/**
 * Prefer the raw main content tree over Readability — educational sites often
 * lose lists/objectives when Readability merges the DOM.
 */
function pickContentHtml(document: Document, fullHtml: string): string {
  const selectors = [
    '[data-type="page"]',
    "main",
    "article",
    "#content",
    '[role="main"]',
  ];

  for (const selector of selectors) {
    const node = document.querySelector(selector);
    if (node && normalizeText(node.textContent ?? "").length > 200) {
      return node.outerHTML;
    }
  }

  return fullHtml;
}

function extractPageTitle(html: string, url: string): string {
  const $ = cheerio.load(html);
  return (
    $("title").first().text().trim() ||
    $("h1").first().text().trim() ||
    new URL(url).hostname
  );
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
