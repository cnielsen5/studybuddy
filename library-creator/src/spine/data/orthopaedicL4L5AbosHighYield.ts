import type { OrthoAnchorL4L5Spec } from "./orthopaedicL4L5Types.js";
import { ABOS_LENS_HIGH_YIELD_IDS } from "./abosLensConfig.js";
import { ORTHO_L4L5_OVERRIDES } from "./orthopaedicL4L5Overrides.js";
import { l4, l5 } from "./orthopaedicL4L5Helpers.js";

/** Build chained L4 specs from ordered topic rows. */
function chain(
  anchorShortName: string,
  rows: Array<{
    short: string;
    title: string;
    def: string;
    sum: string;
    nbk?: string;
    l5?: ReturnType<typeof l5>[];
  }>,
  notes?: string
): OrthoAnchorL4L5Spec {
  return {
    anchorShortName,
    notes,
    l4: rows.map((row, i) =>
      l4(row.short, row.title, row.def, row.sum, {
        prerequisites: i > 0 ? [rows[i - 1]!.short] : undefined,
        nbkSection: row.nbk,
        l5: row.l5,
      })
    ),
  };
}

const SPECS: Record<string, OrthoAnchorL4L5Spec> = {
  fracture_healing_and_bone_remodeling_clinical: chain("fracture_healing_and_bone_remodeling_clinical", [
    {
      short: "fracture_healing_phases",
      title: "Fracture Healing Phases",
      def: "Hematoma, inflammation, soft callus, hard callus, and remodeling phases of secondary bone healing.",
      sum: "Primary healing requires rigid fixation; secondary healing proceeds through visible callus formation.",
    },
    {
      short: "factors_affecting_union",
      title: "Factors Affecting Fracture Union",
      def: "Biologic and mechanical factors including nicotine, diabetes, NSAIDs, infection, and fixation stability.",
      sum: "Smoking and NSAIDs impair union; unstable fixation causes delayed healing or nonunion.",
    },
    {
      short: "clinical_assessment_of_union",
      title: "Clinical and Radiographic Assessment of Union",
      def: "Physical examination, pain with stress, and radiographic bridging trabeculae defining clinical union.",
      sum: "Serial radiographs at 6–12 weeks; CT for doubtful union before revision.",
    },
    {
      short: "nonunion_and_delayed_union_management",
      title: "Nonunion and Delayed Union Management",
      def: "Hypertrophic versus atrophic nonunion biology and revision strategies including reaming, graft, and exchange nailing.",
      sum: "Hypertrophic nonunion needs stability; atrophic nonunion needs biologic augmentation.",
      l5: [
        l5(
          "exchange_nailing_nonunion",
          "Exchange Nailing for Femoral Nonunion",
          "Reamed exchange intramedullary nailing with larger diameter nail for femoral shaft nonunion.",
          "Dynamization alone may suffice for hypertrophic tibial nonunion; femoral atrophic often needs graft."
        ),
      ],
    },
  ]),

  musculoskeletal_biomechanics_principles: chain("musculoskeletal_biomechanics_principles", [
    {
      short: "stress_strain_and_modulus",
      title: "Stress, Strain, and Elastic Modulus",
      def: "Material properties describing load-deformation behavior of bone, tendon, and implant metals.",
      sum: "Stiff implants shield bone (stress shielding); tendon viscoelasticity affects repair loading.",
    },
    {
      short: "moment_arms_and_lever_mechanics",
      title: "Moment Arms and Lever Mechanics",
      def: "Force multiplication at joints and effect of offset on implant and fixation loading.",
      sum: "Hip abductor moment arm affects Trendelenburg gait after arthroplasty.",
    },
    {
      short: "joint_reaction_forces",
      title: "Joint Reaction Forces",
      def: "Forces across hip, knee, and shoulder during gait and activity estimated by free-body analysis.",
      sum: "Peak hip joint reaction exceeds three times body weight in normal gait.",
    },
    {
      short: "fixation_construct_biomechanics",
      title: "Fixation Construct Biomechanics",
      def: "Load sharing between implant and bone in plates, nails, and external fixators.",
      sum: "Bridge plating reduces bone strain; lag screws convert tensile to compressive forces at fracture site.",
    },
  ]),

  orthopaedic_radiographic_imaging: chain("orthopaedic_radiographic_imaging", [
    {
      short: "standard_radiographic_views",
      title: "Standard Radiographic Views",
      def: "AP, lateral, oblique, and joint-specific views for shoulder, hip, knee, ankle, and spine.",
      sum: "Always obtain orthogonal views; compare with contralateral side in paediatrics when appropriate.",
    },
    {
      short: "systematic_film_interpretation",
      title: "Systematic Film Interpretation",
      def: "ABCS approach: alignment, bone, cartilage/joint space, soft tissue.",
      sum: "Soft-tissue swelling and fat-pad signs suggest occult fracture.",
    },
    {
      short: "alignment_and_angular_measurement",
      title: "Alignment and Angular Measurement",
      def: "Mechanical axis, joint line obliquity, and anatomic angles for preoperative planning.",
      sum: "Hip-knee-ankle alignment guides osteotomy and arthroplasty component positioning.",
    },
    {
      short: "postoperative_radiographic_assessment",
      title: "Postoperative Radiographic Assessment",
      def: "Evaluation of implant position, fracture reduction, and signs of loosening or nonunion.",
      sum: "Lucency around cementless stems and progressive screw cutout indicate failure modes.",
    },
  ]),

  compartment_syndrome_and_fasciotomy: chain("compartment_syndrome_and_fasciotomy", [
    {
      short: "compartment_syndrome_pathophysiology",
      title: "Compartment Syndrome Pathophysiology",
      def: "Elevated intracompartmental pressure reducing capillary perfusion below critical threshold.",
      sum: "Ischemia-reperfusion causes irreversible muscle and nerve damage within hours.",
    },
    {
      short: "compartment_syndrome_clinical_diagnosis",
      title: "Compartment Syndrome Clinical Diagnosis",
      def: "Pain out of proportion, pain with passive stretch, paresthesias, pallor, pulselessness, paralysis.",
      sum: "Clinical diagnosis in awake patients; do not wait for compartment pressure if exam is convincing.",
    },
    {
      short: "compartment_pressure_measurement",
      title: "Compartment Pressure Measurement",
      def: "Intracompartmental pressure monitoring when clinical exam is unreliable (sedation, intubation, children).",
      sum: "Delta pressure (diastolic BP minus compartment pressure) ≤30 mmHg indicates syndrome.",
    },
    {
      short: "fasciotomy_technique_and_complications",
      title: "Fasciotomy Technique and Complications",
      def: "Two-incision leg fasciotomy and forearm volar-dorsal release with wound management.",
      sum: "Delayed fasciotomy risks Volkmann contracture; skin grafting often required for wound closure.",
      l5: [
        l5(
          "volkmann_ischemic_contracture",
          "Volkmann Ischemic Contracture",
          "Fixed flexion deformity of forearm and hand after untreated forearm compartment syndrome.",
          "Prevention is emergent fasciotomy; late treatment includes tendon lengthening and free muscle transfer."
        ),
      ],
    },
  ]),

  polytrauma_and_damage_control_orthopaedics: chain("polytrauma_and_damage_control_orthopaedics", [
    {
      short: "polytrauma_assessment_and_iss",
      title: "Polytrauma Assessment and ISS",
      def: "Injury Severity Score and physiologic markers guiding orthopaedic timing in multiply injured patients.",
      sum: "ISS >40 and lactate elevation favor damage-control strategy.",
    },
    {
      short: "damage_control_orthopaedic_principles",
      title: "Damage Control Orthopaedic Principles",
      def: "Temporary stabilization with external fixation before definitive fixation after resuscitation.",
      sum: "Limit operative time and blood loss in first 24 hours; plan second-look and definitive surgery.",
    },
    {
      short: "fat_embolism_and_second_hit",
      title: "Fat Embolism and Second-Hit Phenomenon",
      def: "Systemic inflammatory response after long-bone fixation in unstable patients causing ARDS and coagulopathy.",
      sum: "Early IM nailing of femur in stable patients is safe; delay when physiologically deranged.",
    },
    {
      short: "definitive_fixation_timing",
      title: "Definitive Fixation Timing",
      def: "Conversion from external fixation to IM nail or plate when lactate normalized and coagulopathy corrected.",
      sum: "Window often 5–10 days; pin-site infection risk increases with prolonged external fixation.",
    },
  ]),

  pelvic_and_acetabular_fractures: chain("pelvic_and_acetabular_fractures", [
    {
      short: "pelvic_ring_classification",
      title: "Pelvic Ring Classification",
      def: "Young-Burgess and Tile systems describing pelvic ring stability and injury mechanism.",
      sum: "LC, AP, and VS patterns predict hemorrhage source and fixation strategy.",
    },
    {
      short: "pelvic_hemorrhage_control",
      title: "Pelvic Hemorrhage Control",
      def: "Pelvic binder, angiographic embolization, and preperitoneal packing for hemodynamic instability.",
      sum: "Binder placement at greater trochanters; avoid definitive fixation before resuscitation.",
    },
    {
      short: "acetabular_fracture_classification",
      title: "Acetabular Fracture Classification",
      def: "Letournel and Judet classification by column and wall involvement.",
      sum: "Both-column fractures may be managed nonoperatively if congruent hip; displaced fractures need ORIF.",
    },
    {
      short: "acetabular_surgical_approaches",
      title: "Acetabular Surgical Approaches",
      def: "Kocher-Langenbeck, ilioinguinal, and Stoppa approaches matched to fracture pattern.",
      sum: "Approach selection balances exposure with sciatic and vascular risk.",
      l5: [
        l5(
          "post_traumatic_hip_arthritis",
          "Post-Traumatic Hip Arthritis After Acetabular Fracture",
          "Joint degeneration following malreduction or articular cartilage injury.",
          "THA after acetabular ORIF requires specialized revision techniques and prior hardware management."
        ),
      ],
    },
  ]),

  hip_fractures_and_dislocations: chain("hip_fractures_and_dislocations", [
    {
      short: "femoral_neck_fracture_classification",
      title: "Femoral Neck Fracture Classification",
      def: "Garden and Pauwels classifications describing displacement and shear angle of femoral neck fractures.",
      sum: "Displaced fractures in elderly often treated with arthroplasty; young patients need anatomic fixation.",
    },
    {
      short: "intertrochanteric_and_subtrochanteric_fractures",
      title: "Intertrochanteric and Subtrochanteric Fractures",
      def: "Extracapsular hip fractures managed with cephalomedullary nail or sliding hip screw.",
      sum: "Reverse obliquity patterns need intramedullary fixation; subtrochanteric may need long cephalomedullary nail.",
    },
    {
      short: "hip_fracture_arthroplasty_vs_orif",
      title: "Hip Fracture — Arthroplasty vs ORIF",
      def: "Hemiarthroplasty, total hip arthroplasty, and cannulated screw fixation based on age, activity, and displacement.",
      sum: "Active elderly with displaced intracapsular fractures may benefit from THA over hemiarthroplasty.",
    },
    {
      short: "traumatic_hip_dislocation",
      title: "Traumatic Hip Dislocation",
      def: "Posterior and anterior hip dislocations requiring urgent closed reduction within six hours to protect femoral head.",
      sum: "Sciatic nerve injury complicates posterior dislocation; post-reduction CT assesses acetabular and head injury.",
    },
  ]),

  total_hip_arthroplasty: chain("total_hip_arthroplasty", [
    {
      short: "tha_indications_and_contraindications",
      title: "THA Indications and Contraindications",
      def: "End-stage hip arthritis, osteonecrosis, and selected fracture indications with medical optimization.",
      sum: "Active infection and severe neurologic disease are contraindications.",
    },
    {
      short: "tha_surgical_approaches",
      title: "THA Surgical Approaches",
      def: "Posterior, direct anterior, anterolateral, and dual-mobility considerations.",
      sum: "Posterior approach has dislocation risk; anterior may reduce muscle damage with learning curve.",
    },
    {
      short: "tha_component_fixation",
      title: "THA Component Fixation",
      def: "Cemented versus cementless fixation, porous coating, and dual-mobility bearings.",
      sum: "Cementless fixation relies on initial scratch fit and biologic ingrowth.",
    },
    {
      short: "tha_complications",
      title: "THA Complications",
      def: "Dislocation, leg-length inequality, nerve injury, infection, and periprosthetic fracture.",
      sum: "Posterior soft-tissue repair and patient education reduce dislocation rate.",
      l5: [
        l5(
          "tha_dislocation_management",
          "THA Dislocation Management",
          "Closed reduction, abduction brace, and revision for recurrent instability.",
          "Component malposition and soft-tissue insufficiency are revision indications."
        ),
      ],
    },
  ]),

  total_knee_arthroplasty: chain("total_knee_arthroplasty", [
    {
      short: "tka_indications_and_alignment",
      title: "TKA Indications and Alignment Goals",
      def: "End-stage tricompartmental knee arthritis with mechanical axis restoration targets.",
      sum: "Neutral mechanical axis within 3 degrees is traditional goal; kinematic alignment is alternative philosophy.",
    },
    {
      short: "tka_component_design_and_balance",
      title: "TKA Component Design and Soft-Tissue Balance",
      def: "Femoral and tibial component sizing, polyethylene thickness, and gap balancing in flexion and extension.",
      sum: "Posterior-stabilized versus cruciate-retaining designs depend on PCL integrity and surgeon preference.",
    },
    {
      short: "tka_surgical_technique",
      title: "TKA Surgical Technique",
      def: "Measured resection versus gap technique, patellar resurfacing decisions, and tourniquet use.",
      sum: "Patellar maltracking causes anterior knee pain; component rotation affects flexion gap.",
    },
    {
      short: "tka_complications",
      title: "TKA Complications",
      def: "Stiffness, instability, patellar complications, infection, and periprosthetic fracture.",
      sum: "Manipulation under anesthesia for early stiffness; revision for instability from malrotation.",
    },
  ]),

  revision_arthroplasty: chain("revision_arthroplasty", [
    {
      short: "revision_indications",
      title: "Revision Arthroplasty Indications",
      def: "Aseptic loosening, instability, periprosthetic fracture, wear, and failed primary arthroplasty.",
      sum: "Workup includes labs, aspiration, and cross-sectional imaging for bone loss.",
    },
    {
      short: "bone_loss_classification",
      title: "Bone Loss Classification — Paprosky and AORI",
      def: "Acetabular and femoral defect grading guiding augments, cones, and structural graft.",
      sum: "Paprosky 3B acetabular defects need custom triflange or cage reconstruction.",
    },
    {
      short: "revision_component_strategies",
      title: "Revision Component Strategies",
      def: "Long stems, porous metaphyseal sleeves, constrained liners, and dual-mobility cups.",
      sum: "Restore hip center and leg length; constrained knee for collateral deficiency.",
    },
    {
      short: "revision_complications",
      title: "Revision Complications",
      def: "Higher dislocation, infection, and fracture rates than primary arthroplasty.",
      sum: "Two-stage exchange remains gold standard for chronic PJI in hip and knee.",
    },
  ]),

  periprosthetic_joint_infection_hip_and_knee: chain("periprosthetic_joint_infection_hip_and_knee", [
    {
      short: "pji_diagnosis_msis",
      title: "PJI Diagnosis — MSIS Criteria",
      def: "Major and minor criteria combining serology, synovial fluid, culture, and histology.",
      sum: "Synovial alpha-defensin and leukocyte esterase improve diagnosis in equivocal cases.",
    },
    {
      short: "pji_acute_vs_chronic",
      title: "Acute vs Chronic PJI",
      def: "Symptom duration, organism virulence, and implant biofilm formation distinguishing DAIR candidacy.",
      sum: "Acute postoperative infection within 4 weeks may be treated with DAIR; chronic needs exchange.",
    },
    {
      short: "pji_surgical_management",
      title: "PJI Surgical Management",
      def: "DAIR, one-stage exchange, two-stage exchange with antibiotic spacer, and resection arthroplasty.",
      sum: "Two-stage exchange has highest eradication rate for chronic hip and knee PJI.",
    },
    {
      short: "pji_antibiotic_therapy",
      title: "PJI Antibiotic Therapy",
      def: "IV and oral suppressive regimens guided by culture and ID consultation.",
      sum: "Prolonged IV therapy between stages; oral suppression when explant not possible.",
      l5: [
        l5(
          "pji_two_stage_protocol",
          "Two-Stage Exchange Protocol",
          "Spacer placement, antibiotic holiday, and reimplantation timing with normalized inflammatory markers.",
          "6 weeks minimum between stages; reimplant when ESR/CRP trend normalized."
        ),
      ],
    },
  ]),

  cervical_spine_degenerative_disease: chain("cervical_spine_degenerative_disease", [
    {
      short: "cervical_radiculopathy",
      title: "Cervical Radiculopathy",
      def: "Nerve root compression from disc herniation or foraminal stenosis causing dermatomal pain and weakness.",
      sum: "Spurling test is provocative; MRI confirms level; trial of conservative care first.",
    },
    {
      short: "cervical_myelopathy",
      title: "Cervical Myelopathy",
      def: "Spinal cord compression from spondylosis causing gait dysfunction, hand clumsiness, and hyperreflexia.",
      sum: "Surgical decompression indicated for progressive myelopathy; anterior versus posterior by number of levels.",
    },
    {
      short: "cervical_disc_herniation_management",
      title: "Cervical Disc Herniation Management",
      def: "ACDF, arthroplasty, and posterior foraminotomy options by level and alignment.",
      sum: "ACDF gold standard at one-two levels; preserve motion with arthroplasty in selected patients.",
    },
    {
      short: "cervical_deformity_and_instability",
      title: "Cervical Deformity and Instability",
      def: "Spondylolisthesis, kyphosis, and post-laminectomy instability requiring fusion.",
      sum: "Reducible deformity may need posterior-only; fixed kyphosis needs anterior release.",
    },
  ]),

  lumbar_disc_herniation_and_radiculopathy: chain("lumbar_disc_herniation_and_radiculopathy", [
    {
      short: "lumbar_disc_anatomy_and_pathophysiology",
      title: "Lumbar Disc Anatomy and Pathophysiology",
      def: "Nucleus pulposus herniation through annulus causing nerve root compression at L4-L5 and L5-S1.",
      sum: "Central herniation causes cauda equina; lateral herniation causes radiculopathy.",
    },
    {
      short: "lumbar_radiculopathy_evaluation",
      title: "Lumbar Radiculopathy Evaluation",
      def: "Straight-leg raise, crossed SLR, motor/sensory level mapping, and MRI correlation.",
      sum: "L5 radiculopathy weakens EHL; S1 affects gastrocsoleus and ankle reflex.",
    },
    {
      short: "lumbar_disc_conservative_care",
      title: "Lumbar Disc Conservative Care",
      def: "Activity modification, NSAIDs, epidural steroid injection, and physical therapy.",
      sum: "Most improve within 6–12 weeks; surgery for progressive deficit or cauda equina.",
    },
    {
      short: "lumbar_discectomy_indications",
      title: "Lumbar Discectomy Indications",
      def: "Microdiscectomy and minimally invasive techniques for persistent radiculopathy with correlating imaging.",
      sum: "Emergent surgery for cauda equina syndrome with urinary retention.",
    },
  ]),

  spinal_cord_injury_syndromes: chain("spinal_cord_injury_syndromes", [
    {
      short: "complete_vs_incomplete_sci",
      title: "Complete vs Incomplete SCI",
      def: "ASIA Impairment Scale grading motor and sensory function below injury level.",
      sum: "Incomplete injuries have better recovery potential; zone of partial preservation matters.",
    },
    {
      short: "central_cord_anterior_posterior_syndromes",
      title: "Central Cord, Anterior Cord, and Brown-Séquard Syndromes",
      def: "Incomplete injury patterns with characteristic motor and sensory deficits by tract involvement.",
      sum: "Central cord: upper extremity weakness greater than lower in hyperextension injury.",
    },
    {
      short: "autonomic_dysreflexia_and_complications",
      title: "Autonomic Dysreflexia and Chronic SCI Complications",
      def: "Hypertensive crisis from noxious stimulus below T6 lesion; pressure injuries and spasticity.",
      sum: "Remove stimulus first; sit patient up; nitroglycerin if severe.",
    },
    {
      short: "sci_rehabilitation_and_prognosis",
      title: "SCI Rehabilitation and Prognosis",
      def: "Multidisciplinary rehab, bladder-bowel management, and functional goals by injury level.",
      sum: "C6 independence in ADLs; T12 community ambulation with bracing in complete injury.",
    },
  ]),

  anterior_cruciate_ligament_injury: chain("anterior_cruciate_ligament_injury", [
    {
      short: "acl_injury_mechanism_and_exam",
      title: "ACL Injury Mechanism and Examination",
      def: "Pivot-shift, Lachman, and anterior drawer tests with hemarthrosis after acute injury.",
      sum: "Non-contact pivot common in sports; concurrent meniscus and MCL injury frequent.",
    },
    {
      short: "acl_imaging_and_associated_injury",
      title: "ACL Imaging and Associated Injury",
      def: "MRI tear pattern, bone bruise, Segond fracture, and meniscal status.",
      sum: "Lateral meniscus more often injured acutely; medial in chronic ACL deficiency.",
    },
    {
      short: "acl_graft_selection",
      title: "ACL Graft Selection",
      def: "Bone-patellar tendon-bone, hamstring, and quadriceps autograft versus allograft.",
      sum: "BTB higher anterior knee pain; hamstring preserves extensor mechanism; allograft in revision/low demand.",
    },
    {
      short: "acl_reconstruction_and_rtp",
      title: "ACL Reconstruction and Return to Play",
      def: "Tunnel placement, graft tension, rehab phases, and RTP criteria including hop testing.",
      sum: "Return typically 9–12 months; psychological readiness and graft incorporation guide clearance.",
      l5: [
        l5(
          "acl_revision_reconstruction",
          "ACL Revision Reconstruction",
          "Tunnel widening, malposition, and staged bone grafting before revision ACL.",
          "Two-stage with bone graft for malpositioned tunnels; consider lateral extra-articular tenodesis."
        ),
      ],
    },
  ]),

  meniscal_tears_and_management: chain("meniscal_tears_and_management", [
    {
      short: "meniscal_anatomy_and_tear_patterns",
      title: "Meniscal Anatomy and Tear Patterns",
      def: "Red-red, red-white, and white-white zones; longitudinal, bucket-handle, radial, and root tears.",
      sum: "Peripheral tears in vascular zone heal with repair; white-white often partial meniscectomy.",
    },
    {
      short: "meniscal_tear_clinical_presentation",
      title: "Meniscal Tear Clinical Presentation",
      def: "Joint line tenderness, effusion, locking, and McMurray test.",
      sum: "Bucket-handle tear causes mechanical block to extension.",
    },
    {
      short: "meniscal_repair_indications",
      title: "Meniscal Repair Indications",
      def: "Vertical longitudinal tears in young patients with stable knee and adequate tissue quality.",
      sum: "All-inside, inside-out, and outside-in techniques; protect with brace and limited flexion.",
    },
    {
      short: "meniscectomy_and_outcomes",
      title: "Meniscectomy and Long-Term Outcomes",
      def: "Partial versus total meniscectomy and accelerated OA risk.",
      sum: "Preserve meniscus when possible; root repair critical to prevent compartment overload.",
    },
  ]),

  shoulder_instability_and_labral_injuries: chain("shoulder_instability_and_labral_injuries", [
    {
      short: "anterior_shoulder_instability",
      title: "Anterior Shoulder Instability",
      def: "TUBS versus AMBRI classification; Bankart lesion and Hill-Sachs defect.",
      sum: "Young athletes need repair over stabilization alone; bone loss may need Latarjet.",
    },
    {
      short: "posterior_and_multidirectional_instability",
      title: "Posterior and Multidirectional Instability",
      def: "Posterior dislocation with seizure or electric shock; MDI with capsular laxity and rehab emphasis.",
      sum: "Posterior dislocation easily missed on AP radiograph; need axillary view.",
    },
    {
      short: "labral_tear_types",
      title: "Labral Tear Types — SLAP and Bankart",
      def: "Superior labrum anterior-posterior tears in overhead athletes; anterior labral avulsion in instability.",
      sum: "SLAP type II may need biceps tenodesis in older throwers.",
    },
    {
      short: "instability_surgical_stabilization",
      title: "Instability Surgical Stabilization",
      def: "Arthroscopic Bankart repair, remplissage for engaging Hill-Sachs, open Latarjet for bone loss.",
      sum: "Glenoid bone loss >20–25% indicates bone-block procedure.",
    },
  ]),

  rotator_cuff_pathology: chain("rotator_cuff_pathology", [
    {
      short: "cuff_anatomy_and_impingement",
      title: "Rotator Cuff Anatomy and Impingement",
      def: "Supraspinatus, infraspinatus, subscapularis, teres minor roles and subacromial impingement.",
      sum: "Neer and Hawkins tests suggest impingement; cuff tear causes weakness not just pain.",
    },
    {
      short: "cuff_tear_classification",
      title: "Cuff Tear Classification",
      def: "Partial versus full-thickness, size (small/medium/large/massive), and fatty infiltration (Goutallier).",
      sum: "Fatty infiltration stage 3–4 predicts poor repair healing.",
    },
    {
      short: "cuff_nonoperative_management",
      title: "Cuff Nonoperative Management",
      def: "Physical therapy, injections, and activity modification for partial tears and low demand.",
      sum: "Subacromial injection provides diagnostic and therapeutic value.",
    },
    {
      short: "cuff_repair_and_arthritis",
      title: "Cuff Repair and Cuff Tear Arthropathy",
      def: "Arthroscopic repair, superior capsular reconstruction, reverse shoulder arthroplasty for pseudoparalysis.",
      sum: "Irreparable massive tear in elderly may need reverse TSA rather than debridement alone.",
    },
  ]),

  primary_shoulder_arthroplasty: chain("primary_shoulder_arthroplasty", [
    {
      short: "shoulder_arthroplasty_indications",
      title: "Shoulder Arthroplasty Indications",
      def: "Osteoarthritis, inflammatory arthritis, osteonecrosis, and fracture indications for anatomic versus reverse.",
      sum: "Intact rotator cuff favors anatomic TSA; cuff deficiency favors reverse.",
    },
    {
      short: "anatomic_total_shoulder",
      title: "Anatomic Total Shoulder Arthroplasty",
      def: "Stemmed or stemless humeral component with polyethylene glenoid in osteoarthritis with intact cuff.",
      sum: "Glenoid version and inclination critical; posterior wear common.",
    },
    {
      short: "reverse_shoulder_arthroplasty",
      title: "Reverse Shoulder Arthroplasty",
      def: "Grammont-style reverse ball-and-socket shifting center of rotation for cuff-deficient shoulders.",
      sum: "Medialized center improves deltoid lever arm; scapular notching monitored radiographically.",
    },
    {
      short: "shoulder_arthroplasty_complications",
      title: "Shoulder Arthroplasty Complications",
      def: "Instability, nerve injury, infection, and component loosening.",
      sum: "Reverse TSA instability often anterior; anatomic TSA posterior subluxation with malposition.",
    },
  ]),

  shoulder_periprosthetic_joint_infection: chain("shoulder_periprosthetic_joint_infection", [
    {
      short: "shoulder_pji_diagnosis",
      title: "Shoulder PJI Diagnosis",
      def: "MSIS criteria adapted for shoulder with synovial fluid and tissue culture.",
      sum: "Propionibacterium acnes indolent infection common; hold antibiotics before culture.",
    },
    {
      short: "shoulder_pji_dair_and_debridement",
      title: "Shoulder PJI DAIR and Debridement",
      def: "Acute infection management with polyethylene exchange when modular components allow.",
      sum: "Chronic P. acnes often needs implant removal given biofilm on glenoid.",
    },
    {
      short: "shoulder_pji_resection_and_exchange",
      title: "Shoulder PJI Resection and Exchange",
      def: "One- and two-stage exchange; permanent resection for salvage.",
      sum: "Antibiotic spacer maintains soft-tissue envelope for reimplantation.",
    },
    {
      short: "shoulder_pji_prevention",
      title: "Shoulder PJI Prevention",
      def: "Skin prep, prophylaxis, and management of prior injection before arthroplasty.",
      sum: "Delay elective arthroplasty after shoulder injection to reduce infection risk.",
    },
  ]),

  distal_radius_fractures: chain("distal_radius_fractures", [
    {
      short: "distal_radius_fracture_classification",
      title: "Distal Radius Fracture Classification",
      def: "AO, Frykman, and extra-articular versus intra-articular patterns.",
      sum: "Volar tilt, radial height, and inclination define acceptable reduction.",
    },
    {
      short: "distal_radius_nonoperative_care",
      title: "Distal Radius Nonoperative Care",
      def: "Cast immobilization for stable extra-articular fractures in elderly low-demand patients.",
      sum: "Accept mild deformity in osteopenic elderly; functional ROM prioritized.",
    },
    {
      short: "distal_radius_orif_volar_plate",
      title: "Distal Radius ORIF — Volar Locking Plate",
      def: "Volar approach for displaced intra-articular fractures with locking plate fixation.",
      sum: "Avoid flexor tendon irritation with prominent hardware; measure volar tilt on lateral.",
    },
    {
      short: "distal_radius_complications",
      title: "Distal Radius Complications",
      def: "CRPS, median neuropathy, tendon rupture, and malunion.",
      sum: "Acute carpal tunnel release if median neuropathy develops after fracture.",
    },
  ]),

  nerve_compression_syndromes_upper_extremity: chain("nerve_compression_syndromes_upper_extremity", [
    {
      short: "carpal_tunnel_syndrome",
      title: "Carpal Tunnel Syndrome",
      def: "Median nerve compression at wrist with nocturnal paresthesias and thenar weakness.",
      sum: "Phalen and Tinel positive; EMG confirms; release most common hand surgery.",
    },
    {
      short: "cubital_tunnel_syndrome",
      title: "Cubital Tunnel Syndrome",
      def: "Ulnar nerve compression at elbow with claw hand and interossei weakness.",
      sum: "In-situ release versus transposition based on subluxation and work demands.",
    },
    {
      short: "radial_tunnel_and_pronator_syndrome",
      title: "Radial Tunnel and Pronator Syndrome",
      def: "Posterior interosseous and median nerve compression proximally in forearm.",
      sum: "Pain without motor loss suggests radial tunnel; weakness in EPL suggests PIN compression.",
    },
    {
      short: "upper_extremity_nerve_release_timing",
      title: "Upper Extremity Nerve Release Timing",
      def: "Conservative trial versus early surgery for progressive deficit or thenar atrophy.",
      sum: "Carpal tunnel with thenar atrophy needs prompt release; document EMG severity.",
    },
  ]),

  ankle_fractures_and_pilon_injuries: chain("ankle_fractures_and_pilon_injuries", [
    {
      short: "ankle_fracture_classification",
      title: "Ankle Fracture Classification",
      def: "Weber A/B/C and Lauge-Hansen mechanism-based classification.",
      sum: "Weber C with syndesmosis injury needs syndesmotic fixation; mortise alignment goal.",
    },
    {
      short: "ankle_fracture_orif",
      title: "Ankle Fracture ORIF",
      def: "Restoration of fibular length, medial malleolus fixation, and posterior malleolus when >25% articular involvement.",
      sum: "Syndesmotic reduction with hook test; avoid malreduction causing arthritis.",
    },
    {
      short: "pilon_fracture_staged_management",
      title: "Pilon Fracture Staged Management",
      def: "External fixation and delayed ORIF for soft-tissue swelling before definitive plating.",
      sum: "Blister and fracture-blister risk mandate staging; ORIF when wrinkle sign present.",
    },
    {
      short: "ankle_fracture_complications",
      title: "Ankle Fracture Complications",
      def: "Post-traumatic arthritis, syndesmosis diastasis, and wound complications.",
      sum: "Malreduction of fibula most common cause of poor outcome.",
    },
  ]),

  achilles_tendon_disorders: chain("achilles_tendon_disorders", [
    {
      short: "achilles_tendinopathy",
      title: "Achilles Tendinopathy",
      def: "Insertional versus midportion degenerative tendinopathy with eccentric loading rehab.",
      sum: "Alfredson eccentric protocol for midportion; avoid fluoroquinolones and corticosteroid injection.",
    },
    {
      short: "achilles_tendon_rupture_diagnosis",
      title: "Achilles Tendon Rupture Diagnosis",
      def: "Sudden pop, Thompson test, and palpable gap with plantarflexion weakness.",
      sum: "MRI when partial rupture suspected; ultrasound in experienced hands.",
    },
    {
      short: "achilles_rupture_treatment",
      title: "Achilles Rupture Treatment",
      def: "Nonoperative functional bracing versus surgical repair in active patients.",
      sum: "Early weight-bearing protocols reduce rerupture; VTE prophylaxis during immobilization.",
    },
    {
      short: "achilles_repair_complications",
      title: "Achilles Repair Complications",
      def: "Rerupture, wound breakdown, sural nerve injury, and deep vein thrombosis.",
      sum: "Wound necrosis higher with open repair in smokers; minimally invasive techniques reduce risk.",
    },
  ]),

  charcot_neuroarthropathy: chain("charcot_neuroarthropathy", [
    {
      short: "charcot_pathophysiology_and_stages",
      title: "Charcot Pathophysiology and Eichenholtz Stages",
      def: "Neuropathic bone and joint destruction in diabetes with acute fragmentation and coalescence phases.",
      sum: "Acute stage: immobilize non-weight-bearing; misdiagnosis as infection is common.",
    },
    {
      short: "charcot_clinical_diagnosis",
      title: "Charcot Clinical Diagnosis",
      def: "Warm, swollen, red foot with minimal pain and intact pulses distinguishing from cellulitis.",
      sum: "Temperature difference >2°C versus contralateral foot supports Charcot.",
    },
    {
      short: "charcot_nonoperative_management",
      title: "Charcot Nonoperative Management",
      def: "Total contact cast and protected weight-bearing until consolidation.",
      sum: "Cast changes weekly; may require months; lifelong depth-inlay shoes after.",
    },
    {
      short: "charcot_surgical_reconstruction",
      title: "Charcot Surgical Reconstruction",
      def: "Exostectomy, realignment osteotomy, and fusion for rocker-bottom deformity with ulcer.",
      sum: "Surgery when quiescent stage; high complication and amputation risk.",
    },
  ]),

  developmental_dysplasia_of_the_hip: chain("developmental_dysplasia_of_the_hip", [
    {
      short: "ddh_screening_and_exam",
      title: "DDH Screening and Physical Examination",
      def: "Ortolani and Barlow maneuvers in neonates; limited abduction in older infants.",
      sum: "Universal screening with exam and selective ultrasound per AAOS guidelines.",
    },
    {
      short: "ddh_imaging",
      title: "DDH Imaging",
      def: "Graf ultrasound before ossification; AP pelvis with Hilgenreiner and Perkin lines after.",
      sum: "Acetabular index and Shenton line disruption indicate dysplasia.",
    },
    {
      short: "ddh_pavlik_and_closed_reduction",
      title: "DDH Pavlik Harness and Closed Reduction",
      def: "Dynamic flexion-abduction splinting in infants; closed reduction and spica cast if harness fails.",
      sum: "Pavlik success highest under six months; monitor for avascular necrosis.",
    },
    {
      short: "ddh_open_reduction_and_osteotomy",
      title: "DDH Open Reduction and Osteotomy",
      def: "Open reduction with pelvic and femoral osteotomy for failed closed treatment or late presentation.",
      sum: "Salter innominate osteotomy improves coverage; monitor for redislocation.",
    },
  ]),

  slipped_capital_femoral_epiphysis: chain("slipped_capital_femoral_epiphysis", [
    {
      short: "scfe_classification_and_presentation",
      title: "SCFE Classification and Presentation",
      def: "Stable versus unstable slip by ability to weight-bear; acute, chronic, and acute-on-chronic.",
      sum: "Unstable slip has high AVN risk; urgent in-situ pinning.",
    },
    {
      short: "scfe_diagnosis",
      title: "SCFE Diagnosis",
      def: "Frog-leg lateral radiograph showing slip of femoral epiphysis relative to metaphysis.",
      sum: "Klein line fails to intersect epiphysis on AP view; bilateral in 20–40%.",
    },
    {
      short: "scfe_in_situ_pinning",
      title: "SCFE In-Situ Pinning",
      def: "Single or double screw fixation without further slip; avoid forceful reduction.",
      sum: "One screw in center-center position; prophylactic pinning of contralateral hip in high risk.",
    },
    {
      short: "scfe_complications",
      title: "SCFE Complications",
      def: "Avascular necrosis, chondrolysis, femoroacetabular impingement, and osteoarthritis.",
      sum: "AVN risk highest in unstable slips with attempted reduction.",
    },
  ]),

  paediatric_fractures_physeal_injuries: chain("paediatric_fractures_physeal_injuries", [
    {
      short: "salter_harris_classification",
      title: "Salter-Harris Classification",
      def: "Physeal fracture types I through V predicting growth disturbance risk.",
      sum: "SH III-IV need anatomic reduction; SH V carries worst prognosis despite normal initial radiograph.",
    },
    {
      short: "physeal_injury_reduction_principles",
      title: "Physeal Injury Reduction Principles",
      def: "Gentle reduction avoiding repeated attempts; CRPP versus ORIF by stability.",
      sum: "Minimize physeal trauma during fixation; smooth K-wires perpendicular to physis.",
    },
    {
      short: "growth_arrest_and_bar_resection",
      title: "Growth Arrest and Physeal Bar Resection",
      def: "Physeal bar resection with interposition for partial growth arrest before skeletal maturity.",
      sum: "Map bar with CT or MRI; resection only if adequate growth remaining.",
    },
    {
      short: "remodeling_potential",
      title: "Remodeling Potential by Age and Plane",
      def: "Angular deformity remodels better in young children and when in plane of joint motion.",
      sum: "Accept more angulation in distal radius and humerus in young children.",
    },
  ]),

  bone_tumor_evaluation_and_biopsy: chain("bone_tumor_evaluation_and_biopsy", [
    {
      short: "musculoskeletal_tumor_staging_workup",
      title: "Musculoskeletal Tumor Staging Workup",
      def: "Plain radiographs, MRI of whole compartment, CT chest, and biopsy planning.",
      sum: "Enneking staging for benign; AJCC for malignant bone tumors.",
    },
    {
      short: "radiographic_tumor_features",
      title: "Radiographic Tumor Features",
      def: "Zone of transition, periosteal reaction, matrix mineralization, and anatomic location.",
      sum: "Permeative destruction and wide transition suggest malignancy.",
    },
    {
      short: "biopsy_principles",
      title: "Biopsy Principles",
      def: "Planning biopsy tract in future resection plane; avoid contamination of compartments.",
      sum: "Core needle versus open biopsy; orthopaedic oncologist should perform or plan biopsy.",
    },
    {
      short: "benign_bone_lesions_overview",
      title: "Benign Bone Lesions Overview",
      def: "Osteochondroma, enchondroma, simple bone cyst, and fibrous dysplasia recognition.",
      sum: "Do not biopsy osteochondroma; cartilage cap thickness guides malignancy concern.",
    },
  ]),

  primary_malignant_bone_tumors: chain("primary_malignant_bone_tumors", [
    {
      short: "osteosarcoma",
      title: "Osteosarcoma",
      def: "Metaphyseal malignant bone-forming tumor in adolescents with sunburst and Codman triangle.",
      sum: "Neoadjuvant chemotherapy and limb-salvage resection; avoid amputation when oncologically safe.",
    },
    {
      short: "ewing_sarcoma",
      title: "Ewing Sarcoma",
      def: "Round cell malignancy in diaphysis of children and young adults with onion-skin periosteal reaction.",
      sum: "Chemotherapy and radiation sensitive; resection when feasible.",
    },
    {
      short: "chondrosarcoma",
      title: "Chondrosarcoma",
      def: "Cartilaginous malignancy in older adults resistant to chemotherapy; wide resection primary treatment.",
      sum: "Dedifferentiated variant carries poor prognosis.",
    },
    {
      short: "limb_salvage_principles",
      title: "Limb Salvage Principles",
      def: "Wide margin resection, reconstruction with prosthesis or allograft, and soft-tissue coverage.",
      sum: "Pathologic fracture does not mandate amputation if wide margin achievable.",
      l5: [
        l5(
          "rotationplasty_indication",
          "Rotationplasty Indication",
          "Functional limb rotation for distal femoral resection in skeletally immature patients.",
          "Ankle joint serves as knee after 180-degree rotation; selected pediatric indication."
        ),
      ],
    },
  ]),

  metastatic_bone_disease: chain("metastatic_bone_disease", [
    {
      short: "metastatic_bone_epidemiology_and_workup",
      title: "Metastatic Bone Disease Epidemiology and Workup",
      def: "Breast, lung, prostate, renal, and thyroid primaries; hypercalcemia and pathologic fracture.",
      sum: "Identify primary before fixation when unknown; multidisciplinary oncology care.",
    },
    {
      short: "impending_and_pathologic_fracture",
      title: "Impending and Pathologic Fracture",
      def: "Mirels score guiding prophylactic fixation for femoral metastases.",
      sum: "Score ≥9 favors prophylactic IM nail before complete fracture.",
    },
    {
      short: "metastatic_fracture_fixation",
      title: "Metastatic Fracture Fixation",
      def: "Load-sharing IM devices, cement augmentation, and durable construct for limited survival.",
      sum: "Treat entire femur with long cephalomedullary nail when multiple lesions present.",
    },
    {
      short: "spinal_metastatic_disease",
      title: "Spinal Metastatic Disease",
      def: "NOMS framework: neurologic, oncologic, mechanical, systemic decision for decompression and radiation.",
      sum: "Separates mechanical instability needing fusion from radiosensitive tumors.",
    },
  ]),
};

/** ABOS high-yield L4/L5 specs — excludes anchors with hand-crafted overrides. */
export const ORTHO_L4L5_ABOS_HIGH_YIELD: Record<string, OrthoAnchorL4L5Spec> = Object.fromEntries(
  Object.entries(SPECS).filter(([key]) => {
    if (ORTHO_L4L5_OVERRIDES[key]) return false;
    const id = `spine_medicine_clinical_l3_${key}`;
    return ABOS_LENS_HIGH_YIELD_IDS.has(id);
  })
);
