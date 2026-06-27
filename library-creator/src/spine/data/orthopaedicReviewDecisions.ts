import type { OrthoL3Spec } from "./orthopaedicSurgeryL3Data.js";
import { CLUSTER_TO_HUB } from "./orthopaedicHubs.js";

const l3 = (name: string) => `spine_medicine_clinical_l3_${name}`;

/** Specs removed — content merged into another node or existing spine only. */
const OMIT = new Set([
  "metabolic_bone_disease_orthopaedic",
  "orthopaedic_preoperative_optimization",
  "orthopaedic_perioperative_infection_prevention",
  "orthopaedic_postoperative_thromboembolism_prophylaxis",
  "orthopaedic_multimodal_pain_management",
  "orthopaedic_legal_ethical_systems",
  "cervical_spine_trauma_and_instability",
  "sacroiliac_joint_dysfunction",
  "acromioclavicular_and_sternoclavicular_injuries",
  "peripheral_nerve_injury_brachial_plexus",
  "patient_reported_outcomes_orthopaedic",
  "diabetic_foot_and_charcot_arthropathy",
  "bone_grafts_and_substitutes",
]);

/** Merged-into-existing-spine — no L3 node; L4 ortho context pending on target. */
export const MERGED_INTO_EXISTING: OrthoL3Spec[] = [
  {
    shortName: "_merged_preoperative_optimization",
    mergedIntoExistingSpineId: "spine_medicine_clinical_l3_preoperative_assessment",
    l4OrthoContextPending: true,
    cluster: "Basic Science",
    subcategory: "Perioperative Medicine",
    title: "(merged) Orthopaedic Preoperative Optimization",
    definition: "",
    summary: "",
    relevance: "Orthopaedic-specific preoperative optimization — L4/L5 under preoperative_assessment.",
    applications: ["Nutrition", "Smoking cessation", "Inflammatory arthritis perioperative management"],
    abosSection: "abos_p1_perioperative",
  },
  {
    shortName: "_merged_multimodal_pain",
    mergedIntoExistingSpineId: "spine_medicine_clinical_l3_anesthesia_basics",
    l4OrthoContextPending: true,
    cluster: "Basic Science",
    subcategory: "Perioperative Medicine",
    title: "(merged) Orthopaedic Multimodal Pain Management",
    definition: "",
    summary: "",
    relevance: "ERAS, regional blocks, opioid-sparing — L4/L5 under anesthesia_basics.",
    applications: ["Peripheral nerve blocks", "Spinal anesthesia for arthroplasty"],
    abosSection: "abos_p1_perioperative",
  },
  {
    shortName: "_merged_vte_prophylaxis",
    mergedIntoExistingSpineId: "spine_medicine_clinical_l3_deep_vein_thrombosis_pe",
    l4OrthoContextPending: true,
    cluster: "Basic Science",
    subcategory: "Perioperative Medicine",
    title: "(merged) Orthopaedic VTE Prophylaxis",
    definition: "",
    summary: "",
    relevance: "Arthroplasty and hip fracture VTE protocols — L4/L5 under DVT/PE node.",
    applications: ["Aspirin vs LMWH after TJA", "Prophylaxis duration"],
    abosSection: "abos_p1_perioperative",
  },
  {
    shortName: "_merged_infection_prevention",
    mergedIntoExistingSpineId: "spine_medicine_clinical_l3_wound_healing_surgical",
    l4OrthoContextPending: true,
    cluster: "Basic Science",
    subcategory: "Perioperative Medicine",
    title: "(merged) Orthopaedic Perioperative Infection Prevention",
    definition: "",
    summary: "",
    relevance: "SSI bundles, antibiotic prophylaxis for arthroplasty — L4/L5 under wound_healing_surgical.",
    applications: ["Cefazolin timing", "MRSA decolonization"],
    abosSection: "abos_p1_perioperative",
  },
  {
    shortName: "_merged_legal_ethical",
    mergedIntoExistingSpineId: "spine_medicine_preclinical_l3_medical_ethics_principles",
    l4OrthoContextPending: false,
    cluster: "Basic Science",
    subcategory: "Systems-Based Practice",
    title: "(ref only) Orthopaedic Legal and Ethical Practice",
    definition: "",
    summary: "",
    relevance: "Reference only via existing_node_references.",
    applications: ["Informed consent for arthroplasty"],
    abosSection: "abos_p1_legal_ethical",
  },
];

