#!/usr/bin/env tsx
/**
 * Run the five-stage user-facing library creation pipeline from the CLI.
 *
 * Usage:
 *   npm run pipeline:create -- --text-file ./notes.md
 *   npm run pipeline:create -- --text "Week 3: Fracture healing..."
 *   npm run pipeline:create -- --dialogue --text-file ./syllabus.md
 */
import { readFileSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildIntentFromDialogue } from "../src/intent/buildIntentFromDialogue.js";
import { UserFacingLibraryPipeline } from "../src/pipeline/userFacingPipeline.js";
import type { IntentDialogueAnswers } from "../src/types/intentDialogue.js";

function parseArgs(argv: string[]) {
  let text = "";
  let textFile = "";
  let dialogue = false;
  let outDir = "";

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--text" && argv[i + 1]) {
      text = argv[++i];
    } else if (arg === "--text-file" && argv[i + 1]) {
      textFile = argv[++i];
    } else if (arg === "--dialogue") {
      dialogue = true;
    } else if (arg === "--out" && argv[i + 1]) {
      outDir = argv[++i];
    }
  }

  if (textFile) {
    text = readFileSync(textFile, "utf8");
  }

  return { text, dialogue, outDir };
}

async function main() {
  const { text, dialogue, outDir } = parseArgs(process.argv.slice(2));

  if (!text.trim()) {
    console.error(
      "Provide source text via --text or --text-file (markdown / syllabus / notes)."
    );
    process.exit(1);
  }

  const pipeline = new UserFacingLibraryPipeline();

  const result = dialogue
    ? await pipeline.runFromDialogue({ sourceText: text })
    : await pipeline.runWithIntent(
        buildIntentFromDialogue({
          purposeStatement: "CLI library from provided source text",
          audienceLevel: "undergrad",
          curriculum: { mode: "logical" },
          usagePurpose: "deep_understanding",
        }),
        { sourceText: text }
      );

  console.log("\n── Library review summary ──");
  console.log(`Concepts: ${result.review.summary.conceptCount}`);
  console.log(`Cards: ${result.review.summary.cardCount}`);
  console.log(`Questions: ${result.review.summary.questionCount}`);
  console.log(`Flags: ${result.review.flags.length}`);
  console.log(`Job: ${result.jobId}`);

  if (outDir) {
    const reviewPath = join(outDir, "library-review.json");
    writeFileSync(reviewPath, `${JSON.stringify(result.review, null, 2)}\n`);
    console.log(`Wrote ${reviewPath}`);
  }

  const { exportPath } = await pipeline.publish(result.jobId, result.review);
  console.log(`Exported: ${exportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
