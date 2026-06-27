import type { LibraryCreationIntent } from "../types/intent.js";

const SPINE_DOMAIN_ALIASES: Record<string, string> = {
  mixed: "mixed",
  general: "mixed",
  medicine: "medicine_clinical",
  clinical: "medicine_clinical",
  preclinical: "medicine_preclinical",
  orthopaedic: "medicine_clinical",
  orthopedic: "medicine_clinical",
  math: "mathematics",
  chemistry: "chemistry",
  physics: "physics",
  biology: "biology",
  psychology: "psychology_neuroscience",
};

/** Resolve spine domain_id for placement from intent fields. */
export function inferSpineDomainId(intent: LibraryCreationIntent): string {
  if (intent.spineDomainId?.trim()) {
    return intent.spineDomainId.trim();
  }
  const lower = intent.domain.toLowerCase();
  for (const [key, id] of Object.entries(SPINE_DOMAIN_ALIASES)) {
    if (lower.includes(key)) return id;
  }
  return "mixed";
}