function patchSpec(spec: OrthoL3Spec): OrthoL3Spec | null {
  if (OMIT.has(spec.shortName)) return null;

  const next: OrthoL3Spec = {
    ...spec,
    hub: spec.hub ?? CLUSTER_TO_HUB[spec.cluster],
    hardPrerequisites: spec.hardPrerequisites,
  };
  delete (next as { prerequisites?: string[] }).prerequisites;
  delete (next as { unlocks?: string[] }).unlocks;

  switch (spec.shortName) {
    case "clavicle_and_acromioclavicular_injuries":
      return {
        ...next,
        shortName: "clavicle_acromioclavicular_and_sternoclavicular_injuries",
        title: "Clavicle, Acromioclavicular, and Sternoclavicular Injuries",
        summary:
          "Midshaft clavicle, AC separations (Rockwood), and SC dislocations including posterior SC mediastinal risk. Brachial plexus injury may accompany clavicle trauma.",
        applications: [
          "Rockwood AC classification",
          "SC dislocation urgency",
          "Clavicle fixation indications",
        ],
      };
    case "brachial_plexus_injuries":
      return {
        ...next,
        title: "Brachial Plexus Injuries — Trauma and Reconstruction",
        summary:
          "Erb-Duchenne and Klumpke patterns localize injury. Repair, grafting, and nerve transfer restore function when reinnervation is limited. Sunderland classification guides prognosis.",
        cluster: "Neuromuscular and Rehabilitation",
        hub: "orthopaedic_neuromuscular_rehabilitation",
        applications: ["Plexus pattern recognition", "Nerve repair timing", "Tendon transfer options"],
      };
    case "spine_trauma_fractures_and_instability":
      return {
        ...next,
        title: "Spine Trauma — Fractures and Instability",
        summary:
          "TLICS and SLIC scores guide operative versus nonoperative management for thoracolumbar and subaxial cervical injuries. Occipitocervical dissociation is unstable. Spinal cord injury requires hemodynamic support; cervical and thoracolumbar detail at L4.",
        reviewerNote: undefined,
      };
    case "periprosthetic_joint_infection":
      return {
        ...next,
        shortName: "periprosthetic_joint_infection_hip_and_knee",
        title: "Periprosthetic Joint Infection — Hip and Knee",
        summary:
          "MSIS criteria combine serology, synovial fluid, and intraoperative findings. DAIR for acute infections; chronic often requires two-stage exchange for hip and knee arthroplasty.",
      };
    case "shoulder_instability_and_labral_injuries":
    case "rotator_cuff_pathology":
      return {
        ...next,
        cluster: "Shoulder and Elbow",
        hub: "orthopaedic_shoulder_and_elbow",
      };
    case "revision_shoulder_arthroplasty":
      return {
        ...next,
        hardPrerequisites: [l3("shoulder_periprosthetic_joint_infection"), l3("primary_shoulder_arthroplasty")],
      };
    case "paediatric_fractures_physeal_injuries":
      return {
        ...next,
        reviewerNote: undefined,
      };
    case "pilon_and_ankle_fractures":
      return { ...next };
    case "stress_fractures_and_insufficiency_fractures":
      return {
        ...next,
        sharedNote:
          "Shared with foot/ankle high-risk locations (navicular, metatarsals) and osteoporosis/insufficiency fractures — cross-link in foot/ankle hub and osteoporosis existing ref.",
      };
    default:
      return next;
  }
}

