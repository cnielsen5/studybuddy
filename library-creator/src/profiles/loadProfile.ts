import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DomainArchetypeId, DomainProfile } from "../types/domainProfile.js";
import { DomainProfileSchema } from "../types/domainProfile.js";

const PROFILES_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "profiles"
);

export function loadDomainProfile(archetypeId: DomainArchetypeId): DomainProfile {
  const path = join(PROFILES_DIR, `${archetypeId}.json`);
  const raw = readFileSync(path, "utf8");
  return DomainProfileSchema.parse(JSON.parse(raw));
}

export function listDomainArchetypes(): DomainArchetypeId[] {
  return ["anatomy", "math", "chemistry", "history", "physics", "law", "mixed"];
}

/** Simple keyword heuristic until concept extraction suggests a profile. */
export function suggestDomainArchetype(domain: string): DomainArchetypeId {
  const lower = domain.toLowerCase();
  if (lower.includes("anat") || lower.includes("physio") || lower.includes("medicine")) {
    return "anatomy";
  }
  if (lower.includes("chem") || lower.includes("organic") || lower.includes("biochem")) {
    return "chemistry";
  }
  if (lower.includes("math") || lower.includes("calculus") || lower.includes("algebra")) {
    return "math";
  }
  if (lower.includes("physic")) {
    return "physics";
  }
  if (lower.includes("history") || lower.includes("humanities")) {
    return "history";
  }
  if (lower.includes("law") || lower.includes("legal")) {
    return "law";
  }
  return "mixed";
}
