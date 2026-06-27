#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { importSheetsToLibraryBundle } from "../src/import/sheetsToLibraryBundle.js";
import { formatLibraryExportSummary } from "../src/export/libraryConformance.js";

const SHEET_ID = "1PRVQbOi-JnME8Qt84LLQt3_0QJJYaN_d3OnLc9yCS2k";
const GIDS = {
  concepts: "0",
  cards: "620293628",
  questions: "233429042",
};

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const publish = !args.includes("--draft");
  const outArgIndex = args.indexOf("--out");
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const defaultOut = resolve(
    packageRoot,
    "..",
    "app",
    "public",
    "libraries",
    "orthobullets_recon",
    "library.json"
  );
  const outPath =
    outArgIndex >= 0 ? resolve(args[outArgIndex + 1]) : defaultOut;

  const useCached = args.includes("--cached");
  const jobsDir = resolve(packageRoot, ".jobs");

  const [conceptsCsv, cardsCsv, questionsCsv] = await Promise.all([
    loadSheetCsv(SHEET_ID, GIDS.concepts, resolve(jobsDir, "orthobullets-sheet.csv"), useCached),
    loadSheetCsv(SHEET_ID, GIDS.cards, resolve(jobsDir, "sheet-620293628.csv"), useCached),
    loadSheetCsv(
      SHEET_ID,
      GIDS.questions,
      resolve(jobsDir, "sheet-233429042.csv"),
      useCached
    ),
  ]);

  const bundle = importSheetsToLibraryBundle({
    conceptsCsv,
    cardsCsv,
    questionsCsv,
    publish,
  });

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(bundle, null, 2), "utf8");

  console.log(formatLibraryExportSummary(bundle));
  console.log(`\nWrote ${outPath}`);
  console.log(`\nApp config: VITE_LIBRARY_ID=${bundle.manifest.id}`);
  console.log(`Fetch path: /libraries/orthobullets_recon/library.json`);
}

async function loadSheetCsv(
  sheetId: string,
  gid: string,
  cachePath: string,
  useCached: boolean
): Promise<string> {
  if (useCached) {
    return readFile(cachePath, "utf8");
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download sheet gid=${gid}: ${response.status}`);
  }
  return response.text();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
