#!/usr/bin/env tsx
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  appendGrowthQueueEntry,
  loadGrowthQueue,
  shouldQueuePlacement,
} from "../src/spine/spineGrowthQueue.js";
import { loadSpineIndex } from "../src/spine/spineIndex.js";
import { placeOnSpine, type SpinePlacementInput } from "../src/spine/spinePlacement.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(__dirname, "../..");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const queueFlag = process.argv.includes("--queue");
const listFlag = process.argv.includes("--list");
const jsonFile = arg("--file");

if (listFlag) {
  const queue = loadGrowthQueue(repoRoot);
  console.log(`Growth queue: ${queue.entries.length} entries`);
  for (const e of queue.entries) {
    console.log(`  [${e.status}] ${e.id}`);
    console.log(`    ${e.input.domain_id} · ${e.input.title}`);
    console.log(`    → ${e.placement.recommendation}: ${e.placement.rationale}`);
  }
  process.exit(0);
}

let input: SpinePlacementInput;

if (jsonFile) {
  input = JSON.parse(readFileSync(jsonFile, "utf8")) as SpinePlacementInput;
} else {
  const domain = arg("--domain");
  const title = arg("--title");
  const definition = arg("--definition");
  if (!domain || !title || !definition) {
    console.error(`Usage:
  check-spine-placement --domain <id> --title "..." --definition "..." [--summary "..."] [--hint <spine_id>] [--queue]
  check-spine-placement --file placement-input.json [--queue]
  check-spine-placement --list`);
    process.exit(1);
  }
  input = {
    domain_id: domain,
    title,
    definition,
    summary: arg("--summary"),
    hint_concept_id: arg("--hint"),
    source: { kind: "manual" },
  };
}

const index = loadSpineIndex(repoRoot);
const placement = placeOnSpine(index, input);

console.log(JSON.stringify({ input, placement }, null, 2));

if (queueFlag && shouldQueuePlacement(placement)) {
  const entry = appendGrowthQueueEntry(repoRoot, input, placement);
  console.error(`\nQueued: ${entry.id}`);
}
