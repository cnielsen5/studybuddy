#!/usr/bin/env tsx
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadAllAnchorConcepts,
  parseMigrationReviewProposals,
  scanMergeProposals,
  type MergeProposal,
} from "../src/spine/spineL4L5MergeScan.js";
import { loadGenerationUnitsFromRepo } from "../src/spine/spineL4L5Units.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(__dirname, "../..");
const outPath = join(repoRoot, "content/spine/socrates-l4-l5-merge-proposals.review.md");
const jsonPath = join(repoRoot, "content/spine/socrates-l4-l5-merge-proposals.json");
const migrationPath = join(repoRoot, "content/spine/socrates-l4-l5-migration.review.md");

const concepts = loadAllAnchorConcepts(repoRoot);
const scanned = scanMergeProposals(concepts);

let migration: MergeProposal[] = [];
if (existsSync(migrationPath)) {
  migration = parseMigrationReviewProposals(readFileSync(migrationPath, "utf8"));
}

// Dedupe migration vs scanned by member pair
const memberKey = (p: MergeProposal) => p.members.slice().sort().join("|");
const scannedKeys = new Set(scanned.filter((p) => p.members.length === 2).map(memberKey));
const migrationUnique = migration.filter(
  (p) => p.members.length < 2 || !scannedKeys.has(memberKey(p))
);

const all = [...scanned, ...migrationUnique];

const byKind = new Map<string, MergeProposal[]>();
for (const p of all) {
  const list = byKind.get(p.kind) ?? [];
  list.push(p);
  byKind.set(p.kind, list);
}

const units = loadGenerationUnitsFromRepo(repoRoot);
const domains = [...new Set(units.map((u) => u.domain_id))].sort();

const lines: string[] = [
  "# Socrates L4/L5 — Merge & Consolidation Proposals (Master Review List)",
  "",
  `Generated **${all.length}** proposals for human review. **Do not merge automatically.**`,
  "",
  `- Live scan: ${scanned.length}`,
  `- Migration carryover (not duplicated in scan): ${migrationUnique.length}`,
  `- Universal concepts scanned: ${concepts.length}`,
  `- Anchors: ${new Set(concepts.map((c) => c._anchor)).size}`,
  "",
  "## Domain coverage (generation units)",
  "",
  "| Domain | Units | Status |",
  "|--------|-------|--------|",
];

for (const dom of domains) {
  const domUnits = units.filter((u) => u.domain_id === dom);
  lines.push(`| ${dom} | ${domUnits.length} | L4/L5 present for all units |`);
}

lines.push("");
lines.push("---");
lines.push("");

const kindTitles: Record<string, string> = {
  depth_reconciled: "Depth reconciled (confirm L4 vs L5)",
  cross_anchor_shared_note: "Shared concept notes (_shared_concept_note)",
  cross_anchor_same_domain: "Cross-anchor similarity (same domain)",
  within_anchor: "Within-anchor similarity (not auto-merged)",
  context_addition: "Shared concept flags (context addition needed)",
  migration_skipped: "Migration pass (below auto-merge threshold)",
};

for (const [kind, title] of Object.entries(kindTitles)) {
  const items = byKind.get(kind);
  if (!items?.length) continue;
  lines.push(`## ${title} (${items.length})`);
  lines.push("");

  const byAnchor = new Map<string, MergeProposal[]>();
  for (const p of items) {
    const key = p.anchor ?? "_global";
    const list = byAnchor.get(key) ?? [];
    list.push(p);
    byAnchor.set(key, list);
  }

  for (const [anchor, props] of [...byAnchor.entries()].sort()) {
    if (anchor !== "_global") {
      lines.push(`### ${anchor}`);
      lines.push("");
    }
    for (const p of props) {
      lines.push(`- **${p.reason}**`);
      if (p.members.length) {
        for (const m of p.members) lines.push(`  - \`${m}\``);
      }
      lines.push(`  - _Action:_ ${p.suggestedAction}`);
      if (p.sharedNote) lines.push(`  - _Note:_ ${p.sharedNote}`);
      if (p.domains?.length) lines.push(`  - _Domains:_ ${p.domains.join(", ")}`);
      lines.push("");
    }
  }
  lines.push("---");
  lines.push("");
}

writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
writeFileSync(
  jsonPath,
  `${JSON.stringify({ generated: new Date().toISOString().slice(0, 10), proposal_count: all.length, proposals: all }, null, 2)}\n`,
  "utf8"
);

console.log(`Wrote ${outPath}`);
console.log(`Wrote ${jsonPath}`);
console.log(`Total proposals: ${all.length}`);
for (const [kind, items] of byKind) {
  console.log(`  ${kind}: ${items.length}`);
}
