#!/usr/bin/env tsx
/**
 * Human-readable L1–L3 spine outline for review (no JSON schema noise).
 * Output: content/spine/socrates-spine-l1-l3.review.md
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSpineGraphDraft } from "../src/spine/spineBuilder.js";
import type { SpineConcept } from "../src/spine/spineSchema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../../content/spine/socrates-spine-l1-l3.review.md");

function byTitle(a: SpineConcept, b: SpineConcept): number {
  return a.content.title.localeCompare(b.content.title, undefined, { sensitivity: "base" });
}

function formatL3Line(concept: SpineConcept): string {
  const shared = concept.knowledge_graph._shared_concept_note;
  const domains = concept.domain_contexts.map((c) => c.domain_id).join(", ");
  const parts = [`- **${concept.content.title}**`, `\`${concept.id}\``];
  if (shared) {
    parts.push("_[shared]_");
  }
  if (concept.domain_contexts.length > 1) {
    parts.push(`(${domains})`);
  }
  return parts.join(" ");
}

function buildReviewMarkdown(): string {
  const bundle = buildSpineGraphDraft();
  const byId = new Map(bundle.concepts.map((c) => [c.id, c]));

  const l1 = bundle.concepts.filter((c) => c.resolution_level === 1).sort(byTitle);
  const l2 = bundle.concepts.filter((c) => c.resolution_level === 2);
  const l3 = bundle.concepts.filter((c) => c.resolution_level === 3);

  const l2ByParent = new Map<string, SpineConcept[]>();
  for (const node of l2) {
    const parent = node.dependency_graph.parent_concept_id;
    if (!parent) continue;
    const list = l2ByParent.get(parent) ?? [];
    list.push(node);
    l2ByParent.set(parent, list);
  }
  for (const list of l2ByParent.values()) {
    list.sort(byTitle);
  }

  const l3ByParent = new Map<string, SpineConcept[]>();
  for (const node of l3) {
    const parent = node.dependency_graph.parent_concept_id;
    if (!parent) continue;
    const list = l3ByParent.get(parent) ?? [];
    list.push(node);
    l3ByParent.set(parent, list);
  }
  for (const list of l3ByParent.values()) {
    list.sort(byTitle);
  }

  const sharedCount = l3.filter((c) => c.knowledge_graph._shared_concept_note).length;
  const lines: string[] = [
    "# Socrates Spine — L1–L3 Review Outline",
    "",
    `Generated from spine builder. **${l1.length}** domains · **${l2.length}** L2 subdivisions · **${l3.length}** L3 concepts (${sharedCount} shared).`,
    "",
    "Format: title, spine id, optional _[shared]_ flag, optional domain contexts.",
    "",
    "---",
    "",
  ];

  for (const domain of l1) {
    lines.push(`## ${domain.content.title}`);
    lines.push("");
    lines.push(`\`${domain.id}\``);
    lines.push("");

    const subdivisions = l2ByParent.get(domain.id) ?? [];
    for (const sub of subdivisions) {
      lines.push(`### ${sub.content.title}`);
      lines.push("");
      lines.push(`\`${sub.id}\``);

      const l2Unlocks = sub.dependency_graph.unlocks.filter((id) => byId.get(id)?.resolution_level === 2);
      if (l2Unlocks.length > 0) {
        const labels = l2Unlocks
          .map((id) => byId.get(id)?.content.title ?? id)
          .join(", ");
        lines.push("");
        lines.push(`L2 gates → ${labels}`);
      }

      lines.push("");

      const concepts = l3ByParent.get(sub.id) ?? [];
      if (concepts.length === 0) {
        lines.push("_No L3 concepts under this subdivision._");
      } else {
        for (const concept of concepts) {
          lines.push(formatL3Line(concept));
        }
      }
      lines.push("");
    }

    lines.push("---");
    lines.push("");
  }

  lines.push("## Shared L3 concepts (detail)");
  lines.push("");
  for (const concept of l3.filter((c) => c.knowledge_graph._shared_concept_note).sort(byTitle)) {
    lines.push(`### ${concept.content.title}`);
    lines.push("");
    lines.push(`\`${concept.id}\``);
    lines.push("");
    lines.push(`> ${concept.knowledge_graph._shared_concept_note}`);
    lines.push("");
    lines.push(`Domains: ${concept.domain_contexts.map((c) => c.domain_id).join(", ")}`);
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

const markdown = buildReviewMarkdown();
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, markdown, "utf8");
console.log(`Wrote ${outPath}`);
