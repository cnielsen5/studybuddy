#!/usr/bin/env tsx
/**
 * Backfills real definition/summary text on OrthoBullets taxonomy topics by
 * fetching each topic page and parsing its bullet outline.
 *
 * Input/output: content/spine/orthobullets/<slug>.taxonomy.json
 *
 * Recon (from the authored sheet) is skipped unless --force-all is passed.
 * Use --section trauma, --limit 20, --dry-run for partial runs.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ObSectionSlug } from "../src/spine/data/orthobullets/sections.js";
import {
  extractTopicPageContent,
  isPlaceholderTopicText,
} from "../src/spine/data/orthobullets/extractTopicPageContent.js";
import type { ObChapter, ObSectionTaxonomy } from "../src/spine/data/orthobullets/taxonomyTypes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");
const taxDir = join(repoRoot, "content/spine/orthobullets");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144 Safari/537.36";
const DELAY_MS = 600;

interface TaxonomyFile {
  _meta?: Record<string, unknown>;
  taxonomy: ObSectionTaxonomy;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const section = args.find((a) => a.startsWith("--section="))?.split("=")[1] as
    | ObSectionSlug
    | undefined;
  const limit = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "0") || 0;
  return {
    section,
    limit,
    dryRun: args.includes("--dry-run"),
    forceAll: args.includes("--force-all"),
    skipExisting: !args.includes("--force-all"),
  };
}

async function fetchTopicContent(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return extractTopicPageContent(await res.text());
}

function refreshChapterText(chapter: ObChapter): void {
  const defs = chapter.topics.map((t) => t.definition).filter(Boolean);
  const summaries = chapter.topics.map((t) => t.summary).filter(Boolean);
  if (defs.length === 0) return;

  const lead = defs.slice(0, 3).join(" ");
  chapter.definition =
    `OrthoBullets chapter "${chapter.title}"${chapter.field ? ` (${chapter.field})` : ""}: ` +
    lead.slice(0, 500) +
    (lead.length > 500 ? "…" : "");
  chapter.summary =
    summaries.slice(0, 2).join(" ").slice(0, 400) ||
    `${chapter.title} — ${chapter.topics.length} OrthoBullets topics.`;
}

async function backfillFile(path: string, opts: ReturnType<typeof parseArgs>) {
  const file = JSON.parse(readFileSync(path, "utf8")) as TaxonomyFile;
  const { taxonomy } = file;
  const slug = taxonomy.section;

  if (opts.section && slug !== opts.section) return null;
  if (taxonomy.provenance === "orthobullets_sheet" && !opts.forceAll) {
    console.log(`${slug}: skipped (sheet import — already has card-level definitions)`);
    return null;
  }

  let fetched = 0;
  let skipped = 0;
  let failed = 0;
  let processed = 0;

  for (const chapter of taxonomy.chapters) {
    for (const topic of chapter.topics) {
      if (opts.limit && processed >= opts.limit) break;
      processed++;

      const url = topic.source?.url;
      if (!url) {
        skipped++;
        continue;
      }
      if (opts.skipExisting && !isPlaceholderTopicText(topic.definition, topic.title)) {
        skipped++;
        continue;
      }

      try {
        const content = await fetchTopicContent(url);
        if (!content) {
          failed++;
          console.warn(`  no content: ${topic.title}`);
        } else {
          topic.definition = content.definition;
          topic.summary = content.summary;
          fetched++;
          if (opts.dryRun) console.log(`  ✓ ${topic.title}: ${content.summary.slice(0, 80)}…`);
        }
      } catch (e) {
        failed++;
        console.warn(`  failed ${topic.title}: ${(e as Error).message}`);
      }
      await sleep(DELAY_MS);
    }
    refreshChapterText(chapter);
    if (opts.limit && processed >= opts.limit) break;
  }

  if (!opts.dryRun && (fetched > 0 || opts.forceAll)) {
    file._meta = {
      ...file._meta,
      backfilled_at: new Date().toISOString(),
      backfilled_by: "scripts/backfill-orthobullets-topic-content.ts",
    };
    writeFileSync(path, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  }

  return { slug, fetched, skipped, failed, processed };
}

async function main() {
  const opts = parseArgs();
  if (!existsSync(taxDir)) {
    console.error(`Missing taxonomy dir: ${taxDir}`);
    process.exit(1);
  }

  const files = readdirSync(taxDir)
    .filter((f) => f.endsWith(".taxonomy.json"))
    .map((f) => join(taxDir, f))
    .sort();

  console.log(
    `Backfilling OrthoBullets topic content${opts.dryRun ? " (dry run)" : ""}…` +
      (opts.section ? ` section=${opts.section}` : "") +
      (opts.limit ? ` limit=${opts.limit}` : "")
  );
  console.log("Section          | Fetched | Skipped | Failed");
  console.log("-----------------+---------+---------+-------");

  let totalFetched = 0;
  for (const path of files) {
    const result = await backfillFile(path, opts);
    if (!result) continue;
    console.log(
      `${result.slug.padEnd(16)} | ${String(result.fetched).padStart(7)} | ${String(result.skipped).padStart(7)} | ${String(result.failed).padStart(6)}`
    );
    totalFetched += result.fetched;
  }

  console.log(`\nTotal topics backfilled: ${totalFetched}`);
  if (!opts.dryRun && totalFetched > 0) {
    console.log("Run: npm run build:orthobullets-spine");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
