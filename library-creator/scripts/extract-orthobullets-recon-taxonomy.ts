#!/usr/bin/env tsx
/**
 * Extracts the real OrthoBullets Recon taxonomy from the authored sheet into a
 * committed artifact the spine generator + lens can consume.
 *
 * Input (gitignored): library-creator/.jobs/orthobullets-sheet.csv
 * Output (committed):  content/spine/orthobullets/recon.taxonomy.json
 *
 * Sheet → taxonomy mapping (OrthoBullets "Fields" collapsed into the section):
 *   category / subcategory  → OrthoBullets "Field" (collapsed; kept as metadata)
 *   topic                   → Chapter (L4)
 *   subtopic                → Topic   (L5)
 *   concept_title rows      → card-level content under the topic
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ObChapter,
  ObSectionTaxonomy,
  ObTopic,
} from "../src/spine/data/orthobullets/taxonomyTypes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");
const csvPath = join(repoRoot, "library-creator/.jobs/orthobullets-sheet.csv");
const outPath = join(repoRoot, "content/spine/orthobullets/recon.taxonomy.json");

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") field += ch;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

interface Row {
  field: string;
  chapter: string;
  topic: string;
  conceptTitle: string;
  definition: string;
  summary: string;
}

if (!existsSync(csvPath)) {
  console.error(`Missing sheet: ${csvPath}`);
  console.error("This script needs the gitignored OrthoBullets sheet to refresh the taxonomy.");
  process.exit(1);
}

const rows = parseCsv(readFileSync(csvPath, "utf8"));
const header = rows[0];
const col = (name: string) => header.indexOf(name);
const idx = {
  library: col("Library"),
  category: col("category"),
  subcategory: col("subcategory"),
  topic: col("topic"),
  subtopic: col("subtopic"),
  title: col("concept_title"),
  definition: col("concept_definition"),
  summary: col("concept_summary"),
};

const data: Row[] = rows
  .slice(1)
  .filter((r) => (r[idx.title] || "").trim())
  .map((r) => ({
    field: (r[idx.category] || "").trim(),
    chapter: (r[idx.topic] || "").trim(),
    topic: (r[idx.subtopic] || "").trim(),
    conceptTitle: (r[idx.title] || "").trim(),
    definition: (r[idx.definition] || "").trim(),
    summary: (r[idx.summary] || "").trim(),
  }));

// Group: chapter → topic → rows (all collapsed under the single Recon section).
const chapterMap = new Map<string, { field: string; topics: Map<string, Row[]> }>();
for (const r of data) {
  if (!r.chapter || !r.topic) continue;
  if (!chapterMap.has(r.chapter)) chapterMap.set(r.chapter, { field: r.field, topics: new Map() });
  const ch = chapterMap.get(r.chapter)!;
  if (!ch.topics.has(r.topic)) ch.topics.set(r.topic, []);
  ch.topics.get(r.topic)!.push(r);
}

function pickTopicText(rowsForTopic: Row[], topicTitle: string): { definition: string; summary: string } {
  // Prefer an "Introduction"/overview row, else the longest definition.
  const intro = rowsForTopic.find(
    (r) => /introduction|overview/i.test(r.conceptTitle) && r.definition
  );
  const chosen =
    intro ??
    [...rowsForTopic].filter((r) => r.definition).sort((a, b) => b.definition.length - a.definition.length)[0];
  if (chosen) {
    return {
      definition: chosen.definition,
      summary: chosen.summary || chosen.definition,
    };
  }
  return {
    definition: `${topicTitle} — OrthoBullets topic page.`,
    summary: `OrthoBullets topic page covering ${topicTitle}.`,
  };
}

const chapters: ObChapter[] = [];
for (const [chapterTitle, { field, topics }] of chapterMap) {
  const chSlug = slug(chapterTitle);
  const obTopics: ObTopic[] = [];
  for (const [topicTitle, topicRows] of topics) {
    const { definition, summary } = pickTopicText(topicRows, topicTitle);
    obTopics.push({
      shortName: `ob_recon_${chSlug}_${slug(topicTitle)}`,
      title: topicTitle,
      definition,
      summary,
      cardCount: topicRows.length,
      source: { source: "OrthoBullets", chapter: chapterTitle, section: topicTitle },
    });
  }
  chapters.push({
    shortName: `ob_recon_${chSlug}`,
    title: chapterTitle,
    field,
    definition: `OrthoBullets Recon chapter covering ${obTopics.length} topics: ${obTopics
      .map((t) => t.title)
      .slice(0, 6)
      .join(", ")}${obTopics.length > 6 ? ", …" : ""}.`,
    summary: `Reconstruction chapter "${chapterTitle}" (${field}) with ${obTopics.length} OrthoBullets topics.`,
    topics: obTopics,
    source: { source: "OrthoBullets", chapter: chapterTitle },
  });
}

chapters.sort((a, b) => (a.field || "").localeCompare(b.field || "") || a.title.localeCompare(b.title));

const taxonomy: ObSectionTaxonomy = {
  section: "recon",
  provenance: "orthobullets_sheet",
  obDataPending: false,
  notes:
    "Extracted from orthobullets-sheet.csv. OrthoBullets 'Fields' (Hip/Knee Reconstruction, Recon Science) collapsed into the Recon section; preserved on each chapter via `field`.",
  chapters,
};

const totalTopics = chapters.reduce((n, c) => n + c.topics.length, 0);
const totalCards = chapters.reduce(
  (n, c) => n + c.topics.reduce((m, t) => m + (t.cardCount ?? 0), 0),
  0
);

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  `${JSON.stringify(
    {
      _meta: {
        source: "library-creator/.jobs/orthobullets-sheet.csv",
        generated_by: "scripts/extract-orthobullets-recon-taxonomy.ts",
        section: "recon",
        chapter_count: chapters.length,
        topic_count: totalTopics,
        source_card_rows: totalCards,
      },
      taxonomy,
    },
    null,
    2
  )}\n`,
  "utf8"
);

console.log(`Wrote ${outPath}`);
console.log(`Chapters (L4): ${chapters.length} | Topics (L5): ${totalTopics} | source card rows: ${totalCards}`);
console.log("\nFields collapsed into Recon:");
for (const f of new Set(chapters.map((c) => c.field))) {
  const chs = chapters.filter((c) => c.field === f);
  console.log(`  ${f}: ${chs.length} chapters, ${chs.reduce((n, c) => n + c.topics.length, 0)} topics`);
}
