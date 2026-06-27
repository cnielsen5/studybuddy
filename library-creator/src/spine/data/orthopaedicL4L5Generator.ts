import type { OrthoL3Spec } from "./orthopaedicSurgeryL3Data.js";
import type { OrthoAnchorL4L5Spec, OrthoL4Spec } from "./orthopaedicL4L5Types.js";
import { ABOS_LENS_HIGH_YIELD_IDS } from "./abosLensConfig.js";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

function pillarL4(
  l3: OrthoL3Spec,
  suffix: string,
  title: string,
  definition: string,
  summary: string,
  prereq?: string
): OrthoL4Spec {
  return {
    shortName: `${slugify(l3.shortName)}_${suffix}`.slice(0, 60),
    title,
    definition,
    summary,
    prerequisites: prereq ? [prereq] : undefined,
    nbkSection: l3.nbkSection,
  };
}

/**
 * ABOS-aligned L4 scaffold for non-high-yield topics — structured clinical pillars
 * rather than generic application clones.
 */
export function generateAbosAlignedAnchorSpec(l3: OrthoL3Spec): OrthoAnchorL4L5Spec {
  const coreShort = `${slugify(l3.shortName)}_core_principles`.slice(0, 60);
  const core: OrthoL4Spec = {
    shortName: coreShort,
    title: `${l3.title} — Core Principles`,
    definition: l3.definition,
    summary: l3.summary,
    nbkSection: l3.nbkSection ?? "Overview",
    sharedNote: l3.sharedNote,
  };

  const evalL4 = pillarL4(
    l3,
    "evaluation_and_diagnosis",
    "Evaluation and Diagnosis",
    `History, physical examination, and initial imaging for ${l3.title.toLowerCase()}.`,
    `Systematic assessment identifies severity, associated injuries, and urgency in ${l3.title.toLowerCase()}.`,
    coreShort
  );

  const managementL4 = pillarL4(
    l3,
    "management_principles",
    "Management Principles",
    `Nonoperative and operative treatment algorithms for ${l3.title.toLowerCase()}.`,
    l3.summary.split(".")[0] + ".",
    evalL4.shortName
  );

  const appL4s = l3.applications.slice(0, 3).map((app, i) => {
    const prev =
      i === 0 ? managementL4.shortName : `${slugify(l3.shortName)}_${slugify(l3.applications[i - 1]!)}`.slice(0, 60);
    return pillarL4(
      l3,
      slugify(app),
      app,
      `Focused assessment and management of ${app.toLowerCase()} in the context of ${l3.title.toLowerCase()}.`,
      `${app} — key decision points from ${l3.cluster} practice.`,
      prev
    );
  });

  const lastPrereq = appL4s.length > 0 ? appL4s[appL4s.length - 1]!.shortName : managementL4.shortName;
  const complications: OrthoL4Spec = {
    shortName: `${slugify(l3.shortName)}_complications_and_outcomes`.slice(0, 60),
    title: "Complications and Outcomes",
    definition: `Recognized complications, failure modes, and expected recovery after treatment of ${l3.title.toLowerCase()}.`,
    summary: "Anticipate, diagnose, and manage complications; counsel on prognosis and rehabilitation.",
    prerequisites: [lastPrereq],
    nbkSection: l3.nbkSection ?? "Complications",
    l5: [
      {
        shortName: `${slugify(l3.shortName)}_salvage_and_revision`.slice(0, 60),
        title: "Salvage and Revision Strategies",
        definition: `Revision and salvage options when initial management of ${l3.title.toLowerCase()} fails.`,
        summary: "Staged revision and alternative strategies when primary treatment fails or complications develop.",
        nbkSection: l3.nbkSection ?? "Complications",
      },
    ],
  };

  return {
    anchorShortName: l3.shortName,
    notes: `ABOS-aligned scaffold for ${l3.abosSection}.`,
    l4: [core, evalL4, managementL4, ...appL4s, complications],
  };
}

export function isAbosHighYieldL3(l3: OrthoL3Spec): boolean {
  return ABOS_LENS_HIGH_YIELD_IDS.has(`spine_medicine_clinical_l3_${l3.shortName}`);
}

/** @deprecated Use generateAbosAlignedAnchorSpec for non-high-yield topics. */
export function generateDefaultAnchorSpec(l3: OrthoL3Spec): OrthoAnchorL4L5Spec {
  return generateAbosAlignedAnchorSpec(l3);
}
