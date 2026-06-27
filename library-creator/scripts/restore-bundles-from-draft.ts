#!/usr/bin/env tsx
/** Restore anchor bundle files from the last good socrates-spine-l4-l5.draft.json snapshot. */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type SpineL4L5AnchorBundle,
  type SpineL4L5Concept,
  validateSpineL4L5AnchorBundle,
} from "../src/spine/spineL4L5Schema.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(__dirname, "../..");
const draftPath = join(repoRoot, "content/spine/socrates-spine-l4-l5.draft.json");
const bundleDir = join(repoRoot, "content/spine/l4-l5-bundles");

const draft = JSON.parse(readFileSync(draftPath, "utf8")) as {
  concepts: SpineL4L5Concept[];
};

const byAnchor = new Map<string, SpineL4L5Concept[]>();
for (const c of draft.concepts) {
  const list = byAnchor.get(c.anchor_concept_id) ?? [];
  list.push(c);
  byAnchor.set(c.anchor_concept_id, list);
}

const existingMeta = new Map<string, SpineL4L5AnchorBundle["_meta"]>();
if (existsSync(bundleDir)) {
  for (const name of readdirSync(bundleDir).filter((n) => n.endsWith(".json"))) {
    const b = validateSpineL4L5AnchorBundle(
      JSON.parse(readFileSync(join(bundleDir, name), "utf8"))
    );
    existingMeta.set(b._meta.anchor_l3_id, b._meta);
  }
}

let written = 0;
for (const [anchor, concepts] of [...byAnchor.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const prev = existingMeta.get(anchor);
  const l4 = concepts.filter((c) => c.resolution_level === 4).length;
  const l5 = concepts.filter((c) => c.resolution_level === 5).length;
  const bundle: SpineL4L5AnchorBundle = {
    _meta: prev ?? {
      anchor_l3_id: anchor,
      anchor_primary_domain: concepts[0].knowledge_graph.primary_domain,
      model: "universal-l4-l5",
      status: "draft-for-review",
      dedup_summary: `${concepts.length} universal concepts (${l4} L4 + ${l5} L5).`,
    },
    concepts: concepts.sort((a, b) => {
      if (a.resolution_level !== b.resolution_level) return a.resolution_level - b.resolution_level;
      return a.id.localeCompare(b.id);
    }),
  };
  writeFileSync(join(bundleDir, `${anchor}.json`), `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
  written++;
}

console.log(`Restored ${written} anchor bundles from draft`);
