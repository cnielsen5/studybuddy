import { MERGED_INTO_EXISTING } from "./orthopaedicReviewDecisions.js";
import type { OrthoExistingAnchorL4L5Spec } from "./orthopaedicL4L5Types.js";

/** L4/L5 orthopaedic domain_context on existing clinical spine nodes (E27–E30). */
export const ORTHO_EXISTING_ANCHOR_SPECS: OrthoExistingAnchorL4L5Spec[] = [
  {
    existingSpineId: "spine_medicine_clinical_l3_preoperative_assessment",
    deferredFrom: "orthopaedic_preoperative_optimization",
    subcategory: "Perioperative Medicine",
    notes: "Orthopaedic preoperative optimization L4 cluster on existing preoperative_assessment node.",
    l4: [
      {
        shortName: "ortho_preop_risk_assessment",
        title: "Orthopaedic Preoperative Risk Assessment",
        definition:
          "Frailty, anemia, glycemic control, and cardiopulmonary risk stratification before elective arthroplasty and major orthopaedic surgery.",
        summary:
          "ASA class and frailty indices predict complications; anemia optimization reduces transfusion.",
        nbkSection: "Preoperative Optimization",
      },
      {
        shortName: "ortho_preop_nutrition_and_smoking",
        title: "Nutrition and Smoking Cessation in Orthopaedic Surgery",
        definition:
          "Prehabilitation including protein repletion, vitamin D correction, and smoking cessation to improve union and wound healing.",
        summary: "Smoking doubles nonunion and SSI rates; nutrition support before complex reconstruction.",
        prerequisites: ["ortho_preop_risk_assessment"],
        nbkSection: "Preoperative Optimization",
      },
      {
        shortName: "ortho_preop_inflammatory_arthritis",
        title: "Perioperative Management of Inflammatory Arthritis",
        definition:
          "DMARD and biologic hold protocols balancing flare risk against infection and wound complications.",
        summary: "Coordinate with rheumatology; timing of biologic interruption follows ACR/AAOS guidance.",
        prerequisites: ["ortho_preop_nutrition_and_smoking"],
        nbkSection: "Inflammatory Arthritis",
        l5: [
          {
            shortName: "ortho_preop_biologic_timing",
            title: "Biologic Agent Timing Before Arthroplasty",
            definition: "Evidence-based intervals for holding TNF inhibitors and other biologics before elective joint replacement.",
            summary: "Schedule surgery after washout interval; resume when wound healed and no infection.",
            nbkSection: "Biologics",
          },
        ],
      },
    ],
  },
  {
    existingSpineId: "spine_medicine_clinical_l3_anesthesia_basics",
    deferredFrom: "orthopaedic_multimodal_pain_management",
    subcategory: "Perioperative Medicine",
    l4: [
      {
        shortName: "ortho_multimodal_analgesia",
        title: "Multimodal Analgesia in Orthopaedic Surgery",
        definition:
          "Combination of acetaminophen, NSAIDs (when safe), gabapentinoids, and regional techniques to reduce opioid consumption.",
        summary: "ERAS protocols improve recovery after arthroplasty; avoid NSAIDs when union risk is paramount.",
        nbkSection: "Pain Management",
      },
      {
        shortName: "ortho_regional_anesthesia_blocks",
        title: "Regional Anesthesia for Orthopaedic Procedures",
        definition:
          "Neuraxial and peripheral nerve blocks for hip and knee arthroplasty, extremity trauma, and ambulatory hand surgery.",
        summary: "Adductor canal block preserves quadriceps strength after TKA; femoral block causes more weakness.",
        prerequisites: ["ortho_multimodal_analgesia"],
        nbkSection: "Regional Anesthesia",
        l5: [
          {
            shortName: "ortho_eras_arthroplasty",
            title: "ERAS Pathways in Arthroplasty",
            definition: "Enhanced recovery after surgery bundles for hip and knee replacement.",
            summary: "Early mobilization, thromboprophylaxis, and discharge planning integrated with analgesia.",
            nbkSection: "ERAS",
          },
        ],
      },
    ],
  },
  {
    existingSpineId: "spine_medicine_clinical_l3_deep_vein_thrombosis_pe",
    deferredFrom: "orthopaedic_postoperative_thromboembolism_prophylaxis",
    subcategory: "Perioperative Medicine",
    l4: [
      {
        shortName: "ortho_vte_risk_after_arthroplasty",
        title: "VTE Risk After Hip and Knee Arthroplasty",
        definition:
          "Elevated venous thromboembolism risk after total joint arthroplasty requiring risk-stratified prophylaxis.",
        summary: "Mechanical and pharmacologic prophylaxis reduce symptomatic VTE; balance bleeding risk.",
        nbkSection: "VTE Prophylaxis",
      },
      {
        shortName: "ortho_vte_prophylaxis_regimens",
        title: "Orthopaedic VTE Prophylaxis Regimens",
        definition:
          "Aspirin, LMWH, warfarin, and DOAC options with duration guidelines after arthroplasty and hip fracture surgery.",
        summary: "AAOS and CHEST guidelines inform agent selection; aspirin acceptable in selected TJA patients.",
        prerequisites: ["ortho_vte_risk_after_arthroplasty"],
        nbkSection: "Prophylaxis Regimens",
      },
      {
        shortName: "ortho_hip_fracture_vte",
        title: "VTE Prophylaxis After Hip Fracture Surgery",
        definition: "Extended prophylaxis considerations in elderly hip fracture patients with prolonged immobility.",
        summary: "Higher baseline VTE risk; combine mechanical and pharmacologic prophylaxis when not contraindicated.",
        prerequisites: ["ortho_vte_prophylaxis_regimens"],
        nbkSection: "Hip Fracture",
      },
    ],
  },
  {
    existingSpineId: "spine_medicine_clinical_l3_wound_healing_surgical",
    deferredFrom: "orthopaedic_perioperative_infection_prevention",
    subcategory: "Perioperative Medicine",
    l4: [
      {
        shortName: "ortho_surgical_site_infection_prevention",
        title: "Surgical Site Infection Prevention in Orthopaedics",
        definition:
          "Bundle elements including skin prep, antibiotic timing, glucose control, and normothermia to reduce SSI after arthroplasty and trauma.",
        summary: "Cefazolin within 60 minutes of incision; redose for prolonged cases.",
        nbkSection: "Infection Prevention",
      },
      {
        shortName: "ortho_periprosthetic_infection_prevention",
        title: "Periprosthetic Joint Infection Prevention",
        definition:
          "Modifiable risk factor optimization and prophylactic antibiotic selection for MRSA-colonized patients before arthroplasty.",
        summary: "Decolonization protocols and vancomycin addition for high-risk patients.",
        prerequisites: ["ortho_surgical_site_infection_prevention"],
        nbkSection: "PJI Prevention",
        l5: [
          {
            shortName: "ortho_laminar_airflow_and_bundles",
            title: "Laminar Airflow and SSI Bundles in Arthroplasty",
            definition: "Operating-room environmental controls and checklist bundles for joint replacement.",
            summary: "Combined interventions reduce deep infection rates in registry data.",
            nbkSection: "SSI Bundles",
          },
        ],
      },
    ],
  },
];

export function mergedExistingDeferredFrom(): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of MERGED_INTO_EXISTING) {
    if (m.mergedIntoExistingSpineId && m.l4OrthoContextPending) {
      map.set(m.mergedIntoExistingSpineId, m.shortName);
    }
  }
  return map;
}
