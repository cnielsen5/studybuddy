import type { OrthoAnchorL4L5Spec } from "./orthopaedicL4L5Types.js";
import { l4, l5 } from "./orthopaedicL4L5Helpers.js";

/** Hand-crafted L4/L5 — replaces default generator for listed anchors. */
export const ORTHO_L4L5_OVERRIDES: Record<string, OrthoAnchorL4L5Spec> = {
  fracture_reduction_and_fixation_principles: {
    anchorShortName: "fracture_reduction_and_fixation_principles",
    notes: "Bone grafts demoted from L3; L4 cluster under fixation principles per resident review.",
    l4: [
      l4(
        "absolute_vs_relative_stability",
        "Absolute vs Relative Stability",
        "Fixation constructs provide either absolute stability (anatomic reduction, primary bone healing) or relative stability (micro-motion, secondary healing with callus).",
        "Lag screw and compression plating aim for absolute stability; bridge plating and intramedullary nails permit controlled motion for secondary healing.",
        { nbkSection: "Fixation Principles" }
      ),
      l4(
        "reduction_techniques_open_and_closed",
        "Reduction Techniques — Open and Closed",
        "Methods to restore length, alignment, and rotation including closed manipulation, traction, and open direct reduction.",
        "Malreduction in rotation or length causes functional deficit. Indirect reduction preserves soft-tissue attachments when possible.",
        {
          prerequisites: ["absolute_vs_relative_stability"],
          nbkSection: "Reduction",
        }
      ),
      l4(
        "plate_and_screw_fixation",
        "Plate and Screw Fixation",
        "Application of plates and screws including lag screw technique, neutralization, compression, and bridge plating patterns.",
        "Plate length and screw density distribute stress. Periosteum devascularization risk increases with extensive stripping.",
        {
          prerequisites: ["reduction_techniques_open_and_closed"],
          nbkSection: "Plating",
          l5: [
            l5(
              "locking_plate_biomechanics",
              "Locking Plate Biomechanics",
              "Fixed-angle locking screw-plate constructs provide angular stability in osteoporotic or comminuted bone.",
              "Locking plates function as internal fixators; avoid compression on poor-quality bone.",
              { nbkSection: "Locking Plates" }
            ),
          ],
        }
      ),
      l4(
        "intramedullary_nailing_and_external_fixation",
        "Intramedullary Nailing and External Fixation",
        "Load-sharing intramedullary implants and external fixators for diaphyseal fractures, polytrauma, and soft-tissue compromise.",
        "Reamed nailing is standard for closed femoral shaft fractures. External fixation temporizes in damage-control and open-fracture settings.",
        {
          prerequisites: ["plate_and_screw_fixation"],
          nbkSection: "Nailing and External Fixation",
          l5: [
            l5(
              "damage_control_external_fixation",
              "Damage-Control External Fixation",
              "Temporary spanning external fixation to stabilize long-bone fractures before physiologic resuscitation and definitive fixation.",
              "Pin-site care and construct planning allow conversion to IM nail or plate when patient stabilizes.",
              { nbkSection: "Damage Control" }
            ),
          ],
        }
      ),
      l4(
        "bone_grafts_autograft_and_allograft",
        "Bone Grafts — Autograft and Allograft",
        "Autograft provides osteogenic cells, osteoinductive factors, and osteoconductive scaffold; allograft supplies osteoconduction without living cells.",
        "Iliac crest autograft remains gold standard for biologic augmentation; allograft avoids donor-site morbidity with slower incorporation.",
        {
          prerequisites: ["intramedullary_nailing_and_external_fixation"],
          nbkSection: "Bone Grafting",
          sharedNote: "Demoted from L3 bone_grafts_and_substitutes; shared with spine fusion and oncology reconstruction.",
        }
      ),
      l4(
        "bone_grafts_bmp_and_synthetic_substitutes",
        "Bone Grafts — BMP and Synthetic Substitutes",
        "Demineralized bone matrix, bone morphogenetic proteins, and synthetic ceramics as adjuncts for defect filling and fusion enhancement.",
        "rhBMP-2 indications include certain spinal fusions and tibial nonunions; cost, swelling, and heterotopic bone are considerations.",
        {
          prerequisites: ["bone_grafts_autograft_and_allograft"],
          nbkSection: "Bone Grafting",
          l5: [
            l5(
              "bmp_indications_and_complications",
              "BMP Indications and Complications",
              "Evidence-based indications and known complications of recombinant BMP in orthopaedic fusion and nonunion.",
              "Seroma, ectopic bone, and cancer risk debates inform shared decision-making and off-label restraint.",
              { nbkSection: "BMP" }
            ),
          ],
        }
      ),
    ],
  },

  fracture_classification_systems: {
    anchorShortName: "fracture_classification_systems",
    l4: [
      l4(
        "descriptive_fracture_terminology",
        "Descriptive Fracture Terminology",
        "Standard terms for fracture location, pattern, displacement, angulation, and associated soft-tissue injury.",
        "Consistent nomenclature enables communication, research, and treatment planning across teams.",
        { nbkSection: "Classification" }
      ),
      l4(
        "ao_ota_fracture_classification",
        "AO/OTA Fracture Classification",
        "Alphanumeric system classifying fractures by bone segment, location, and pattern complexity.",
        "AO/OTA provides universal long-bone and periarticular classification; higher numbers indicate increasing complexity.",
        {
          prerequisites: ["descriptive_fracture_terminology"],
          nbkSection: "AO/OTA",
        }
      ),
      l4(
        "regional_classification_systems",
        "Regional Classification Systems",
        "Anatomic-region schemes including Neer (proximal humerus), Garden (femoral neck), Gustilo (open fractures), and Schatzker (tibial plateau).",
        "Regional classifications guide operative indication and prognosis within specific anatomic areas.",
        {
          prerequisites: ["ao_ota_fracture_classification"],
          nbkSection: "Regional Classifications",
          l5: [
            l5(
              "gustilo_anderson_open_fracture_grading",
              "Gustilo-Anderson Open Fracture Grading",
              "Soft-tissue injury grading for open fractures predicting infection risk and guiding antibiotic duration.",
              "Type IIIB requires soft-tissue coverage; type IIIC includes arterial injury requiring repair.",
              { nbkSection: "Open Fractures" }
            ),
          ],
        }
      ),
      l4(
        "classification_treatment_and_prognosis",
        "Classification in Treatment Planning and Prognosis",
        "Using classification to select operative versus nonoperative management and estimate complication rates.",
        "Classification alone does not dictate treatment — patient factors and soft-tissue status modify algorithms.",
        {
          prerequisites: ["regional_classification_systems"],
          nbkSection: "Clinical Application",
        }
      ),
    ],
  },

  open_fractures_and_mangled_extremity: {
    anchorShortName: "open_fractures_and_mangled_extremity",
    l4: [
      l4(
        "open_fracture_initial_management",
        "Open Fracture Initial Management",
        "Emergency assessment, tetanus prophylaxis, culture-directed antibiotics, and sterile dressing for open fractures.",
        "Early IV antibiotics within one hour reduce infection; avoid repeated wound probing in the field.",
        { nbkSection: "Open Fractures" }
      ),
      l4(
        "gustilo_classification_and_antibiotics",
        "Gustilo Classification and Antibiotic Protocols",
        "Grading open fractures and selecting antibiotic duration and coverage based on wound severity.",
        "First-generation cephalosporin is standard; add aminoglycoside for type III; penicillin for farm injuries.",
        {
          prerequisites: ["open_fracture_initial_management"],
          nbkSection: "Antibiotic Protocols",
        }
      ),
      l4(
        "debridement_and_wound_management",
        "Surgical Debridement and Wound Management",
        "Timely débridement of devitalized tissue, irrigation, and stabilization to convert contaminated wounds to clean surgical fields.",
        "Serial débridement may be required; vacuum-assisted closure bridges to definitive coverage.",
        {
          prerequisites: ["gustilo_classification_and_antibiotics"],
          nbkSection: "Debridement",
          l5: [
            l5(
              "negative_pressure_wound_therapy_open_fracture",
              "Negative Pressure Wound Therapy in Open Fractures",
              "VAC/NPWT as bridge to flap coverage in high-grade open fractures.",
              "Reduces edema and bacterial load while preparing wound bed for definitive closure.",
              { nbkSection: "Wound Management" }
            ),
          ],
        }
      ),
      l4(
        "mangled_extremity_severity_score",
        "Mangled Extremity Severity Score (MESS)",
        "Scoring system combining injury energy, limb ischemia, shock, and age to aid salvage versus amputation decisions.",
        "MESS ≥7 suggests amputation may be appropriate; clinical judgment and patient preference remain paramount.",
        {
          prerequisites: ["debridement_and_wound_management"],
          nbkSection: "Mangled Extremity",
        }
      ),
    ],
  },

  primary_survey_orthopaedic_trauma: {
    anchorShortName: "primary_survey_orthopaedic_trauma",
    l4: [
      l4(
        "atls_primary_survey_orthopaedic",
        "ATLS Primary Survey in Orthopaedic Trauma",
        "Airway, breathing, circulation, disability, and exposure priorities before definitive fracture care.",
        "Life-threatening injuries take precedence; tourniquets and pelvic binders address exsanguination before imaging.",
        { nbkSection: "Primary Survey" }
      ),
      l4(
        "hemorrhage_control_and_resuscitation",
        "Hemorrhage Control and Resuscitation Endpoints",
        "Control of external and internal hemorrhage including pelvic binding, extremity tourniquets, and balanced transfusion.",
        "Permissive hypotension may apply before hemorrhage control; lactate and base deficit guide resuscitation.",
        {
          prerequisites: ["atls_primary_survey_orthopaedic"],
          nbkSection: "Resuscitation",
        }
      ),
      l4(
        "secondary_survey_and_injury_identification",
        "Secondary Survey and Injury Identification",
        "Head-to-toe examination after stabilization to identify all musculoskeletal and associated injuries.",
        "Log-roll with spinal precautions; document neurovascular status before and after reduction.",
        {
          prerequisites: ["hemorrhage_control_and_resuscitation"],
          nbkSection: "Secondary Survey",
        }
      ),
      l4(
        "timing_definitive_orthopaedic_surgery",
        "Timing of Definitive Orthopaedic Surgery",
        "Decision framework for immediate, delayed, and damage-control orthopaedic intervention based on physiologic status.",
        "Early total care when stable; damage control when ISS high or patient in extremis.",
        {
          prerequisites: ["secondary_survey_and_injury_identification"],
          nbkSection: "Surgical Timing",
          l5: [
            l5(
              "early_total_care_vs_damage_control",
              "Early Total Care vs Damage Control Orthopaedics",
              "Evidence and criteria distinguishing early definitive fixation from staged damage-control strategy.",
              "Second-hit inflammatory response risk guides timing in polytrauma.",
              { nbkSection: "Damage Control" }
            ),
          ],
        }
      ),
    ],
  },

  stress_fractures_and_insufficiency_fractures: {
    anchorShortName: "stress_fractures_and_insufficiency_fractures",
    notes: "Shared concept with foot/ankle high-risk sites and osteoporosis — see _shared_concept_note on L3.",
    l4: [
      l4(
        "fatigue_vs_insufficiency_fractures",
        "Fatigue vs Insufficiency Fractures",
        "Fatigue fractures result from repetitive loading on normal bone; insufficiency fractures occur in abnormal or osteoporotic bone under normal stress.",
        "Mechanism distinction guides workup for underlying bone disease versus training load modification.",
        {
          nbkSection: "Stress Fractures",
          sharedNote:
            "Shared with foot/ankle hub (navicular, metatarsals) and osteoporosis existing ref.",
        }
      ),
      l4(
        "high_risk_stress_fracture_locations",
        "High-Risk Stress Fracture Locations",
        "Anatomic sites where nonunion risk mandates aggressive treatment including femoral neck tension side, anterior tibia, navicular, and proximal fifth metatarsal.",
        "High-risk fractures often require operative stabilization and prolonged protected weight-bearing.",
        {
          prerequisites: ["fatigue_vs_insufficiency_fractures"],
          nbkSection: "High-Risk Locations",
        }
      ),
      l4(
        "stress_fracture_diagnosis",
        "Stress Fracture Diagnosis",
        "Clinical presentation and imaging including radiographs, MRI, and bone scan for occult stress injury.",
        "MRI is most sensitive early; radiographs may lag by weeks.",
        {
          prerequisites: ["high_risk_stress_fracture_locations"],
          nbkSection: "Diagnosis",
        }
      ),
      l4(
        "stress_fracture_management",
        "Stress Fracture Management",
        "Activity modification, protected weight-bearing, supplementation, and surgical stabilization when indicated.",
        "Treat underlying energy deficiency and bone health in athletes; bisphosphonates for insufficiency pelvic fractures in elderly.",
        {
          prerequisites: ["stress_fracture_diagnosis"],
          nbkSection: "Management",
          l5: [
            l5(
              "pelvic_insufficiency_fractures_elderly",
              "Pelvic Insufficiency Fractures in the Elderly",
              "Sacral and pelvic insufficiency fractures in osteoporotic patients — recognition and multidisciplinary management.",
              "MRI identifies sacral edema; consider cementoplasty in selected nonambulatory patients.",
              { nbkSection: "Insufficiency Fractures" }
            ),
          ],
        }
      ),
    ],
  },

  spine_trauma_fractures_and_instability: {
    anchorShortName: "spine_trauma_fractures_and_instability",
    notes: "A1: Cervical and thoracolumbar trauma as distinct L4 clusters per resident review.",
    l4: [
      l4(
        "spinal_cord_injury_acute_management",
        "Spinal Cord Injury — Acute Management",
        "Hemodynamic support, spinal precautions, methylprednisolone no longer standard, and early decompression when indicated for neurologic deficit.",
        "Mean arterial pressure goals and avoidance of hypotension protect spinal cord perfusion after injury.",
        { nbkSection: "Spinal Cord Injury" }
      ),
      l4(
        "cervical_spine_trauma_injuries",
        "Cervical Spine Trauma Injuries",
        "Subaxial cervical fracture-dislocations, facet injuries, and occipitocervical dissociation classified and managed with SLIC and stability assessment.",
        "Occipitocervical dissociation is highly unstable. SLIC ≥5 favors surgery for subaxial injuries. Maintain cervical spine precautions until cleared.",
        {
          prerequisites: ["spinal_cord_injury_acute_management"],
          nbkSection: "Cervical Trauma",
          l5: [
            l5(
              "occipitocervical_dissociation_management",
              "Occipitocervical Dissociation Management",
              "Recognition of craniocervical dissociation on imaging and urgent occiput-to-C2 stabilization.",
              "Power's ratio and CT findings prompt emergent fusion; high mortality without stabilization.",
              { nbkSection: "Occipitocervical" }
            ),
          ],
        }
      ),
      l4(
        "thoracolumbar_spine_trauma_injuries",
        "Thoracolumbar Spine Trauma Injuries",
        "Burst fractures, compression injuries, flexion-distraction (Chance), and fracture-dislocations of the thoracic and lumbar spine.",
        "TLICS guides operative versus nonoperative management. Posterior ligamentous complex integrity determines stability.",
        {
          prerequisites: ["cervical_spine_trauma_injuries"],
          nbkSection: "Thoracolumbar Trauma",
          l5: [
            l5(
              "tlics_operative_indications",
              "TLICS Operative Indications",
              "Thoracolumbar Injury Classification and Severity Score application for surgical decision-making.",
              "TLICS ≥4 typically warrants operative stabilization; neurologic deficit and PLC disruption drive urgency.",
              { nbkSection: "TLICS" }
            ),
          ],
        }
      ),
      l4(
        "spine_trauma_operative_stabilization",
        "Spine Trauma Operative Stabilization",
        "Posterior instrumentation, anterior corpectomy and fusion, and combined approaches for unstable spinal column injuries.",
        "Short-segment versus long-segment constructs depend on fracture pattern and bone quality.",
        {
          prerequisites: ["thoracolumbar_spine_trauma_injuries"],
          nbkSection: "Operative Stabilization",
        }
      ),
      l4(
        "spine_trauma_clearance_and_secondary_survey",
        "Spine Clearance and Secondary Survey",
        "Clinical clearance criteria, CT imaging, and collar removal protocols in awake alert trauma patients.",
        "NEXUS and Canadian C-spine rules reduce unnecessary imaging in low-risk patients.",
        {
          prerequisites: ["spine_trauma_operative_stabilization"],
          nbkSection: "Clearance",
        }
      ),
    ],
  },

  general_paediatric_trauma: {
    anchorShortName: "general_paediatric_trauma",
    notes: "A2: Child abuse and NAT live here — not under physeal injuries L3.",
    l4: [
      l4(
        "paediatric_trauma_assessment",
        "Paediatric Trauma Assessment",
        "Age-specific injury patterns, skeletal immaturity, and higher ligamentous-to-bone injury ratio in children.",
        "Children tolerate blood loss poorly; prioritize ATLS pediatric resuscitation before fracture fixation.",
        { nbkSection: "Paediatric Trauma" }
      ),
      l4(
        "non_accidental_trauma_recognition",
        "Non-Accidental Trauma and Child Abuse Recognition",
        "Suspicious injury patterns including metaphyseal corner fractures, posterior rib fractures, and inconsistent history requiring mandatory reporting.",
        "Ten-four-fifty rule and multiple injuries at different stages raise concern. Skeletal survey in infants.",
        {
          prerequisites: ["paediatric_trauma_assessment"],
          nbkSection: "Child Abuse",
          l5: [
            l5(
              "nat_reporting_and_team_approach",
              "NAT Reporting and Multidisciplinary Team Approach",
              "Legal reporting obligations, child protection team coordination, and safe discharge planning.",
              "Document meticulously; involve social work and pediatric specialists before orthopaedic discharge.",
              { nbkSection: "Child Protection" }
            ),
          ],
        }
      ),
      l4(
        "high_energy_paediatric_fractures",
        "High-Energy Paediatric Fractures",
        "Polytrauma, open fractures, and floating knee patterns in children with growth plate and vascular considerations.",
        "Vascular injury risk in supracondylar and femoral fractures requires serial neurovascular exams.",
        {
          prerequisites: ["non_accidental_trauma_recognition"],
          nbkSection: "High-Energy Trauma",
        }
      ),
      l4(
        "paediatric_trauma_imaging",
        "Paediatric Trauma Imaging",
        "Radiographic protocols including skeletal survey, CT sparingly, and MRI for occult injury and NAT evaluation.",
        "Low-dose CT when needed; compare with skeletal maturity and ossification centers.",
        {
          prerequisites: ["high_energy_paediatric_fractures"],
          nbkSection: "Imaging",
        }
      ),
    ],
  },

  cerebral_palsy_orthopaedic_management: {
    anchorShortName: "cerebral_palsy_orthopaedic_management",
    notes: "A5: Adult transition L5 added per resident review.",
    l4: [
      l4(
        "cp_classification_and_gait",
        "CP Classification and Gait Assessment",
        "GMFCS levels, spasticity patterns, and instrumented gait analysis guiding orthopaedic intervention timing.",
        "GMFCS IV-V patients need hip surveillance; ambulators benefit from SEMLS planning.",
        { nbkSection: "Cerebral Palsy" }
      ),
      l4(
        "cp_hip_surveillance_and_reconstruction",
        "CP Hip Surveillance and Reconstruction",
        "Progressive hip subluxation in non-ambulatory CP with monitoring, soft-tissue releases, and reconstructive osteotomy.",
        "Migration percentage on AP pelvis guides intervention before dislocation.",
        {
          prerequisites: ["cp_classification_and_gait"],
          nbkSection: "Hip Surveillance",
        }
      ),
      l4(
        "cp_multilevel_extremity_surgery",
        "CP Multilevel Extremity Surgery",
        "Single-event multilevel surgery addressing equinus, hamstring contracture, and femoral anteversion in ambulatory CP.",
        "SEMLS improves gait efficiency; postoperative rehab is prolonged.",
        {
          prerequisites: ["cp_hip_surveillance_and_reconstruction"],
          nbkSection: "SEMLS",
        }
      ),
      l4(
        "cp_spasticity_and_contracture_management",
        "CP Spasticity and Contracture Management",
        "Medical spasticity control, selective dorsal rhizotomy, and tendon transfers as adjuncts to bony procedures.",
        "Botulinum toxin and baclofen bridge to definitive surgery; tone management is multidisciplinary.",
        {
          prerequisites: ["cp_multilevel_extremity_surgery"],
          nbkSection: "Spasticity",
          l5: [
            l5(
              "cp_adult_transition_of_care",
              "Cerebral Palsy — Adult Transition of Care",
              "Transfer from pediatric to adult orthopaedic and rehabilitation services for aging CP patients with arthritis, scoliosis, and declining mobility.",
              "Lifetime musculoskeletal care includes hip pain in former ambulators, pathologic fractures, and equipment adaptation.",
              { nbkSection: "Adult CP" }
            ),
          ],
        }
      ),
    ],
  },
};
