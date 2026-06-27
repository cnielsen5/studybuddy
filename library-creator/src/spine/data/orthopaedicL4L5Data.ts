import { ORTHOPAEDIC_L3_SPECS } from "./orthopaedicSurgeryL3Data.js";
import { topicSpecsOnly } from "./orthopaedicReviewDecisions.js";
import { generateAbosAlignedAnchorSpec, isAbosHighYieldL3 } from "./orthopaedicL4L5Generator.js";
import { ORTHO_L4L5_ABOS_HIGH_YIELD } from "./orthopaedicL4L5AbosHighYield.js";
import { ORTHO_L4L5_OVERRIDES } from "./orthopaedicL4L5Overrides.js";
import { ORTHO_EXISTING_ANCHOR_SPECS } from "./orthopaedicL4L5Existing.js";
import { buildAnchorBundle, buildExistingAnchorBundle } from "./orthopaedicL4L5Builder.js";
import type { OrthoAnchorL4L5Spec } from "./orthopaedicL4L5Types.js";
import type { SpineL4L5AnchorBundle } from "../spineL4L5Schema.js";

export function resolveAnchorSpec(l3ShortName: string): OrthoAnchorL4L5Spec {
  if (ORTHO_L4L5_OVERRIDES[l3ShortName]) {
    return ORTHO_L4L5_OVERRIDES[l3ShortName]!;
  }
  if (ORTHO_L4L5_ABOS_HIGH_YIELD[l3ShortName]) {
    return ORTHO_L4L5_ABOS_HIGH_YIELD[l3ShortName]!;
  }
  const l3 = ORTHOPAEDIC_L3_SPECS.find((s) => s.shortName === l3ShortName);
  if (!l3) throw new Error(`Unknown L3 shortName: ${l3ShortName}`);
  if (isAbosHighYieldL3(l3)) {
    throw new Error(`ABOS high-yield anchor missing L4/L5 spec: ${l3ShortName}`);
  }
  return generateAbosAlignedAnchorSpec(l3);
}

export function buildAllOrthopaedicAnchorBundles(): SpineL4L5AnchorBundle[] {
  const topics = topicSpecsOnly(ORTHOPAEDIC_L3_SPECS);
  const bundles: SpineL4L5AnchorBundle[] = [];

  for (const l3 of topics) {
    const anchorSpec = resolveAnchorSpec(l3.shortName);
    bundles.push(buildAnchorBundle(anchorSpec, l3));
  }

  for (const existing of ORTHO_EXISTING_ANCHOR_SPECS) {
    bundles.push(
      buildExistingAnchorBundle(existing, {
        title: existing.deferredFrom.replace(/_/g, " "),
        cluster: "Basic Science",
        subcategory: existing.subcategory,
        relevance: `Orthopaedic perioperative context deferred from merged L3 ${existing.deferredFrom}.`,
        applications: ["Arthroplasty", "Fracture surgery", "Perioperative bundles"],
        nbkId: "NBK557519",
        nbkSection: "Perioperative Medicine",
      })
    );
  }

  return bundles;
}

export function allOrthopaedicL4L5Concepts() {
  return buildAllOrthopaedicAnchorBundles().flatMap((b) => b.concepts);
}

export function orthopaedicAnchorStats() {
  const bundles = buildAllOrthopaedicAnchorBundles();
  const concepts = allOrthopaedicL4L5Concepts();
  return {
    anchorCount: bundles.length,
    topicAnchors: topicSpecsOnly(ORTHOPAEDIC_L3_SPECS).length,
    existingAnchors: ORTHO_EXISTING_ANCHOR_SPECS.length,
    l4: concepts.filter((c) => c.resolution_level === 4).length,
    l5: concepts.filter((c) => c.resolution_level === 5).length,
    total: concepts.length,
  };
}
