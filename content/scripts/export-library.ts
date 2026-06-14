import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { learningScienceLibrary } from "../libraries/learning-science-v1/index.ts";

const libName = process.argv[2] ?? "learning-science-v1";
const contentRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = resolve(contentRoot, "libraries", libName, "library.json");
const appPath = resolve(contentRoot, "..", "app", "public", "libraries", libName, "library.json");

const json = JSON.stringify(learningScienceLibrary, null, 2);

writeFileSync(outPath, json);
mkdirSync(dirname(appPath), { recursive: true });
writeFileSync(appPath, json);

console.log(`Exported ${libName}:`);
console.log(`  ${outPath}`);
console.log(`  ${appPath}`);
console.log(
  `  ${learningScienceLibrary.concepts.length} concepts, ` +
    `${learningScienceLibrary.relationships.length} relationships, ` +
    `${learningScienceLibrary.cards.length} cards, ` +
    `${learningScienceLibrary.questions.length} questions`
);
