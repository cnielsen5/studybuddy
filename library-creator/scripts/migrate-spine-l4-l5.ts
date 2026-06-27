#!/usr/bin/env tsx
import { readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { migrateLegacyToUniversal } from "../src/spine/spineL4L5Migrate.js";
import { validateSpineL4L5AnchorBundle } from "../src/spine/spineL4L5Schema.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(__dirname, "../..");
const bundleDir = join(repoRoot, "content/spine/l4-l5-bundles");
const sampleDir = join(repoRoot, "content/spine/l4-l5-samples");
const reviewPath = join(repoRoot, "content/spine/socrates-l4-l5-migration.review.md");

const apply = process.argv.includes("--apply");

const result = migrateLegacyToUniversal(repoRoot);

// Validate every produced anchor bundle up front.
let validated = 0;
for (const anchor of result.anchorBundles) {
  validateSpineL4L5AnchorBundle(anchor);
  validated += 1;
}

const totalConcepts = result.anchorBundles.reduce((s, a) => s + a.concepts.length, 0);
const totalL4 = result.anchorBundles.reduce(
  (s, a) => s + a.concepts.filter((c) => c.resolution_level === 4).length,
  0
);
const totalL5 = totalConcepts - totalL4;
const multiContextConcepts = result.anchorBundles.reduce(
  (s, a) => s + a.concepts.filter((c) => c.domain_contexts.length > 1).length,
  0
);

console.log(`Migration ${apply ? "(APPLY)" : "(dry-run)"}:`);
console.log(`  anchors:           ${result.anchorBundles.length}`);
console.log(`  universal concepts: ${totalConcepts} (L4=${totalL4} L5=${totalL5})`);
console.log(`  multi-context:     ${multiContextConcepts}`);
console.log(`  id remaps:         ${result.idRemap.size}`);
console.log(`  merge proposals:   ${result.proposals.length}`);
console.log(`  id collisions:     ${result.collisions.length}`);
console.log(`  unmapped edges:    ${result.unmappedEdges.length}`);
console.log(`  validated bundles: ${validated}`);

// --- Review / proposals markdown ---
const lines: string[] = [
  "# Socrates L4/L5 — Universal Migration Report",
  "",
  `Migrated **${result.idRemap.size}** per-context concepts into **${totalConcepts}** universal concepts across **${result.anchorBundles.length}** anchors.`,
  "",
  `- L4: ${totalL4} · L5: ${totalL5}`,
  `- Multi-context concepts (shared across ≥2 domains): **${multiContextConcepts}**`,
  `- Auto-merge: slug-equal OR title-equal OR title Dice ≥ 0.82`,
  "",
  "---",
  "",
  "## Merged multi-context concepts (auto)",
  "",
];

for (const anchor of result.anchorBundles) {
  const merged = anchor.concepts.filter((c) => c.domain_contexts.length > 1);
  if (merged.length === 0) continue;
  lines.push(`### ${anchor._meta.anchor_l3_id}`);
  lines.push("");
  for (const c of merged) {
    const domains = c.domain_contexts.map((dc) => dc.domain_id).join(", ");
    lines.push(`- **${c.content.title}** \`${c.id}\` — L${c.resolution_level} · contexts: ${domains}`);
    if (c._reviewer_note) lines.push(`  - _${c._reviewer_note}_`);
  }
  lines.push("");
}

if (result.proposals.length > 0) {
  lines.push("---");
  lines.push("");
  lines.push("## Candidate merges to review (NOT auto-merged)");
  lines.push("");
  lines.push("These pairs are similar but below the auto-merge threshold. Confirm whether they should be merged.");
  lines.push("");
  const byAnchor = new Map<string, typeof result.proposals>();
  for (const p of result.proposals) {
    const list = byAnchor.get(p.anchor) ?? [];
    list.push(p);
    byAnchor.set(p.anchor, list);
  }
  for (const [anchor, props] of byAnchor) {
    lines.push(`### ${anchor}`);
    lines.push("");
    for (const p of props) {
      lines.push(`- ${p.reason}`);
      for (const m of p.members) lines.push(`  - \`${m}\``);
    }
    lines.push("");
  }
}

if (result.collisions.length > 0) {
  lines.push("---");
  lines.push("");
  lines.push("## Canonical ID collisions (auto-suffixed — review)");
  lines.push("");
  for (const c of result.collisions) lines.push(`- \`${c}\``);
  lines.push("");
}

if (result.unmappedEdges.length > 0) {
  lines.push("---");
  lines.push("");
  lines.push("## Unmapped dependency edges (dangling — review)");
  lines.push("");
  for (const e of result.unmappedEdges.slice(0, 60)) {
    lines.push(`- \`${e.from}\` → \`${e.to}\``);
  }
  lines.push("");
}

writeFileSync(reviewPath, `${lines.join("\n")}\n`, "utf8");
console.log(`\nWrote review: ${reviewPath}`);

if (!apply) {
  console.log("\nDry-run only. Re-run with --apply to write anchor files and delete legacy per-context bundles.");
  process.exit(0);
}

// --- APPLY: clear legacy per-context files, write universal anchor files ---
for (const name of readdirSync(bundleDir)) {
  if (name.endsWith(".json")) rmSync(join(bundleDir, name));
}
for (const anchor of result.anchorBundles) {
  const outPath = join(bundleDir, `${anchor._meta.anchor_l3_id}.json`);
  writeFileSync(outPath, `${JSON.stringify(anchor, null, 2)}\n`, "utf8");
}
console.log(`Wrote ${result.anchorBundles.length} universal anchor files to ${bundleDir}`);

if (existsSync(sampleDir)) {
  rmSync(sampleDir, { recursive: true, force: true });
  console.log(`Deleted legacy samples dir: ${sampleDir}`);
}
