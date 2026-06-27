/** Canonical spine domain ids and level-2 subdivision labels. */

export const SPINE_DOMAIN_IDS = [
  "mathematics",
  "physics",
  "chemistry",
  "biology",
  "medicine_preclinical",
  "medicine_clinical",
  "psychology_neuroscience",
] as const;

export type SpineDomainId = (typeof SPINE_DOMAIN_IDS)[number];

export interface SpineDomainDefinition {
  id: SpineDomainId;
  title: string;
  knowledge_area: string;
  level2: string[];
  level3Target: number;
}

export const SPINE_DOMAINS: SpineDomainDefinition[] = [
  {
    id: "mathematics",
    title: "Mathematics",
    knowledge_area: "Quantitative Reasoning",
    level3Target: 50,
    level2: [
      "Arithmetic & Pre-Algebra",
      "Algebra",
      "Geometry & Trigonometry",
      "Pre-Calculus & Functions",
      "Single-Variable Calculus",
      "Multivariable Calculus",
      "Linear Algebra",
      "Differential Equations",
      "Statistics & Probability",
      "Discrete Mathematics & Logic",
    ],
  },
  {
    id: "physics",
    title: "Physics",
    knowledge_area: "Physical Sciences",
    level3Target: 45,
    level2: [
      "Classical Mechanics",
      "Waves & Oscillations",
      "Thermodynamics & Statistical Mechanics",
      "Electricity & Magnetism",
      "Optics",
      "Modern Physics & Quantum Mechanics",
      "Fluid Mechanics",
      "Nuclear Physics",
    ],
  },
  {
    id: "chemistry",
    title: "Chemistry",
    knowledge_area: "Physical Sciences",
    level3Target: 60,
    level2: [
      "General & Inorganic Chemistry",
      "Organic Chemistry",
      "Physical Chemistry",
      "Biochemistry",
      "Electrochemistry",
      "Nuclear & Radiochemistry",
      "Analytical Chemistry",
      "Spectroscopy & Structure Determination",
    ],
  },
  {
    id: "biology",
    title: "Biology",
    knowledge_area: "Life Sciences",
    level3Target: 65,
    level2: [
      "Cell Biology",
      "Molecular Biology & Genetics",
      "Organismal Physiology",
      "Ecology & Evolution",
      "Microbiology",
      "Immunology",
      "Developmental Biology",
      "Anatomy & Morphology",
    ],
  },
  {
    id: "medicine_preclinical",
    title: "Medicine (Pre-Clinical)",
    knowledge_area: "Clinical Sciences",
    level3Target: 130,
    level2: [
      "Gross Anatomy",
      "Histology & Cell Ultrastructure",
      "Embryology & Development",
      "Physiology",
      "Biochemistry & Metabolism",
      "Pharmacology",
      "Pathology",
      "Microbiology & Infectious Disease",
      "Immunology",
      "Neuroscience",
      "Genetics & Molecular Medicine",
      "Behavioral Science & Epidemiology",
    ],
  },
  {
    id: "medicine_clinical",
    title: "Medicine (Clinical)",
    knowledge_area: "Clinical Sciences",
    level3Target: 110,
    level2: [
      "Cardiology",
      "Pulmonology",
      "Nephrology & Fluid Balance",
      "Gastroenterology & Hepatology",
      "Endocrinology & Metabolism",
      "Hematology & Oncology",
      "Neurology",
      "Psychiatry & Behavioral Health",
      "Infectious Disease",
      "Musculoskeletal & Rheumatology",
      "Dermatology",
      "Obstetrics & Gynecology",
      "Surgery & Perioperative Care",
    ],
  },
  {
    id: "psychology_neuroscience",
    title: "Psychology & Neuroscience",
    knowledge_area: "Behavioral & Cognitive Sciences",
    level3Target: 70,
    level2: [
      "Biological Psychology & Neuroscience",
      "Cognitive Psychology",
      "Developmental Psychology",
      "Social & Cultural Psychology",
      "Abnormal Psychology & Psychopathology",
      "Sensation & Perception",
      "Learning & Conditioning",
      "Personality & Individual Differences",
      "Research Methods & Statistics",
    ],
  },
];

export function slugifySpineName(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .slice(0, 48);
}

export function spineIdPrefix(domain: SpineDomainId): string {
  return domain;
}

export function l2Id(domain: SpineDomainId, l2Label: string): string {
  return `spine_${spineIdPrefix(domain)}_l2_${slugifySpineName(l2Label)}`;
}

export function l3Id(domain: SpineDomainId, shortName: string): string {
  return `spine_${spineIdPrefix(domain)}_l3_${slugifySpineName(shortName)}`;
}

export function l1Id(domain: SpineDomainId): string {
  return `spine_${spineIdPrefix(domain)}`;
}
