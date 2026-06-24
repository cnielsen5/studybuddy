/**
 * One-off generator for medicine preclinical/clinical L3 spine files.
 * Run: npx tsx scripts/_medicineL3Generator.ts
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ConceptSourceReference } from "../src/types/domainContext.js";
import type { SpineConcept } from "../src/spine/spineSchema.js";
import { l2Id, l3Id } from "../src/spine/spineDomains.js";
import type { SpineDomainId } from "../src/spine/spineDomains.js";
import { PRECLINICAL_SPECS } from "./_medicinePreclinicalSpecs.js";
import { CLINICAL_SPECS } from "./_medicineClinicalSpecs.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/spine/data");

const TS = "2025-01-01T00:00:00Z";

export interface MedL3Spec {
  shortName: string;
  l2: string;
  cluster: string;
  title: string;
  definition: string;
  summary: string;
  prerequisites?: string[];
  unlocks?: string[];
  source: ConceptSourceReference;
}

function emptyLinks() {
  return { by_library: {} };
}

function makeConcept(domain: SpineDomainId, knowledgeArea: string, category: string, spec: MedL3Spec): SpineConcept {
  const id = l3Id(domain, spec.shortName);
  const parent = l2Id(domain, spec.l2);
  const prerequisites = spec.prerequisites ?? [parent];
  const unlocks = spec.unlocks ?? [];
  return {
    id,
    resolution_level: 3,
    content: { title: spec.title, definition: spec.definition, summary: spec.summary },
    knowledge_graph: {
      knowledge_area: knowledgeArea,
      knowledge_cluster: spec.cluster,
      primary_domain: domain,
    },
    dependency_graph: { parent_concept_id: parent, prerequisites, unlocks },
    domain_contexts: [
      {
        domain_id: domain,
        framing: {
          title_in_context: spec.title,
          relevance: `Core ${spec.l2.toLowerCase()} concept for medical sciences.`,
          applications: [],
          max_resolution_in_context: 3,
        },
        hierarchy_location: {
          category,
          subcategory: spec.l2,
          topic: spec.title,
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: prerequisites,
          unlocks_in_context: unlocks,
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [spec.source],
    },
  };
}

function serializeSpec(spec: MedL3Spec, indent: string): string {
  const lines: string[] = [];
  lines.push(`${indent}{`);
  lines.push(`${indent}  shortName: ${JSON.stringify(spec.shortName)},`);
  lines.push(`${indent}  l2: ${JSON.stringify(spec.l2)},`);
  lines.push(`${indent}  cluster: ${JSON.stringify(spec.cluster)},`);
  lines.push(`${indent}  title: ${JSON.stringify(spec.title)},`);
  lines.push(`${indent}  definition: ${JSON.stringify(spec.definition)},`);
  lines.push(`${indent}  summary: ${JSON.stringify(spec.summary)},`);
  if (spec.prerequisites?.length) {
    lines.push(`${indent}  prerequisites: ${JSON.stringify(spec.prerequisites)},`);
  }
  if (spec.unlocks?.length) {
    lines.push(`${indent}  unlocks: ${JSON.stringify(spec.unlocks)},`);
  }
  lines.push(`${indent}  source: ${JSON.stringify(spec.source)},`);
  lines.push(`${indent}},`);
  return lines.join("\n");
}

function writeTsFile(
  filename: string,
  exportName: string,
  domain: SpineDomainId,
  knowledgeArea: string,
  category: string,
  l2Consts: Record<string, string>,
  specs: MedL3Spec[],
) {
  const concepts = specs.map((s) => makeConcept(domain, knowledgeArea, category, s));
  const l2Lines = Object.entries(l2Consts)
    .map(([k, v]) => `const ${k} = ${JSON.stringify(v)};`)
    .join("\n");

  const body = specs.map((s) => serializeSpec(s, "  ")).join("\n");

  const content = `import type { ConceptSourceReference } from "../../types/domainContext.js";
import type { SpineConcept } from "../spineSchema.js";
import { l2Id, l3Id } from "../spineDomains.js";

const TS = "2025-01-01T00:00:00Z";

function emptyLinks() {
  return { by_library: {} };
}

interface MedL3Spec {
  shortName: string;
  l2: string;
  cluster: string;
  title: string;
  definition: string;
  summary: string;
  prerequisites?: string[];
  unlocks?: string[];
  source: ConceptSourceReference;
}

function makeMedConcept(domain: "${domain}", knowledgeArea: string, category: string, spec: MedL3Spec): SpineConcept {
  const id = l3Id(domain, spec.shortName);
  const parent = l2Id(domain, spec.l2);
  const prerequisites = spec.prerequisites ?? [parent];
  const unlocks = spec.unlocks ?? [];
  return {
    id,
    resolution_level: 3,
    content: { title: spec.title, definition: spec.definition, summary: spec.summary },
    knowledge_graph: {
      knowledge_area: knowledgeArea,
      knowledge_cluster: spec.cluster,
      primary_domain: domain,
    },
    dependency_graph: { parent_concept_id: parent, prerequisites, unlocks },
    domain_contexts: [
      {
        domain_id: domain,
        framing: {
          title_in_context: spec.title,
          relevance: \`Core \${spec.l2.toLowerCase()} concept for medical sciences.\`,
          applications: [],
          max_resolution_in_context: 3,
        },
        hierarchy_location: {
          category,
          subcategory: spec.l2,
          topic: spec.title,
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: prerequisites,
          unlocks_in_context: unlocks,
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [spec.source],
    },
  };
}

${l2Lines}

const OSTAX = "OpenStax Anatomy and Physiology 2e";
const STAT = "NCBI StatPearls";
const TBD: ConceptSourceReference = {
  source: "No open-source reference identified — requires manual citation",
  chapter: "TBD",
  section: "TBD",
};

const SPECS: MedL3Spec[] = [
${body}
];

export const ${exportName}: SpineConcept[] = SPECS.map((spec) =>
  makeMedConcept("${domain}", "Clinical Sciences", "${category}", spec),
);
`;

  writeFileSync(join(OUT, filename), content, "utf8");
  console.log(`${filename}: ${concepts.length} concepts`);
}

const PRECLINICAL_L2 = {
  GROSS: "Gross Anatomy",
  HIST: "Histology & Cell Ultrastructure",
  EMBRYO: "Embryology & Development",
  PHYS: "Physiology",
  BIOCHEM: "Biochemistry & Metabolism",
  PHARM: "Pharmacology",
  PATH: "Pathology",
  MICRO: "Microbiology & Infectious Disease",
  IMMUNO: "Immunology",
  NEURO: "Neuroscience",
  GENETICS: "Genetics & Molecular Medicine",
  BEHAV: "Behavioral Science & Epidemiology",
};

const CLINICAL_L2 = {
  CARD: "Cardiology",
  PULM: "Pulmonology",
  NEPH: "Nephrology & Fluid Balance",
  GI: "Gastroenterology & Hepatology",
  ENDO: "Endocrinology & Metabolism",
  HEME: "Hematology & Oncology",
  NEURO: "Neurology",
  PSYCH: "Psychiatry & Behavioral Health",
  ID: "Infectious Disease",
  MSK: "Musculoskeletal & Rheumatology",
  DERM: "Dermatology",
  OBGYN: "Obstetrics & Gynecology",
  SURG: "Surgery & Perioperative Care",
};

writeTsFile(
  "medicinePreclinicalL3.ts",
  "MEDICINE_PRECLINICAL_L3",
  "medicine_preclinical",
  "Clinical Sciences",
  "Medicine (Pre-Clinical)",
  PRECLINICAL_L2,
  PRECLINICAL_SPECS,
);

writeTsFile(
  "medicineClinicalL3.ts",
  "MEDICINE_CLINICAL_L3",
  "medicine_clinical",
  "Clinical Sciences",
  "Medicine (Clinical)",
  CLINICAL_L2,
  CLINICAL_SPECS,
);

if (PRECLINICAL_SPECS.length !== 130) {
  throw new Error(`Expected 130 preclinical, got ${PRECLINICAL_SPECS.length}`);
}
if (CLINICAL_SPECS.length !== 110) {
  throw new Error(`Expected 110 clinical, got ${CLINICAL_SPECS.length}`);
}
