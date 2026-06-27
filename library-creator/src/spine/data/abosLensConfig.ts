import { ORTHOPAEDIC_HUB_SPECS } from "./orthopaedicHubs.js";
import { ORTHOPAEDIC_L3_SPECS, type OrthoL3Spec } from "./orthopaedicSurgeryL3Data.js";
import { CLUSTER_TO_HUB } from "./orthopaedicHubs.js";

/** High-yield lives on the lens only (G60) — ABOS weighting and exam frequency. */
export const ABOS_LENS_HIGH_YIELD_IDS = new Set([
  "spine_medicine_clinical_l3_fracture_healing_and_bone_remodeling_clinical",
  "spine_medicine_clinical_l3_musculoskeletal_biomechanics_principles",
  "spine_medicine_clinical_l3_orthopaedic_radiographic_imaging",
  "spine_medicine_clinical_l3_compartment_syndrome_and_fasciotomy",
  "spine_medicine_clinical_l3_fracture_classification_systems",
  "spine_medicine_clinical_l3_fracture_reduction_and_fixation_principles",
  "spine_medicine_clinical_l3_open_fractures_and_mangled_extremity",
  "spine_medicine_clinical_l3_polytrauma_and_damage_control_orthopaedics",
  "spine_medicine_clinical_l3_primary_survey_orthopaedic_trauma",
  "spine_medicine_clinical_l3_pelvic_and_acetabular_fractures",
  "spine_medicine_clinical_l3_hip_fractures_and_dislocations",
  "spine_medicine_clinical_l3_spine_trauma_fractures_and_instability",
  "spine_medicine_clinical_l3_total_hip_arthroplasty",
  "spine_medicine_clinical_l3_total_knee_arthroplasty",
  "spine_medicine_clinical_l3_revision_arthroplasty",
  "spine_medicine_clinical_l3_periprosthetic_joint_infection_hip_and_knee",
  "spine_medicine_clinical_l3_cervical_spine_degenerative_disease",
  "spine_medicine_clinical_l3_lumbar_disc_herniation_and_radiculopathy",
  "spine_medicine_clinical_l3_spinal_cord_injury_syndromes",
  "spine_medicine_clinical_l3_anterior_cruciate_ligament_injury",
  "spine_medicine_clinical_l3_meniscal_tears_and_management",
  "spine_medicine_clinical_l3_shoulder_instability_and_labral_injuries",
  "spine_medicine_clinical_l3_rotator_cuff_pathology",
  "spine_medicine_clinical_l3_primary_shoulder_arthroplasty",
  "spine_medicine_clinical_l3_shoulder_periprosthetic_joint_infection",
  "spine_medicine_clinical_l3_distal_radius_fractures",
  "spine_medicine_clinical_l3_nerve_compression_syndromes_upper_extremity",
  "spine_medicine_clinical_l3_ankle_fractures_and_pilon_injuries",
  "spine_medicine_clinical_l3_achilles_tendon_disorders",
  "spine_medicine_clinical_l3_charcot_neuroarthropathy",
  "spine_medicine_clinical_l3_developmental_dysplasia_of_the_hip",
  "spine_medicine_clinical_l3_slipped_capital_femoral_epiphysis",
  "spine_medicine_clinical_l3_general_paediatric_trauma",
  "spine_medicine_clinical_l3_paediatric_fractures_physeal_injuries",
  "spine_medicine_clinical_l3_bone_tumor_evaluation_and_biopsy",
  "spine_medicine_clinical_l3_primary_malignant_bone_tumors",
  "spine_medicine_clinical_l3_metastatic_bone_disease",
]);

/** Order topic L3 IDs: hub sequence (matches Orthobullets-style subspecialty nav), then topic order within hub. */
export function orderedTopicSpecs(): OrthoL3Spec[] {
  const byHub = new Map<string, OrthoL3Spec[]>();
  for (const spec of ORTHOPAEDIC_L3_SPECS) {
    const hub = spec.hub ?? CLUSTER_TO_HUB[spec.cluster] ?? "orthopaedic_basic_science";
    if (!byHub.has(hub)) byHub.set(hub, []);
    byHub.get(hub)!.push(spec);
  }
  const ordered: OrthoL3Spec[] = [];
  for (const hub of ORTHOPAEDIC_HUB_SPECS) {
    ordered.push(...(byHub.get(hub.shortName) ?? []));
  }
  return ordered;
}

export function orderedTopicIds(): string[] {
  return orderedTopicSpecs().map((s) => `spine_medicine_clinical_l3_${s.shortName}`);
}
