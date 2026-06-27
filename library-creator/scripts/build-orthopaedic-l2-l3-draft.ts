#!/usr/bin/env tsx
/**
 * Generates orthopaedic surgery L2 root + L3 concept clusters as a review draft.
 * Output: content/spine/drafts/orthopaedic-surgery-l2-l3.draft.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ConceptSourceReference } from "../src/types/domainContext.js";
import type { SpineConcept } from "../src/spine/spineSchema.js";
import { SpineConceptSchema } from "../src/spine/spineSchema.js";
import { ORTHOPAEDIC_L3_SPECS, type OrthoL3Spec } from "../src/spine/data/orthopaedicSurgeryL3Data.js";
import { ORTHOPAEDIC_HUB_SPECS } from "../src/spine/data/orthopaedicHubs.js";
import { CLUSTER_TO_HUB } from "../src/spine/data/orthopaedicHubs.js";
import { MERGED_INTO_EXISTING } from "../src/spine/data/orthopaedicReviewDecisions.js";
import {
  EXISTING_NODE_REFERENCES,
  buildAbosLens,
} from "../src/spine/data/orthopaedicSurgeryMeta.js";
import { buildOrthobulletsLens } from "../src/spine/data/orthopaedicOrthobulletsLens.js";
import { orderedTopicIds } from "../src/spine/data/abosLensConfig.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");
const outPath = join(repoRoot, "content/spine/drafts/orthopaedic-surgery-l2-l3.draft.json");

const TS = "2026-06-27T00:00:00Z";
const L2_ROOT = "spine_medicine_clinical_l2_orthopaedic_surgery";
const DOMAIN = "medicine_clinical" as const;

function emptyLinks() {
  return { by_library: {} };
}

function l3Id(shortName: string) {
  return `spine_medicine_clinical_l3_${shortName}`;
}

function statPearls(title: string, nbkId: string, section = "Overview"): ConceptSourceReference {
  return {
    source: `StatPearls — ${title}`,
    chapter: nbkId,
    section,
  };
}

function hubIdFor(spec: OrthoL3Spec): string {
  if (spec.isHub) return l3Id(spec.shortName);
  const hub = spec.hub ?? CLUSTER_TO_HUB[spec.cluster];
  if (!hub) throw new Error(`No hub for cluster ${spec.cluster} (${spec.shortName})`);
  return l3Id(hub);
}

function makeL2Root(hubSpecs: OrthoL3Spec[]): SpineConcept {
  return {
    id: L2_ROOT,
    resolution_level: 2,
    content: {
      title: "Orthopaedic Surgery",
      definition:
        "The surgical and non-surgical diagnosis, treatment, and rehabilitation of disorders affecting the musculoskeletal system including bones, joints, ligaments, tendons, muscles, and nerves.",
      summary:
        "Orthopaedic surgery encompasses traumatology, reconstructive joint surgery, spine surgery, sports medicine, paediatric orthopaedics, oncology, and hand surgery. It integrates basic science with clinical subspecialty knowledge.",
    },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: "Surgical Subspecialties",
      primary_domain: DOMAIN,
    },
    dependency_graph: {
      parent_concept_id: "spine_medicine_clinical",
      prerequisites: [],
      unlocks: hubSpecs.map((h) => l3Id(h.shortName)),
    },
    domain_contexts: [
      {
        domain_id: DOMAIN,
        framing: {
          title_in_context: "Orthopaedic Surgery",
          relevance:
            "Subspecialty clinical medicine domain covering musculoskeletal surgical and non-surgical management. Sibling to Musculoskeletal and Rheumatology under clinical medicine.",
          applications: [
            "ABOS board certification",
            "Orthopaedic residency training",
            "Musculoskeletal clinical decision-making",
          ],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Medicine (Clinical)",
          subcategory: "Orthopaedic Surgery",
          topic: "Orthopaedic Surgery",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [],
          unlocks_in_context: hubSpecs.map((h) => l3Id(h.shortName)),
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.2-draft",
      status: "draft",
      source_references: [
        {
          source: "ABOS Examination Blueprint",
          chapter: "Part I Subspecialty Version 2025",
          section: "Content Outline",
        },
      ],
    },
  };
}

function makeL3Concept(spec: OrthoL3Spec): SpineConcept {
  const id = l3Id(spec.shortName);
  const parentId = spec.isHub ? L2_ROOT : hubIdFor(spec);
  const prerequisites = spec.hardPrerequisites ?? [];

  const source: ConceptSourceReference =
    spec.source ??
    statPearls(spec.title, spec.nbkId ?? "NBK441999", spec.nbkSection ?? "Overview");

  return {
    id,
    resolution_level: 3,
    content: {
      title: spec.title,
      definition: spec.definition,
      summary: spec.summary,
    },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: spec.cluster,
      primary_domain: DOMAIN,
      ...(spec.sharedNote ? { _shared_concept_note: spec.sharedNote } : {}),
      ...(spec.reviewerNote ? { _placement_note: spec.reviewerNote } : {}),
    },
    dependency_graph: {
      parent_concept_id: parentId,
      prerequisites,
      unlocks: [],
    },
    domain_contexts: [
      {
        domain_id: DOMAIN,
        framing: {
          title_in_context: spec.title,
          relevance: spec.relevance,
          applications: spec.applications,
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Orthopaedic Surgery",
          subcategory: spec.subcategory,
          topic: spec.title,
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: prerequisites,
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.2-draft",
      status: "draft",
      source_references: [source, ...(spec.extraSources ?? [])],
    },
  };
}

const hubSpecs = ORTHOPAEDIC_HUB_SPECS;
const topicSpecs = ORTHOPAEDIC_L3_SPECS;
const l2Root = makeL2Root(hubSpecs);
const hubConcepts = hubSpecs.map((s) => makeL3Concept(s));
const topicConcepts = topicSpecs.map((s) => makeL3Concept(s));
const allConcepts = [l2Root, ...hubConcepts, ...topicConcepts];
const topicIds = orderedTopicIds();
const abosLens = buildAbosLens();
const orthobulletsLens = buildOrthobulletsLens();

const l4OrthoContextPending = [
  ...MERGED_INTO_EXISTING.filter((m) => m.l4OrthoContextPending).map((m) => ({
    existing_spine_id: m.mergedIntoExistingSpineId!,
    deferred_from: m.shortName,
    action:
      "Build L4/L5 medicine_clinical orthopaedic domain_context on this node; include in ABOS and Orthobullets lens mappings.",
  })),
];

const draft = {
  _meta: {
    domain: "orthopaedic_surgery",
    parent_domain: "medicine_clinical",
    spine_root: L2_ROOT,
    resolution_levels_generated: [2, 3],
    generation_date: "2026-06-27",
    status: "draft-for-review",
    review_pass: "resident-decisions-2026-06-27",
    reviewer_decisions: {
      F48_F57: "F48-F53,F55,F57 approved; F54 primary survey → ortho trauma L3; F56 Charcot split from diabetes ref",
      G58: "Orthobullets lens should mirror hub hierarchy; extractable lens tied to universal spine",
      G59: "Lens ordering: section > hub > topic",
      G60: "high_yield_in_lens only on ABOS lens mappings (abosLensConfig.ts)",
      G61: "Part I subspecialty sufficient",
      Part_I_deferred: "Child abuse L4; biostats/bone biology via preclinical refs + ortho context",
    },
    l2_count: 1,
    hub_l3_count: hubConcepts.length,
    topic_l3_count: topicConcepts.length,
    l3_count: hubConcepts.length + topicConcepts.length,
    sources_used: [
      "ABOS Part I Examination Blueprint 2025 (Subspecialty Version)",
      "Orthobullets taxonomy (structure reference only)",
      "StatPearls / NCBI Bookshelf",
      "PubMed abstracts",
    ],
    notes:
      "L2 has no cross-domain prerequisites. Subspecialty hub L3s parent topic L3s. Dependency unlocks omitted except hardPrerequisites. " +
      "Perioperative ortho L3s merged into existing clinical nodes — see l4_ortho_context_pending. " +
      "PROMs/outcomes deferred to L4 under statistics nodes.",
    abos_blueprint_appendix:
      "General Principles 13% | Adult Spine 9% | Shoulder and Elbow 7.5% | Hand 10.5% | Sports 9.5% | " +
      "Adult Reconstruction 8% | Foot and Ankle 10% | Adult Trauma 13.5% | Pediatrics 12% | Oncology 7%",
    l4_ortho_context_pending: l4OrthoContextPending,
  },
  l2_root: l2Root,
  concepts: topicConcepts,
  hub_concepts: hubConcepts,
  abos_lens: abosLens,
  orthobullets_lens: orthobulletsLens,
  existing_node_references: EXISTING_NODE_REFERENCES,
  merged_into_existing_spine: MERGED_INTO_EXISTING.filter((m) => m.mergedIntoExistingSpineId),
};

for (const concept of allConcepts) {
  SpineConceptSchema.parse(concept);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8");

console.log(`Wrote ${outPath}`);
console.log(
  `L2: 1 | Hub L3: ${hubConcepts.length} | Topic L3: ${topicConcepts.length} | existing refs: ${EXISTING_NODE_REFERENCES.length}`
);
console.log(`L4 ortho context pending on ${l4OrthoContextPending.length} existing nodes`);
console.log(`ABOS lens mappings: ${abosLens.concept_mappings.length}`);
console.log(`Orthobullets lens mappings: ${orthobulletsLens.concept_mappings.length}`);
