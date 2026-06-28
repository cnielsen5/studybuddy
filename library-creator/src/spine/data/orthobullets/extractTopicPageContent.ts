/**
 * Extracts definition/summary text from an OrthoBullets topic page HTML.
 * Uses the server-rendered bullet outline (topic-bullets-section).
 */
import * as cheerio from "cheerio";

export interface TopicPageContent {
  definition: string;
  summary: string;
  sectionCount: number;
}

function directText($: cheerio.CheerioAPI, el: cheerio.Element): string {
  const clone = $(el).clone();
  clone.find("ul, .topic-bullets-section__ul").remove();
  return clone.text().replace(/\s+/g, " ").trim();
}

function childBullets($: cheerio.CheerioAPI, el: cheerio.Element, level: number): string[] {
  return $(el)
    .find(`.topic-bullets-section__li.bullet_level_${level}`)
    .toArray()
    .map((node) => directText($, node))
    .filter(Boolean);
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

function splitSectionTitle(sectionText: string): { title: string; lead: string } {
  // Level-0 section nodes often concatenate the heading with immediate inline bullets.
  const m = sectionText.match(/^(.{3,120}?)(?:\s{2,}|(?=[A-Z][a-z]+ [a-z]))(.+)$/);
  if (m) return { title: m[1].trim(), lead: m[2].trim() };
  return { title: sectionText.slice(0, 80).trim(), lead: sectionText.slice(80).trim() };
}

/** Parse topic page HTML into a definition (rich) and summary (concise). */
export function extractTopicPageContent(html: string): TopicPageContent | null {
  const $ = cheerio.load(html);
  const sections = $(".topic-bullets-section__li.collapsable--section.bullet_level_0").toArray();
  if (sections.length > 0) {
    const primary = sections[0];
    const sectionText = directText($, primary);
    const subBullets = childBullets($, primary, 1);
    const { title, lead } = splitSectionTitle(sectionText);

    let definition: string;
    if (subBullets.length >= 2) {
      definition = `${title}: ${subBullets.slice(0, 6).join("; ")}.`;
    } else if (lead.length > 40) {
      definition = `${title}. ${lead}`;
    } else if (sectionText.length > 40) {
      definition = sectionText;
    } else if (sections.length > 1) {
      const second = directText($, sections[1]);
      definition = `${sectionText}. ${second}`;
    } else {
      return extractNotesFallback($);
    }

    const summaryParts = subBullets.length ? subBullets.slice(0, 2) : [lead || sectionText];
    const summary = truncate(summaryParts.join(" "), 400);

    return {
      definition: truncate(definition.replace(/\s+/g, " ").trim(), 1200),
      summary,
      sectionCount: sections.length,
    };
  }

  return extractNotesFallback($);
}

function extractNotesFallback($: cheerio.CheerioAPI): TopicPageContent | null {
  const notesEl =
    $(".topic-notes-section-text").first()[0] ??
    $(".notes-section-text-wrapper").first()[0];
  if (!notesEl) return null;

  const raw = $(notesEl).text().replace(/\s+/g, " ").trim();
  if (raw.length < 30) return null;

  const title =
    $(".page-navigation__topic-title-text").first().text().trim() ||
    $("h1").first().text().trim();

  const definition = truncate(title ? `${title}. ${raw}` : raw, 1200);
  const summary = truncate(raw, 400);

  return { definition, summary, sectionCount: 0 };
}

/** True when the taxonomy row still has placeholder text from scraping. */
export function isPlaceholderTopicText(definition: string, title: string): boolean {
  return (
    /^.+ — OrthoBullets topic in .+\.$/.test(definition) ||
    definition === `${title} — OrthoBullets topic page.` ||
    /^OrthoBullets topic page covering /.test(definition)
  );
}
