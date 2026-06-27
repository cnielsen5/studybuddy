#!/usr/bin/env tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGenerationUnitsFromRepo } from "../src/spine/spineL4L5Units.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");
const outPath = join(repoRoot, "content/spine/l4-l5-generation-units.json");

const units = loadGenerationUnitsFromRepo(repoRoot);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify({ unit_count: units.length, units }, null, 2)}\n`, "utf8");
console.log(`Wrote ${units.length} generation units to ${outPath}`);
