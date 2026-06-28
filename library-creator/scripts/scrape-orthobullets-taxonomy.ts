#!/usr/bin/env tsx
/**
 * Scrapes the real OrthoBullets topic taxonomy (Field → Chapter → Topic) for
 * each subspecialty directly from the public specialty dashboards, and writes a
 * committed per-section taxonomy artifact the spine generator consumes.
 *
 * Source:  https://www.orthobullets.com/user/dashboard?id=all&specialty=<id>&menu=topic
 *          (the left "page-menu" cascade is server-rendered into the HTML)
 * Output:  content/spine/orthobullets/<slug>.taxonomy.json
 *
 * OrthoBullets "Fields" are collapsed into the section (kept as `field` metadata);
 * Chapters → L4, Topics → L5 (matches the agreed scheme + the Recon sheet import).
 *
 * Recon is skipped by default (already imported from the authored sheet, which
 * carries richer card counts). Pass `--include-recon` to scrape it too.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import type { ObSectionSlug } from "../src/spine/data/orthobullets/sections.js";
import type {
  ObChapter,
  ObSectionTaxonomy,
  ObTopic,
} from "../src/spine/data/orthobullets/taxonomyTypes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");
const outDir = join(repoRoot, "content/spine/orthobullets");
const BASE = "https://www.orthobullets.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144 Safari/537.36";

interface SpecialtySpec {
  slug: ObSectionSlug;
  name: string;
  specialtyId: number;
}

const SPECIALTIES: SpecialtySpec[] = [
  { slug: "trauma", name: "Trauma", specialtyId: 1 },
  { slug: "spine", name: "Spine", specialtyId: 2 },
  { slug: "shoulder_elbow", name: "Shoulder & Elbow", specialtyId: 3 },
  { slug: "knee_sports", name: "Knee & Sports", specialtyId: 225 },
  { slug: "pediatrics", name: "Pediatrics", specialtyId: 4 },
  { slug: "recon", name: "Recon", specialtyId: 5 },
  { slug: "hand", name: "Hand", specialtyId: 6 },
  { slug: "foot_ankle", name: "Foot & Ankle", specialtyId: 7 },
  { slug: "pathology", name: "Pathology", specialtyId: 8 },
  { slug: "basic_science", name: "Basic Science", specialtyId: 9 },
  { slug: "anatomy", name: "Anatomy", specialtyId: 10 },
];

const NON_TOPIC = /^(high-yield topics|importants? rank list|view all|see all|)$/i;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function directText($: cheerio.CheerioAPI, el: cheerio.Element): string {
  const t = $(el)
    .contents()
    .filter((_, n) => n.type === "text")
    .text()
    .trim();
  return t || $(el).text().trim();
}

interface RawField {
  field: string;
  chapters: Array<{ chapter: string; topics: Array<{ title: string; href: string | null }> }>;
}

function parseTaxonomy(html: string): RawField[] {
  const $ = cheerio.load(html);
  // Two .page-menu__menu blocks can exist; use the one with the most topics.
  const menus = $(".page-menu__menu").toArray();
  const menu =
    menus
      .map((m) => ({ m, n: $(m).find(".page-menu__link--topic").length }))
      .sort((a, b) => b.n - a.n)[0]?.m ?? null;
  if (!menu) return [];

  const els = $(menu)
    .find(".page-menu__chapter, .page-menu__section-header--topic, .page-menu__link--topic")
    .toArray();

  const fields: RawField[] = [];
  let cf: RawField | null = null;
  let cc: RawField["chapters"][0] | null = null;

  for (const el of els) {
    const cls = $(el).attr("class") || "";
    if (cls.includes("page-menu__chapter")) {
      cf = { field: directText($, el), chapters: [] };
      fields.push(cf);
      cc = null;
    } else if (cls.includes("page-menu__section-header--topic")) {
      cc = { chapter: directText($, el), topics: [] };
      if (!cf) {
        cf = { field: "", chapters: [] };
        fields.push(cf);
      }
      cf.chapters.push(cc);
    } else {
      const title = $(el).text().trim();
      if (NON_TOPIC.test(title) || !cc) continue;
      const href = $(el).is("a") ? $(el).attr("href") : $(el).find("a").attr("href");
      cc.topics.push({ title, href: href ?? null });
    }
  }
  return fields;
}

function topicIdFromHref(href: string | null): string | undefined {
  if (!href) return undefined;
  const m = href.match(/\/(\d{3,7})\//);
  return m?.[1];
}

function absUrl(href: string | null): string | undefined {
  if (!href) return undefined;
  const clean = href.split("?")[0];
  return clean.startsWith("http") ? clean : `${BASE}${clean}`;
}

function toTaxonomy(spec: SpecialtySpec, fields: RawField[]): ObSectionTaxonomy {
  const usedShort = new Set<string>();
  const uniq = (base: string) => {
    let s = base;
    let n = 2;
    while (usedShort.has(s)) s = `${base}_${n++}`;
    usedShort.add(s);
    return s;
  };

  const seenTopicHref = new Set<string>();
  const chapters: ObChapter[] = [];

  for (const field of fields) {
    for (const ch of field.chapters) {
      // Dedupe topics by href across the whole section (handles duplicate menus).
      const topicsRaw = ch.topics.filter((t) => {
        const key = t.href || `${ch.chapter}::${t.title}`;
        if (seenTopicHref.has(key)) return false;
        seenTopicHref.add(key);
        return true;
      });
      if (topicsRaw.length === 0) continue;

      const chShort = uniq(`ob_${spec.slug}_${slugify(ch.chapter)}`);
      const topics: ObTopic[] = topicsRaw.map((t) => ({
        shortName: uniq(`${chShort}_${slugify(t.title)}`),
        title: t.title,
        definition: `${t.title} — OrthoBullets topic in ${ch.chapter} (${spec.name}).`,
        summary: `OrthoBullets topic "${t.title}" under chapter "${ch.chapter}".`,
        obTopicId: topicIdFromHref(t.href),
        source: {
          source: "OrthoBullets",
          chapter: ch.chapter,
          section: t.title,
          url: absUrl(t.href),
        },
      }));

      chapters.push({
        shortName: chShort,
        title: ch.chapter,
        field: field.field || undefined,
        definition: `OrthoBullets ${spec.name} chapter "${ch.chapter}"${
          field.field ? ` (${field.field})` : ""
        } with ${topics.length} topics: ${topics.map((t) => t.title).slice(0, 6).join(", ")}${
          topics.length > 6 ? ", …" : ""
        }.`,
        summary: `${spec.name} chapter "${ch.chapter}" — ${topics.length} OrthoBullets topics.`,
        topics,
        source: { source: "OrthoBullets", chapter: ch.chapter },
      });
    }
  }

  return {
    section: spec.slug,
    provenance: "orthobullets_site",
    obDataPending: false,
    notes:
      "Scraped from the OrthoBullets specialty dashboard (Field → Chapter → Topic). " +
      "Fields collapsed into the section; chapters → L4, topics → L5.",
    chapters,
  };
}

async function fetchHtml(specialtyId: number): Promise<string> {
  const url = `${BASE}/user/dashboard?id=all&specialty=${specialtyId}&menu=topic&expandLeftMenu=true`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for specialty ${specialtyId}`);
  return res.text();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const includeRecon = process.argv.includes("--include-recon");
  mkdirSync(outDir, { recursive: true });
  console.log("Scraping OrthoBullets taxonomy…\n");
  console.log("Section          | Fields | Chapters | Topics");
  console.log("-----------------+--------+----------+-------");

  for (const spec of SPECIALTIES) {
    if (spec.slug === "recon" && !includeRecon) {
      console.log(`${spec.name.padEnd(16)} |   (skipped — using authored sheet)`);
      continue;
    }
    const html = await fetchHtml(spec.specialtyId);
    const fields = parseTaxonomy(html);
    const taxonomy = toTaxonomy(spec, fields);
    const chapterCount = taxonomy.chapters.length;
    const topicCount = taxonomy.chapters.reduce((n, c) => n + c.topics.length, 0);
    const fieldCount = new Set(taxonomy.chapters.map((c) => c.field)).size;

    const outPath = join(outDir, `${spec.slug}.taxonomy.json`);
    writeFileSync(
      outPath,
      `${JSON.stringify(
        {
          _meta: {
            source: `${BASE}/user/dashboard?id=all&specialty=${spec.specialtyId}&menu=topic`,
            generated_by: "scripts/scrape-orthobullets-taxonomy.ts",
            scraped_at: new Date().toISOString(),
            section: spec.slug,
            field_count: fieldCount,
            chapter_count: chapterCount,
            topic_count: topicCount,
          },
          taxonomy,
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    console.log(
      `${spec.name.padEnd(16)} | ${String(fieldCount).padStart(6)} | ${String(chapterCount).padStart(8)} | ${String(topicCount).padStart(6)}`
    );
    await sleep(800);
  }
  console.log(`\nWrote per-section taxonomy JSON to ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
