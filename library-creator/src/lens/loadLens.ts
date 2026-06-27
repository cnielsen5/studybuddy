import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadSpineIndex } from "../spine/spineIndex.js";
import {
  parseCurriculumLens,
  validateCurriculumLensStructure,
  type CurriculumLens,
  type CurriculumLensValidationIssue,
} from "../types/curriculumLens.js";

function loadOrthoDraftSpineIds(repoRoot: string): Set<string> {
  const ids = new Set<string>();
  const l23Path = join(repoRoot, "content/spine/drafts/orthopaedic-surgery-l2-l3.draft.json");
  const l45Path = join(repoRoot, "content/spine/drafts/orthopaedic-l4-l5.draft.json");
  if (existsSync(l23Path)) {
    const draft = JSON.parse(readFileSync(l23Path, "utf8")) as {
      l2_root?: { id: string };
      hub_concepts?: Array<{ id: string }>;
      concepts?: Array<{ id: string }>;
    };
    if (draft.l2_root?.id) ids.add(draft.l2_root.id);
    for (const c of [...(draft.hub_concepts ?? []), ...(draft.concepts ?? [])]) {
      ids.add(c.id);
    }
  }
  if (existsSync(l45Path)) {
    const draft = JSON.parse(readFileSync(l45Path, "utf8")) as {
      concepts?: Array<{ id: string }>;
    };
    for (const c of draft.concepts ?? []) ids.add(c.id);
  }
  return ids;
}

export function loadCurriculumLensFile(filePath: string): CurriculumLens {
  const raw = JSON.parse(readFileSync(filePath, "utf8"));
  return parseCurriculumLens(raw);
}

export function loadCurriculumLensesFromDir(dir: string): CurriculumLens[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => loadCurriculumLensFile(join(dir, name)));
}

export function validateLensFile(
  filePath: string,
  repoRoot?: string
): CurriculumLensValidationIssue[] {
  const lens = loadCurriculumLensFile(filePath);
  let knownSpineIds: Set<string> | undefined;
  if (repoRoot) {
    knownSpineIds = new Set(loadSpineIndex(repoRoot).byId.keys());
    if (lens.id.includes("orthopaedic")) {
      for (const id of loadOrthoDraftSpineIds(repoRoot)) knownSpineIds.add(id);
    }
  }
  return validateCurriculumLensStructure(lens, { knownSpineIds });
}
