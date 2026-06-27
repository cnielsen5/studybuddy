#!/usr/bin/env tsx
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { mergeSpineL4L5Draft } from "../src/spine/spineL4L5Bundler.js";
import { loadSpineL3Draft } from "../src/spine/spineL4L5Units.js";
import { unlockRefId } from "../src/spine/spineL4L5Schema.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(__dirname, "../..");
const outPath = join(repoRoot, "content/spine/socrates-spine-l4-l5.review.md");

const { bundle, missingAnchors } = mergeSpineL4L5Draft({ repoRoot });
const spineL3 = loadSpineL3Draft(repoRoot);
const l3ById = new Map(
  spineL3.concepts.filter((c) => c.resolution_level === 3).map((c) => [c.id, c])
);

const shortId = (id: string) => id.replace(/^spine_[a-z0-9_]+?_l[45]_/, "");

const lines: string[] = [
  "# Socrates L4/L5 — Review Outline (Universal Model)",
  "",
  `**${bundle._meta.anchor_count} anchors** · ${bundle._meta.generation_date} · status: \`${bundle._meta.status}\``,
  "",
  `**Totals:** ${bundle._meta.concept_counts.level_4} L4 · ${bundle._meta.concept_counts.level_5} L5 · ${bundle._meta.concept_counts.total} child concepts`,
  "",
  "Format: **title**, spine id, level, member domain contexts, prereqs, flags.",
  "",
  "---",
  "",
];

const byAnchor = new Map<string, typeof bundle.concepts>();
for (const c of bundle.concepts) {
  const list = byAnchor.get(c.anchor_concept_id) ?? [];
  list.push(c);
  byAnchor.set(c.anchor_concept_id, list);
}

let section = 0;
for (const anchor of [...byAnchor.keys()].sort()) {
  const concepts = byAnchor.get(anchor)!;
  const l3 = l3ById.get(anchor);
  section += 1;
  lines.push(`## ${section}. ${l3?.content.title ?? anchor}`);
  lines.push("");
  lines.push(`**L3:** \`${anchor}\``);
  lines.push("");

  const l4s = concepts.filter((c) => c.resolution_level === 4);
  const l5s = concepts.filter((c) => c.resolution_level === 5);

  lines.push("### L4");
  for (const concept of l4s) {
    const domains = concept.domain_contexts.map((dc) => dc.domain_id).join(", ");
    lines.push(`- **${concept.content.title}** \`${concept.id}\``);
    lines.push(`  ${concept.content.summary.split(".")[0]}.`);
    lines.push(`  Contexts: ${domains}`);
    if (concept.dependency_graph.prerequisites.length > 0) {
      lines.push(
        `  Prereqs: ${concept.dependency_graph.prerequisites.map((p) => `\`${shortId(p)}\``).join(", ")}`
      );
    }
    if (concept.knowledge_graph._shared_concept_note) {
      lines.push(`  _[shared]_ ${concept.knowledge_graph._shared_concept_note}`);
    }
    if (concept._reviewer_note) {
      lines.push(`  _[reviewer note]_ ${concept._reviewer_note}`);
    }
    const childL5 = l5s.filter((l5) => l5.dependency_graph.parent_concept_id === concept.id);
    if (childL5.length > 0) {
      lines.push("");
      lines.push(`#### L5 (under ${concept.content.title})`);
      for (const l5 of childL5) {
        const d = l5.domain_contexts.map((dc) => dc.domain_id).join(", ");
        lines.push(`- **${l5.content.title}** \`${l5.id}\` · contexts: ${d}`);
        lines.push(`  ${l5.content.summary.split(".")[0]}.`);
        if (l5._reviewer_note) lines.push(`  _[reviewer note]_ ${l5._reviewer_note}`);
      }
    }
    lines.push("");
  }

  const orphanL5 = l5s.filter(
    (l5) => !l4s.some((l4) => l4.id === l5.dependency_graph.parent_concept_id)
  );
  if (orphanL5.length > 0) {
    lines.push("#### L5 (orphan — check parent_concept_id)");
    for (const l5 of orphanL5) {
      lines.push(`- **${l5.content.title}** \`${l5.id}\` → parent \`${l5.dependency_graph.parent_concept_id}\``);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
}

if (missingAnchors.length > 0) {
  lines.push("## Missing Anchors");
  lines.push("");
  for (const key of missingAnchors) lines.push(`- \`${key}\``);
  lines.push("");
}

for (const [title, key] of [
  ["Graph Consistency Warnings", "graph_consistency_warnings"],
  ["L5 Membership Warnings", "l5_membership_warnings"],
] as const) {
  const warnings = bundle._meta[key];
  if (warnings?.length) {
    lines.push(`## ${title} (${warnings.length})`);
    lines.push("");
    for (const w of warnings.slice(0, 40)) lines.push(`- ${w}`);
    lines.push("");
  }
}

void unlockRefId;
writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${outPath}`);
