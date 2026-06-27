import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SpineConcept } from "./spineSchema.js";
import type { DomainContext } from "../types/domainContext.js";

export interface L4L5GenerationUnit {
  parent_l3_id: string;
  domain_id: string;
  max_resolution_in_context: number;
  bundle_filename: string;
  parent_l3_concept: SpineConcept;
  target_domain_context: DomainContext;
  generation_parameters: {
    max_resolution_in_context: number;
    audience_level: string;
    audience_description: string;
    source_preference: string[];
    target_l4_count: string;
    target_l5_count: string;
  };
}

const AUDIENCE_BY_DOMAIN: Record<string, { level: string; description: string }> = {
  mathematics: {
    level: "undergrad",
    description:
      "Undergraduate mathematics student. Assumed prior knowledge includes high school algebra and introductory calculus where relevant.",
  },
  physics: {
    level: "undergrad",
    description:
      "Undergraduate physics student. Assumed prior knowledge includes calculus-based mechanics and introductory laboratory methods.",
  },
  chemistry: {
    level: "undergrad",
    description:
      "Undergraduate chemistry or biochemistry student. Assumed prior knowledge includes general chemistry and introductory organic chemistry.",
  },
  biology: {
    level: "undergrad",
    description:
      "Undergraduate biology student. Assumed prior knowledge includes general biology and introductory cell biology.",
  },
  medicine_preclinical: {
    level: "medical_student",
    description:
      "Second-year medical student preparing for USMLE Step 1. Assumed prior knowledge includes general chemistry, physiology, and basic pharmacology.",
  },
  medicine_clinical: {
    level: "resident",
    description:
      "Clinical clerkship student or intern preparing for Step 2 CK. Assumed prior knowledge includes core preclinical sciences and introductory clinical reasoning.",
  },
  psychology_neuroscience: {
    level: "undergrad",
    description:
      "Undergraduate psychology or neuroscience student. Assumed prior knowledge includes introductory psychology and basic biology.",
  },
};

export function unitBundleFilename(parentL3Id: string, domainId: string): string {
  return `${parentL3Id}.${domainId}.json`;
}

/** Universal anchor bundle filename (one file per L3). */
export function anchorBundleFilename(parentL3Id: string): string {
  return `${parentL3Id}.json`;
}

export function extractL4L5GenerationUnits(spineBundle: {
  concepts: SpineConcept[];
}): L4L5GenerationUnit[] {
  const units: L4L5GenerationUnit[] = [];

  for (const concept of spineBundle.concepts) {
    if (concept.resolution_level !== 3) continue;

    for (const ctx of concept.domain_contexts) {
      const max = ctx.framing.max_resolution_in_context;
      if (max < 4) continue;

      const audience = AUDIENCE_BY_DOMAIN[ctx.domain_id] ?? {
        level: "undergrad",
        description: "Undergraduate student in this domain.",
      };

      units.push({
        parent_l3_id: concept.id,
        domain_id: ctx.domain_id,
        max_resolution_in_context: max,
        bundle_filename: unitBundleFilename(concept.id, ctx.domain_id),
        parent_l3_concept: concept,
        target_domain_context: ctx,
        generation_parameters: {
          max_resolution_in_context: max,
          audience_level: audience.level,
          audience_description: audience.description,
          source_preference: ["OpenStax", "LibreTexts", "NCBI Bookshelf / StatPearls"],
          target_l4_count: "4-8",
          target_l5_count:
            max === 5
              ? "2-4 per L4 node where max_resolution_in_context = 5, otherwise none"
              : "none",
        },
      });
    }
  }

  return units.sort((a, b) =>
    `${a.domain_id}.${a.parent_l3_id}`.localeCompare(`${b.domain_id}.${b.parent_l3_id}`)
  );
}

export function loadSpineL3Draft(repoRoot: string): { concepts: SpineConcept[] } {
  const path = join(repoRoot, "content/spine/socrates-spine-l1-l3.draft.json");
  return JSON.parse(readFileSync(path, "utf8")) as { concepts: SpineConcept[] };
}

export function loadGenerationUnitsFromRepo(repoRoot: string): L4L5GenerationUnit[] {
  return extractL4L5GenerationUnits(loadSpineL3Draft(repoRoot));
}