const ADDED_SPECS: OrthoL3Spec[] = [
  {
    shortName: "fracture_healing_and_bone_remodeling_clinical",
    cluster: "Basic Science",
    hub: "orthopaedic_basic_science",
    subcategory: "Bone Biology",
    title: "Fracture Healing and Bone Remodeling — Clinical Application",
    definition:
      "Stages of bone repair from hematoma through remodeling and clinical factors affecting union in orthopaedic practice.",
    summary:
      "Primary versus secondary bone healing depends on fixation stability. Nicotine, NSAIDs, and diabetes impair union. Remodeling continues long after clinical union.",
    relevance: "Clinical counterpart to preclinical wound healing; core Part I basic science.",
    applications: ["Union assessment", "Nonunion risk factors", "NSAID effect on healing"],
    abosSection: "abos_p1_basic_science_principles",
    nbkId: "NBK482316",
    nbkSection: "Fracture Healing",
  },
  {
    shortName: "general_paediatric_trauma",
    cluster: "Paediatric Orthopaedics",
    hub: "orthopaedic_pediatrics",
    subcategory: "Paediatric Trauma",
    title: "General Paediatric Trauma",
    definition:
      "Age-specific musculoskeletal trauma assessment including high-energy injury, non-accidental trauma, and child abuse recognition distinct from physeal fracture classification.",
    summary:
      "Paediatric trauma requires ATLS resuscitation first. Non-accidental trauma patterns include metaphyseal corner and posterior rib fractures. Mandatory reporting when abuse is suspected.",
    relevance: "ABOS paediatric trauma and child protection content; home for NAT recognition per resident review.",
    applications: [
      "Non-accidental trauma recognition",
      "Skeletal survey indications",
      "High-energy paediatric polytrauma",
      "Mandatory reporting",
    ],
    abosSection: "abos_p2_pediatrics",
    highYield: true,
    nbkId: "NBK557519",
    nbkSection: "Paediatric Trauma",
  },
  {
    shortName: "primary_survey_orthopaedic_trauma",
    cluster: "Trauma",
    hub: "orthopaedic_trauma",
    subcategory: "Primary Survey",
    title: "Primary Survey — Orthopaedic Trauma",
    definition:
      "Systematic ATLS-based assessment of life-threatening injuries and resuscitation priorities before definitive orthopaedic fracture management.",
    summary:
      "ABCs take precedence over fracture fixation. Secondary survey identifies all injuries. Hemodynamic stability determines timing of definitive orthopaedic surgery versus damage control.",
    relevance: "Dedicated orthopaedic trauma topic — not anchored to general surgery primary survey node alone.",
    applications: ["ABCs before fracture fixation", "Secondary survey timing", "Resuscitation endpoints"],
    abosSection: "abos_p2_multiple_trauma",
    nbkId: "NBK482316",
    nbkSection: "Primary Survey",
  },
  {
    shortName: "muscle_contraction_orthopaedic",
    cluster: "Basic Science",
    hub: "orthopaedic_basic_science",
    subcategory: "Muscle Physiology",
    title: "Muscle Contraction — Orthopaedic Application",
    definition:
      "Sliding filament mechanics and force generation as applied to rehabilitation, tendon transfer, spasticity, and neuromuscular disorders in orthopaedic patients.",
    summary:
      "Length-tension relationships guide rehab progression. Spasticity alters muscle architecture in CP and stroke. Tendon transfer redirects functional muscle units.",
    relevance: "Orthopaedic-specific muscle physiology beyond general preclinical overview.",
    applications: ["Rehabilitation loading", "Tendon transfer mechanics", "Spasticity management"],
    abosSection: "abos_p1_basic_science_principles",
    nbkId: "NBK557519",
    nbkSection: "Muscle Function",
  },
  {
    shortName: "shoulder_periprosthetic_joint_infection",
    cluster: "Shoulder and Elbow",
    hub: "orthopaedic_shoulder_and_elbow",
    subcategory: "Shoulder Arthroplasty",
    title: "Shoulder Periprosthetic Joint Infection",
    definition:
      "Infection of shoulder replacement components with diagnostic workup and treatment distinct from hip and knee PJI.",
    summary:
      "Propionibacterium acnes is shoulder-specific. Single-stage versus two-stage exchange depends on organism and chronicity. Resection arthroplasty is salvage option.",
    relevance: "Shoulder PJI biology and management differ from lower-extremity PJI.",
    applications: ["P. acnes culture techniques", "Shoulder spacer placement", "DAIR in acute shoulder PJI"],
    abosSection: "abos_p2_shoulder_elbow",
    hardPrerequisites: [l3("primary_shoulder_arthroplasty")],
    nbkId: "NBK551582",
    nbkSection: "Shoulder PJI",
  },
  {
    shortName: "cerebral_palsy_orthopaedic_management",
    cluster: "Paediatric Orthopaedics",
    hub: "orthopaedic_pediatrics",
    subcategory: "Neuromuscular Paeds",
    title: "Cerebral Palsy — Orthopaedic Management",
    definition:
      "Musculoskeletal manifestations of cerebral palsy including spasticity, contractures, and gait abnormalities requiring multidisciplinary care.",
    summary:
      "GMFCS level predicts ambulation. SEMLS addresses gait deviations. Hip surveillance prevents dislocation in non-ambulators.",
    relevance: "Primary paediatric orthopaedic neuromuscular topic.",
    applications: ["GMFCS classification", "Hip surveillance", "Multilevel surgery planning"],
    abosSection: "abos_p2_pediatrics",
    hardPrerequisites: [l3("gait_analysis_and_kinesiology")],
    nbkId: "NBK557519",
    nbkSection: "Cerebral Palsy",
    sharedNote: "Adult CP transition at L5 under cp_spasticity_and_contracture_management.",
  },
  {
    shortName: "charcot_neuroarthropathy",
    cluster: "Foot and Ankle",
    hub: "orthopaedic_foot_and_ankle",
    subcategory: "Charcot Foot",
    title: "Charcot Neuroarthropathy",
    definition:
      "Progressive osseous destruction and deformity of the foot and ankle from neuropathy, most commonly in diabetes.",
    summary:
      "Acute Charcot presents as warm, swollen, red foot with minimal pain. Immobilization prevents rocker-bottom deformity. Eichenholtz stages guide treatment.",
    relevance: "Standalone foot and ankle topic per ABOS diabetic foot section; distinct from general diabetes management.",
    applications: ["Acute immobilization", "Total contact cast", "Surgical reconstruction timing"],
    abosSection: "abos_p2_foot_ankle",
    nbkId: "NBK557386",
    nbkSection: "Charcot Arthropathy",
  },
  {
    shortName: "diabetic_foot_ulcers_and_management",
    cluster: "Foot and Ankle",
    hub: "orthopaedic_foot_and_ankle",
    subcategory: "Diabetic Foot",
    title: "Diabetic Foot Ulcers and Limb Salvage",
    definition:
      "Neuropathic and ischemic foot ulceration in diabetes requiring offloading, infection control, and multidisciplinary limb salvage.",
    summary:
      "Wagner and UT classification guide depth and ischemia. Offloading is cornerstone. Osteomyelitis requires biopsy-directed antibiotics and possible resection.",
    relevance: "Orthopaedic foot and ankle management of diabetic ulcers without conflating Charcot pathophysiology.",
    applications: ["Offloading strategies", "Osteomyelitis workup", "Amputation level selection"],
    abosSection: "abos_p2_foot_ankle",
    nbkId: "NBK557386",
    nbkSection: "Diabetic Foot",
  },
];

export function applyReviewDecisions(rawSpecs: OrthoL3Spec[]): OrthoL3Spec[] {
  const patched: OrthoL3Spec[] = [];
  for (const spec of rawSpecs) {
    if (spec.shortName === "cerebral_palsy_orthopaedic_management") continue; // replaced by ADDED in paeds
    const p = patchSpec(spec);
    if (p) patched.push(p);
  }
  for (const added of ADDED_SPECS) {
    if (!patched.some((s) => s.shortName === added.shortName)) {
      patched.push(added);
    }
  }
  return patched;
}

export function topicSpecsOnly(specs: OrthoL3Spec[]): OrthoL3Spec[] {
  return specs.filter((s) => !s.isHub && !s.shortName.startsWith("_merged_"));
}
