import type { ConceptSourceReference } from "../../types/domainContext.js";
import { applyReviewDecisions } from "./orthopaedicReviewDecisions.js";

export interface OrthoL3Spec {
  shortName: string;
  cluster: string;
  subcategory: string;
  title: string;
  definition: string;
  summary: string;
  relevance: string;
  applications: string[];
  abosSection: string;
  /** Subspecialty hub shortName; inferred from cluster when omitted on topic nodes. */
  hub?: string;
  /** L3 subspecialty parent under orthopaedic L2. */
  isHub?: boolean;
  highYield?: boolean;
  depth?: number;
  examPart?: "Part I" | "Part II";
  /** Only strict knowledge dependencies (no default L2 prereq). */
  hardPrerequisites?: string[];
  nbkId?: string;
  nbkSection?: string;
  source?: ConceptSourceReference;
  extraSources?: ConceptSourceReference[];
  sharedNote?: string;
  reviewerNote?: string;
  /** When merged into an existing spine node — topic L3 omitted; L4 ortho context deferred. */
  mergedIntoExistingSpineId?: string;
  /** Flag for consolidation pass: build L4/L5 orthopaedic domain_context on this existing node. */
  l4OrthoContextPending?: boolean;
}

const L2 = "spine_medicine_clinical_l2_orthopaedic_surgery";
const l3 = (name: string) => `spine_medicine_clinical_l3_${name}`;

function pubmed(pmid: string, title: string): ConceptSourceReference {
  return { source: "PubMed", chapter: pmid, section: title };
}

/** Raw topic specs before resident review transforms — see applyReviewDecisions(). */
export const ORTHOPAEDIC_L3_RAW_SPECS: OrthoL3Spec[] = [
  // ── Basic Science (14) ──────────────────────────────────────────────
  {
    shortName: "musculoskeletal_biomechanics_principles",
    cluster: "Basic Science",
    subcategory: "Biomechanics",
    title: "Musculoskeletal Biomechanics Principles",
    definition:
      "Application of mechanical principles to forces, moments, and material behavior in bone, tendon, ligament, and joint systems.",
    summary:
      "Stress, strain, modulus, and moment arms govern implant loading and fracture fixation. Free-body analysis informs joint reaction forces and gait.",
    relevance: "Foundation for fracture fixation, arthroplasty stability, and implant design.",
    applications: ["Fixation construct selection", "Joint reaction force estimation", "Implant load sharing"],
    abosSection: "abos_p1_basic_science_principles",
    highYield: true,
    depth: 4,
    examPart: "Part I",
    nbkId: "NBK551679",
    nbkSection: "Biomechanics",
  },
  {
    shortName: "implant_materials_and_tribology",
    cluster: "Basic Science",
    subcategory: "Implant Science",
    title: "Implant Materials and Tribology",
    definition:
      "Properties of metals, polymers, and ceramics used in orthopaedic implants, including wear mechanisms at bearing interfaces.",
    summary:
      "Modulus mismatch drives stress shielding. Cross-linked polyethylene, ceramic-on-ceramic, and metal-on-metal bearings differ in wear and osteolysis risk.",
    relevance: "Core adult reconstruction and bearing selection knowledge.",
    applications: ["Bearing surface selection", "Stress shielding recognition", "Wear particle disease"],
    abosSection: "abos_p1_basic_science_principles",
    nbkId: "NBK557386",
    nbkSection: "Implant Materials",
  },
  {
    shortName: "gait_analysis_and_kinesiology",
    cluster: "Basic Science",
    subcategory: "Biomechanics",
    title: "Gait Analysis and Kinesiology",
    definition:
      "Systematic study of human locomotion phases, joint kinematics, and kinetics during the gait cycle.",
    summary:
      "Stance and swing phases divide gait. Hip, knee, and ankle moments peak at distinct phases. Pathologic gait patterns localize neuromuscular and structural deficits.",
    relevance: "ABOS Part I basic science; essential for CP, amputation, and arthroplasty assessment.",
    applications: ["Gait deviation interpretation", "Prosthetic alignment", "Post-arthroplasty assessment"],
    abosSection: "abos_p1_basic_science_principles",
    nbkId: "NBK559298",
    nbkSection: "Gait Analysis",
  },
  {
    shortName: "orthopaedic_radiographic_imaging",
    cluster: "Basic Science",
    subcategory: "Imaging",
    title: "Orthopaedic Radiographic Imaging",
    definition:
      "Standard radiographic views, positioning, and systematic interpretation of musculoskeletal plain films.",
    summary:
      "AP and lateral views are baseline. Alignment, joint space, cortical integrity, and soft-tissue signs guide fracture and arthritis assessment.",
    relevance: "Gateway diagnostic skill across all orthopaedic subspecialties.",
    applications: ["Fracture identification", "Arthritis grading", "Postoperative alignment assessment"],
    abosSection: "abos_p1_anatomy_approaches",
    highYield: true,
    nbkId: "NBK554585",
    nbkSection: "Radiography",
  },
  {
    shortName: "advanced_musculoskeletal_imaging",
    cluster: "Basic Science",
    subcategory: "Imaging",
    title: "Advanced Musculoskeletal Imaging",
    definition:
      "Cross-sectional and functional imaging modalities including CT, MRI, bone scan, and PET applied to musculoskeletal disorders.",
    summary:
      "MRI excels for soft tissue and marrow edema. CT provides fracture detail and arthroplasty planning. Bone scan detects occult stress injury and metastases.",
    relevance: "Required for tumor workup, occult fracture, and soft-tissue pathology.",
    applications: ["Occult fracture detection", "Soft tissue mass characterization", "Spine cord compression"],
    abosSection: "abos_p1_anatomy_approaches",
    nbkId: "NBK554585",
    nbkSection: "Advanced Imaging",
  },
  {
    shortName: "orthopaedic_surgical_approaches_anatomy",
    cluster: "Basic Science",
    subcategory: "Anatomy and Approaches",
    title: "Orthopaedic Surgical Approaches and Anatomy",
    definition:
      "Anatomic relationships and internervous planes defining safe surgical access to major musculoskeletal regions.",
    summary:
      "Approaches respect neurovascular bundles and internervous planes. Draping, positioning, and incision planning minimize iatrogenic injury.",
    relevance: "ABOS Part I anatomy section; prerequisite for all operative subspecialties.",
    applications: ["Approach selection", "Neurovascular protection", "Extensile exposure for trauma"],
    abosSection: "abos_p1_anatomy_approaches",
    highYield: true,
    nbkId: "NBK551582",
    nbkSection: "Surgical Approaches",
  },
  {
    shortName: "soft_tissue_coverage_and_flaps",
    cluster: "Basic Science",
    subcategory: "Soft Tissue Biology",
    title: "Soft Tissue Coverage and Flaps",
    definition:
      "Principles of wound bed preparation and soft-tissue transfer for exposed bone, hardware, and complex extremity wounds.",
    summary:
      "Local and free flaps restore vascularized coverage. Timing with fracture stabilization and infection control determines reconstructive success.",
    relevance: "Critical for open fractures, chronic osteomyelitis, and tumor resection defects.",
    applications: ["Open fracture coverage", "Flap selection", "Wound bed optimization"],
    abosSection: "abos_p1_basic_science_principles",
    nbkId: "NBK557386",
    nbkSection: "Soft Tissue Coverage",
  },
  {
    shortName: "compartment_syndrome_and_fasciotomy",
    cluster: "Basic Science",
    subcategory: "Soft Tissue Biology",
    title: "Compartment Syndrome and Fasciotomy",
    definition:
      "Elevated intracompartmental pressure causing ischemic muscle and nerve injury, diagnosed clinically and treated with emergent fasciotomy.",
    summary:
      "Pain out of proportion, pain with passive stretch, and tense compartments are hallmarks. Delayed diagnosis risks irreversible Volkmann ischemic contracture.",
    relevance: "Time-critical diagnosis in trauma and reperfusion injury.",
    applications: ["Clinical diagnosis", "Fasciotomy technique", "Post-fracture monitoring"],
    abosSection: "abos_p1_basic_science_principles",
    highYield: true,
    nbkId: "NBK448124",
    nbkSection: "Compartment Syndrome",
  },
  {
    shortName: "orthopaedic_preoperative_optimization",
    cluster: "Basic Science",
    subcategory: "Perioperative Medicine",
    title: "Orthopaedic Preoperative Optimization",
    definition:
      "Risk assessment and medical optimization before elective and urgent musculoskeletal surgery including nutrition, glycemic control, and smoking cessation.",
    summary:
      "Frailty, anemia, and uncontrolled diabetes increase complications. Prehabilitation and shared decision-making improve outcomes in arthroplasty.",
    relevance: "Distinct orthopaedic protocols beyond general preoperative assessment.",
    applications: ["Medical clearance", "Nutrition optimization", "Inflammatory arthritis perioperative management"],
    abosSection: "abos_p1_perioperative",
    nbkId: "NBK557519",
    nbkSection: "Preoperative Optimization",
  },
  {
    shortName: "orthopaedic_perioperative_infection_prevention",
    cluster: "Basic Science",
    subcategory: "Perioperative Medicine",
    title: "Orthopaedic Perioperative Infection Prevention",
    definition:
      "Antibiotic prophylaxis, skin preparation, laminar airflow, and bundle elements to reduce surgical site and periprosthetic infection.",
    summary:
      "Cefazolin within 60 minutes of incision is standard. Vancomycin for MRSA risk. Hair removal, glucose control, and normothermia are bundle components.",
    relevance: "High-yield ABOS topic; directly impacts arthroplasty and trauma outcomes.",
    applications: ["Antibiotic prophylaxis timing", "SSI prevention bundles", "MRSA decolonization"],
    abosSection: "abos_p1_perioperative",
    highYield: true,
    nbkId: "NBK557519",
    nbkSection: "Infection Prevention",
  },
  {
    shortName: "orthopaedic_postoperative_thromboembolism_prophylaxis",
    cluster: "Basic Science",
    subcategory: "Perioperative Medicine",
    title: "Orthopaedic Postoperative Thromboembolism Prophylaxis",
    definition:
      "Venous thromboembolism risk stratification and chemoprophylaxis or mechanical prophylaxis after major orthopaedic procedures.",
    summary:
      "Hip and knee arthroplasty and hip fracture carry high VTE risk. Aspirin, LMWH, and direct oral anticoagulants are guideline options by patient risk.",
    relevance: "Orthopaedic-specific VTE protocols differ from general surgery.",
    applications: ["Risk stratification", "Chemoprophylaxis selection", "Duration of prophylaxis"],
    abosSection: "abos_p1_perioperative",
    nbkId: "NBK557519",
    nbkSection: "VTE Prophylaxis",
  },
  {
    shortName: "orthopaedic_multimodal_pain_management",
    cluster: "Basic Science",
    subcategory: "Perioperative Medicine",
    title: "Orthopaedic Multimodal Pain Management",
    definition:
      "Combined analgesic strategies including regional anesthesia, acetaminophen, NSAIDs, and limited opioids to optimize postoperative pain control.",
    summary:
      "ERAS pathways reduce opioid consumption. Peripheral nerve blocks and spinal anesthesia improve early mobilization after lower extremity surgery.",
    relevance: "Postoperative section of ABOS perioperative blueprint.",
    applications: ["Regional anesthesia", "Opioid-sparing protocols", "Chronic pain after surgery"],
    abosSection: "abos_p1_perioperative",
    nbkId: "NBK557519",
    nbkSection: "Pain Management",
  },
  {
    shortName: "orthopaedic_legal_ethical_systems",
    cluster: "Basic Science",
    subcategory: "Systems-Based Practice",
    title: "Orthopaedic Legal, Ethical, and Systems-Based Practice",
    definition:
      "Professional obligations including informed consent, disclosure of errors, end-of-life decisions, and quality improvement in surgical care.",
    summary:
      "Shared decision-making and capacity assessment underpin consent. Value-based care and teamwork reduce adverse events in orthopaedic units.",
    relevance: "ABOS General Principles legal/ethical section.",
    applications: ["Informed consent", "Disclosure of complications", "Quality and safety initiatives"],
    abosSection: "abos_p1_legal_ethical",
    nbkId: "NBK557519",
    nbkSection: "Ethics",
  },
  {
    shortName: "metabolic_bone_disease_orthopaedic",
    cluster: "Basic Science",
    subcategory: "Metabolic Bone Disease",
    title: "Metabolic Bone Disease in Orthopaedic Practice",
    definition:
      "Disorders of bone mineralization and turnover including osteoporosis, osteomalacia, and Paget disease affecting fracture risk and implant fixation.",
    summary:
      "Bone quality affects fixation and periprosthetic fracture risk. Bisphosphonates and denosumab influence healing timelines and atypical fracture risk.",
    relevance: "Links preclinical bone biology to clinical fracture and arthroplasty decisions.",
    applications: ["Preoperative bone health optimization", "Atypical femur fracture", "Periprosthetic bone loss"],
    abosSection: "abos_p1_metabolic_bone",
    sharedNote: "Overlaps spine_medicine_clinical_l3_osteoporosis_management — orthopaedic context emphasizes fixation and fracture.",
    reviewerNote: "Consider merging metabolic bone with osteoporosis reference on consolidation pass.",
    nbkId: "NBK441999",
    nbkSection: "Metabolic Bone Disease",
  },

  // ── Trauma (18) ─────────────────────────────────────────────────────
  {
    shortName: "fracture_classification_systems",
    cluster: "Trauma",
    subcategory: "Fracture Principles",
    title: "Fracture Classification Systems",
    definition:
      "Standardized schemes describing fracture location, pattern, displacement, and associated soft-tissue injury for communication and treatment planning.",
    summary:
      "AO/OTA, Neer, Garden, and Gustilo classifications enable consistent documentation. Classification guides prognosis and operative indication.",
    relevance: "Foundation for all trauma subspecialty management.",
    applications: ["Fracture description", "Treatment algorithm selection", "Research and outcomes"],
    abosSection: "abos_p2_adult_trauma",
    highYield: true,
    nbkId: "NBK482316",
    nbkSection: "Classification",
  },
  {
    shortName: "fracture_reduction_and_fixation_principles",
    cluster: "Trauma",
    subcategory: "Fracture Principles",
    title: "Fracture Reduction and Fixation Principles",
    definition:
      "Biomechanical and biologic principles guiding closed and open reduction, immobilization, and internal or external fixation of fractures.",
    summary:
      "Absolute versus relative stability affects healing mode. Lag screws, plates, nails, and external fixators are selected by fracture personality and soft tissues.",
    relevance: "Core trauma knowledge integrating biomechanics and bone healing biology.",
    applications: ["Fixation strategy selection", "Reduction techniques", "Hardware removal timing"],
    abosSection: "abos_p2_adult_trauma",
    highYield: true,
    nbkId: "NBK482316",
    nbkSection: "Fixation Principles",
    extraSources: [pubmed("19218094", "SPRINT trial — reamed vs unreamed nailing")],
  },
  {
    shortName: "open_fractures_and_mangled_extremity",
    cluster: "Trauma",
    subcategory: "Open Fractures",
    title: "Open Fractures and Mangled Extremity",
    definition:
      "Fractures communicating with the external environment through soft-tissue disruption, graded by wound severity and requiring urgent management.",
    summary:
      "Gustilo classification guides antibiotic duration and soft-tissue coverage. MESS score aids mangled extremity salvage versus amputation decisions.",
    relevance: "High-yield ABOS trauma topic with time-sensitive management.",
    applications: ["Gustilo grading", "Antibiotic and debridement protocols", "Salvage vs amputation"],
    abosSection: "abos_p2_adult_trauma",
    highYield: true,
    nbkId: "NBK482316",
    nbkSection: "Open Fractures",
  },
  {
    shortName: "polytrauma_and_damage_control_orthopaedics",
    cluster: "Trauma",
    subcategory: "Polytrauma",
    title: "Polytrauma and Damage Control Orthopaedics",
    definition:
      "Staged orthopaedic management in multiply injured patients prioritizing life-threatening injuries and physiologic stabilization before definitive fixation.",
    summary:
      "Early total care versus damage control orthopaedics depends on ISS and physiologic status. External fixation temporizes long-bone fractures in unstable patients.",
    relevance: "ABOS multiple trauma section; integrates with ATLS principles.",
    applications: ["Damage control external fixation", "Timing of definitive fixation", "Fat embolism prevention"],
    abosSection: "abos_p2_multiple_trauma",
    highYield: true,
    nbkId: "NBK482316",
    nbkSection: "Polytrauma",
  },
  {
    shortName: "bone_grafts_and_substitutes",
    cluster: "Trauma",
    subcategory: "Fracture Principles",
    title: "Bone Grafts and Substitutes",
    definition:
      "Autograft, allograft, and synthetic materials used to enhance fracture healing, fill bone defects, and augment arthrodesis.",
    summary:
      "Autograft provides osteogenic, osteoinductive, and osteoconductive properties. BMP and demineralized bone matrix are adjuncts with defined indications.",
    relevance: "Shared across trauma, spine fusion, and oncology reconstruction.",
    applications: ["Nonunion augmentation", "Spinal fusion", "Tumor defect filling"],
    abosSection: "abos_p2_adult_trauma",
    nbkId: "NBK482316",
    nbkSection: "Bone Grafting",
  },
  {
    shortName: "clavicle_and_acromioclavicular_injuries",
    cluster: "Trauma",
    subcategory: "Upper Extremity Trauma",
    title: "Clavicle and Acromioclavicular Injuries",
    definition:
      "Fractures and ligamentous disruptions of the clavicle, acromioclavicular joint, and sternoclavicular region from direct or indirect force.",
    summary:
      "Midshaft clavicle fractures in active adults often warrant operative fixation. AC separations are graded by coracoclavicular ligament injury severity.",
    relevance: "ABOS upper extremity trauma; overlaps shoulder/elbow subspecialty.",
    applications: ["AC joint grading", "Clavicle fixation indications", "SC joint instability"],
    abosSection: "abos_p2_trauma_upper_extremity",
    nbkId: "NBK482316",
    nbkSection: "Clavicle Injuries",
  },
  {
    shortName: "proximal_humerus_fractures",
    cluster: "Trauma",
    subcategory: "Upper Extremity Trauma",
    title: "Proximal Humerus Fractures",
    definition:
      "Fractures of the surgical neck and tuberosities of the proximal humerus, classified by fragment number and displacement.",
    summary:
      "Neer classification guides treatment. Low-demand elderly patients may be managed nonoperatively; displaced multi-part fractures often require ORIF or arthroplasty.",
    relevance: "Common fragility fracture with complex decision-making.",
    applications: ["Neer classification", "ORIF vs hemiarthroplasty", "Post-traumatic stiffness"],
    abosSection: "abos_p2_trauma_upper_extremity",
    nbkId: "NBK482316",
    nbkSection: "Proximal Humerus",
  },
  {
    shortName: "humerus_shaft_and_elbow_fractures",
    cluster: "Trauma",
    subcategory: "Upper Extremity Trauma",
    title: "Humerus Shaft and Elbow Fractures",
    definition:
      "Diaphyseal humerus fractures and intra-articular distal humerus, radial head, and olecranon fractures around the elbow.",
    summary:
      "Radial nerve palsy complicates humerus shaft fractures. Distal humerus fractures often require dual-plate fixation. Radial head fractures follow Mason classification.",
    relevance: "Elbow fracture-dislocations require urgent assessment of instability.",
    applications: ["Radial nerve monitoring", "Dual plate fixation", "Radial head replacement"],
    abosSection: "abos_p2_trauma_upper_extremity",
    nbkId: "NBK482316",
    nbkSection: "Elbow Fractures",
  },
  {
    shortName: "forearm_fractures_and_monteggia",
    cluster: "Trauma",
    subcategory: "Upper Extremity Trauma",
    title: "Forearm Fractures and Monteggia Injuries",
    definition:
      "Radius and ulna shaft fractures and Monteggia fracture-dislocations involving ulnar fracture with radial head dislocation.",
    summary:
      "Anatomic restoration of forearm rotation is critical. Monteggia injuries require radial head reduction and ulnar fixation to restore stability.",
    relevance: "Longitudinal forearm instability affects supination-pronation arc.",
    applications: ["Forearm rotation restoration", "Monteggia recognition", "Essex-Lopresti injury"],
    abosSection: "abos_p2_trauma_upper_extremity",
    nbkId: "NBK482316",
    nbkSection: "Forearm Fractures",
  },
  {
    shortName: "pelvic_and_acetabular_fractures",
    cluster: "Trauma",
    subcategory: "Pelvic Trauma",
    title: "Pelvic and Acetabular Fractures",
    definition:
      "High-energy injuries to the pelvic ring and acetabulum disrupting stability and potentially causing hemorrhage and visceral injury.",
    summary:
      "Young-Burgess and Tile classifications describe pelvic ring injuries. Acetabular fractures follow Letournel classification; operative timing depends on hemodynamic status.",
    relevance: "High-energy trauma with multidisciplinary management.",
    applications: ["Pelvic binder application", "Acetabular approach selection", "Post-traumatic arthritis"],
    abosSection: "abos_p2_trauma_lower_extremity",
    highYield: true,
    nbkId: "NBK482316",
    nbkSection: "Pelvic Fractures",
  },
  {
    shortName: "hip_fractures_and_dislocations",
    cluster: "Trauma",
    subcategory: "Lower Extremity Trauma",
    title: "Hip Fractures and Dislocations",
    definition:
      "Fractures of the femoral head, neck, intertrochanteric, and subtrochanteric regions and traumatic hip dislocations.",
    summary:
      "Femoral neck fractures in young patients require anatomic fixation; in elderly often arthroplasty. Intertrochanteric fractures use cephalomedullary or sliding hip screw fixation.",
    relevance: "Common fragility fracture with significant morbidity and mortality.",
    applications: ["Garden classification", "Fixation vs arthroplasty", "Hip dislocation reduction urgency"],
    abosSection: "abos_p2_trauma_lower_extremity",
    highYield: true,
    nbkId: "NBK482316",
    nbkSection: "Hip Fractures",
  },
  {
    shortName: "femoral_shaft_fractures",
    cluster: "Trauma",
    subcategory: "Lower Extremity Trauma",
    title: "Femoral Shaft Fractures",
    definition:
      "Diaphyseal femur fractures typically from high-energy trauma, managed with intramedullary nailing or plating.",
    summary:
      "Reamed intramedullary nailing is standard for closed fractures. Floating knee and ipsilateral neck/shaft fractures require specialized fixation strategies.",
    relevance: "Common long-bone fracture; SPRINT trial informs reaming practice.",
    applications: ["Intramedullary nailing", "Floating knee management", "Ipsilateral neck/shaft fractures"],
    abosSection: "abos_p2_trauma_lower_extremity",
    nbkId: "NBK482316",
    nbkSection: "Femoral Shaft",
    extraSources: [pubmed("19218094", "SPRINT — reamed intramedullary nailing")],
  },
  {
    shortName: "tibial_plateau_fractures",
    cluster: "Trauma",
    subcategory: "Lower Extremity Trauma",
    title: "Tibial Plateau Fractures",
    definition:
      "Intra-articular fractures of the proximal tibia involving the weight-bearing articular surface and adjacent metaphysis.",
    summary:
      "Schatzker classification guides approach and fixation. Meniscus and ligament injuries are common associated injuries requiring assessment.",
    relevance: "Articular fracture requiring anatomic reduction to prevent post-traumatic arthritis.",
    applications: ["Schatzker classification", "Raft screw technique", "Associated ligament injury"],
    abosSection: "abos_p2_trauma_lower_extremity",
    nbkId: "NBK482316",
    nbkSection: "Tibial Plateau",
  },
  {
    shortName: "tibia_and_fibula_shaft_fractures",
    cluster: "Trauma",
    subcategory: "Lower Extremity Trauma",
    title: "Tibia and Fibula Shaft Fractures",
    definition:
      "Diaphyseal fractures of the tibia and fibula including open injuries with compartment syndrome risk.",
    summary:
      "Tibia is subcutaneous with high open fracture rate. Intramedullary nailing is preferred for closed diaphyseal fractures when soft tissues allow.",
    relevance: "Compartment syndrome monitoring is mandatory.",
    applications: ["Intramedullary nailing", "External fixation for open fractures", "Compartment monitoring"],
    abosSection: "abos_p2_trauma_lower_extremity",
    nbkId: "NBK482316",
    nbkSection: "Tibia Shaft",
  },
  {
    shortName: "pilon_and_ankle_fractures",
    cluster: "Trauma",
    subcategory: "Lower Extremity Trauma",
    title: "Pilon and Ankle Fractures",
    definition:
      "Distal tibial plafond (pilon) fractures and malleolar ankle fractures disrupting the mortise and syndesmosis.",
    summary:
      "Ankle fractures follow Lauge-Hansen and Weber classifications. Syndesmosis integrity determines fixation. Pilon fractures often require staged ORIF.",
    relevance: "Ankle mortise restoration is essential for function.",
    applications: ["Syndesmosis fixation", "Staged pilon ORIF", "Ankle fracture-dislocation reduction"],
    abosSection: "abos_p2_trauma_lower_extremity",
    nbkId: "NBK482316",
    nbkSection: "Ankle Fractures",
  },
  {
    shortName: "spine_trauma_fractures_and_instability",
    cluster: "Trauma",
    subcategory: "Spine Trauma",
    title: "Spine Trauma — Fractures and Instability",
    definition:
      "Traumatic vertebral column injuries including fracture-dislocations, burst fractures, and ligamentous instability with spinal cord injury risk.",
    summary:
      "TLICS and SLIC scores guide operative versus nonoperative management. Spinal cord injury requires hemodynamic support and early decompression when indicated.",
    relevance: "Overlaps spine subspecialty; distinct trauma management algorithms.",
    applications: ["TLICS scoring", "Spinal cord injury management", "Operative stabilization timing"],
    abosSection: "abos_p2_adult_spine",
    highYield: true,
    nbkId: "NBK448124",
    nbkSection: "Spine Trauma",
  },
  {
    shortName: "stress_fractures_and_insufficiency_fractures",
    cluster: "Trauma",
    subcategory: "Fracture Principles",
    title: "Stress Fractures and Insufficiency Fractures",
    definition:
      "Fatigue fractures from repetitive loading and insufficiency fractures in abnormal or osteoporotic bone under normal stress.",
    summary:
      "High-risk locations include femoral neck tension side, anterior tibia, and navicular. Insufficiency pelvic and sacral fractures occur in elderly osteoporotic patients.",
    relevance: "Sports medicine and fragility fracture overlap.",
    applications: ["High-risk stress fracture recognition", "MRI diagnosis", "Activity modification"],
    abosSection: "abos_p2_adult_trauma",
    nbkId: "NBK482316",
    nbkSection: "Stress Fractures",
  },
  {
    shortName: "malunion_nonunion_and_delayed_union",
    cluster: "Trauma",
    subcategory: "Fracture Complications",
    title: "Malunion, Nonunion, and Delayed Union",
    definition:
      "Failure of fracture healing with deformity (malunion), absence of healing (nonunion), or prolonged healing (delayed union).",
    summary:
      "Hypertrophic nonunion may respond to stabilization; atrophic nonunion requires biologic augmentation. Malunion correction uses osteotomy.",
    relevance: "Common complication management across trauma practice.",
    applications: ["Nonunion classification", "Revision fixation", "Corrective osteotomy"],
    abosSection: "abos_p2_adult_trauma",
    nbkId: "NBK482316",
    nbkSection: "Nonunion",
  },
  {
    shortName: "fat_embolism_and_trauma_complications",
    cluster: "Trauma",
    subcategory: "Polytrauma",
    title: "Fat Embolism and Trauma Complications",
    definition:
      "Systemic complications of major orthopaedic trauma including fat embolism syndrome, ARDS, and systemic inflammatory response.",
    summary:
      "Fat embolism presents with hypoxia, neurologic changes, and petechiae after long-bone fractures. Early stabilization and supportive care are mainstays.",
    relevance: "ABOS multiple trauma section; links to critical care.",
    applications: ["Fat embolism recognition", "ARDS management", "Timing of definitive fixation"],
    abosSection: "abos_p2_multiple_trauma",
    nbkId: "NBK482316",
    nbkSection: "Trauma Complications",
  },
  {
    shortName: "brachial_plexus_injuries",
    cluster: "Trauma",
    subcategory: "Upper Extremity Trauma",
    title: "Brachial Plexus Injuries",
    definition:
      "Traumatic or obstetric injury to the brachial plexus nerve roots and trunks causing upper extremity weakness, sensory loss, and dysfunction.",
    summary:
      "Upper plexus (Erb-Duchenne) and lower plexus (Klumpke) patterns localize injury. Complete avulsion has worse prognosis than stretch injuries.",
    relevance: "Links trauma, peds, and peripheral nerve subspecialties.",
    applications: ["Plexus pattern recognition", "Surgical reconstruction timing", "Nerve transfer options"],
    abosSection: "abos_p2_trauma_upper_extremity",
    nbkId: "NBK482316",
    nbkSection: "Brachial Plexus",
  },

  // ── Adult Reconstruction (10) ─────────────────────────────────────────
  {
    shortName: "hip_joint_biomechanics_and_arthropathy",
    cluster: "Adult Reconstruction",
    subcategory: "Hip",
    title: "Hip Joint Biomechanics and Arthropathy",
    definition:
      "Anatomic and biomechanical features of the hip joint and degenerative, inflammatory, and avascular pathologies leading to end-stage disease.",
    summary:
      "Hip reaction force depends on abductor moment arm. Osteoarthritis, AVN, and post-traumatic arthritis are common THA indications.",
    relevance: "Prerequisite for hip arthroplasty decision-making.",
    applications: ["Hip biomechanics", "AVN staging", "Preoperative templating"],
    abosSection: "abos_p2_adult_reconstruction",
    nbkId: "NBK441999",
    nbkSection: "Hip Disorders",
  },
  {
    shortName: "knee_joint_biomechanics_and_arthropathy",
    cluster: "Adult Reconstruction",
    subcategory: "Knee",
    title: "Knee Joint Biomechanics and Arthropathy",
    definition:
      "Knee kinematics, load distribution, and arthropathies including osteoarthritis, inflammatory arthritis, and post-traumatic degeneration.",
    summary:
      "Varus and valgus alignment alter compartment loading. Knee OA management progresses from conservative care to arthroplasty based on severity and alignment.",
    relevance: "Foundation for TKA and unicompartmental arthroplasty.",
    applications: ["Alignment assessment", "Conservative OA management", "TKA candidacy"],
    abosSection: "abos_p2_adult_reconstruction",
    nbkId: "NBK442001",
    nbkSection: "Knee Disorders",
    sharedNote: "General OA principles exist in spine_medicine_clinical_l3_osteoarthritis — this node emphasizes surgical arthropathy.",
  },
  {
    shortName: "total_hip_arthroplasty",
    cluster: "Adult Reconstruction",
    subcategory: "Hip Arthroplasty",
    title: "Total Hip Arthroplasty",
    definition:
      "Surgical replacement of the femoral head and acetabulum with prosthetic components to restore joint function and relieve pain in end-stage hip disease.",
    summary:
      "Approach, bearing selection, and component positioning determine stability and wear. Complications include dislocation, infection, and periprosthetic fracture.",
    relevance: "Core ABOS adult reconstruction topic.",
    applications: ["Approach selection", "Component positioning", "Dislocation prevention"],
    abosSection: "abos_p2_adult_reconstruction",
    highYield: true,
    depth: 5,
    examPart: "Part II",
    nbkId: "NBK441999",
    nbkSection: "Total Hip Arthroplasty",
    extraSources: [pubmed("19218094", "THA survivorship systematic review")],
  },
  {
    shortName: "total_knee_arthroplasty",
    cluster: "Adult Reconstruction",
    subcategory: "Knee Arthroplasty",
    title: "Total Knee Arthroplasty",
    definition:
      "Resurfacing of femoral, tibial, and patellar articular surfaces with prosthetic components for end-stage knee arthritis.",
    summary:
      "Mechanical alignment versus kinematic alignment philosophies guide component placement. ROM, stability, and patellar tracking determine outcomes.",
    relevance: "Among the most common elective orthopaedic procedures.",
    applications: ["Component alignment", "Patellar management", "Postoperative rehabilitation"],
    abosSection: "abos_p2_adult_reconstruction",
    highYield: true,
    depth: 5,
    examPart: "Part II",
    nbkId: "NBK442001",
    nbkSection: "Total Knee Arthroplasty",
    extraSources: [pubmed("26572537", "WOMAC outcomes in knee arthroplasty")],
  },
  {
    shortName: "unicompartmental_and_partial_joint_replacement",
    cluster: "Adult Reconstruction",
    subcategory: "Partial Arthroplasty",
    title: "Unicompartmental and Partial Joint Replacement",
    definition:
      "Replacement of a single articular compartment or hemiarthroplasty of the femoral head for localized joint disease.",
    summary:
      "UKA requires intact ACL and single-compartment disease. Hip hemiarthroplasty is used for displaced femoral neck fractures in selected elderly patients.",
    relevance: "ABOS hip and knee reconstruction subsection.",
    applications: ["UKA patient selection", "Hemiarthroplasty indications", "Conversion to TKA/THA"],
    abosSection: "abos_p2_adult_reconstruction",
    nbkId: "NBK442001",
    nbkSection: "Partial Arthroplasty",
  },
  {
    shortName: "revision_arthroplasty",
    cluster: "Adult Reconstruction",
    subcategory: "Revision Arthroplasty",
    title: "Revision Arthroplasty",
    definition:
      "Reoperation to exchange, augment, or remove failed joint replacement components for infection, instability, loosening, or wear.",
    summary:
      "Workup distinguishes septic from aseptic failure. Bone loss classification guides reconstruction with stems, cones, and augments.",
    relevance: "High-complexity ABOS topic appearing in clinical vignettes.",
    applications: ["Failure mode diagnosis", "Bone loss management", "Two-stage reimplantation"],
    abosSection: "abos_p2_adult_reconstruction",
    highYield: true,
    nbkId: "NBK441999",
    nbkSection: "Revision Arthroplasty",
  },
  {
    shortName: "bearing_surfaces_and_implant_tribology",
    cluster: "Adult Reconstruction",
    subcategory: "Implant Science",
    title: "Bearing Surfaces and Implant Tribology",
    definition:
      "Articulating material combinations in joint replacement and their wear characteristics, osteolysis potential, and clinical longevity.",
    summary:
      "Metal-on-polyethylene, ceramic-on-ceramic, and highly cross-linked polyethylene reduce wear at different cost profiles. Trunnion corrosion affects metal-on-metal hips.",
    relevance: "Direct ABOS reconstruction and basic science crossover.",
    applications: ["Bearing selection by age and activity", "Osteolysis management", "Recalled implant recognition"],
    abosSection: "abos_p2_adult_reconstruction",
    nbkId: "NBK557386",
    nbkSection: "Bearing Surfaces",
  },
  {
    shortName: "periprosthetic_joint_infection",
    cluster: "Adult Reconstruction",
    subcategory: "Arthroplasty Complications",
    title: "Periprosthetic Joint Infection",
    definition:
      "Infection involving joint replacement hardware requiring diagnostic workup and single- or two-stage revision with prolonged antibiotic therapy.",
    summary:
      "MSIS criteria combine serology, synovial fluid, and intraoperative findings. DAIR is option for acute infections; chronic often requires two-stage exchange.",
    relevance: "High-yield complication with defined diagnostic criteria.",
    applications: ["MSIS diagnostic criteria", "Two-stage exchange protocol", "Antibiotic spacer management"],
    abosSection: "abos_p2_adult_reconstruction",
    highYield: true,
    nbkId: "NBK441999",
    nbkSection: "Periprosthetic Infection",
  },
  {
    shortName: "periprosthetic_fracture_management",
    cluster: "Adult Reconstruction",
    subcategory: "Arthroplasty Complications",
    title: "Periprosthetic Fracture Management",
    definition:
      "Fractures adjacent to or involving joint replacement components classified by location, stability, and bone stock.",
    summary:
      "Vancouver classification guides hip periprosthetic fracture management. Intraoperative versus postoperative fractures differ in treatment options.",
    relevance: "ABOS femur subsection; increasing incidence with aging population.",
    applications: ["Vancouver classification", "Cable plate and stem revision", "Intraoperative fracture prevention"],
    abosSection: "abos_p2_adult_reconstruction",
    nbkId: "NBK441999",
    nbkSection: "Periprosthetic Fracture",
  },
  {
    shortName: "hip_and_knee_osteonecrosis",
    cluster: "Adult Reconstruction",
    subcategory: "Avascular Necrosis",
    title: "Hip and Knee Osteonecrosis",
    definition:
      "Ischemic death of subchondral bone leading to collapse and secondary arthritis, with etiologies including idiopathic, steroid, alcohol, and trauma.",
    summary:
      "Ficat and Steinberg staging guide hip ON treatment from core decompression to arthroplasty. Collapse predicts poor joint-preserving outcomes.",
    relevance: "Common THA indication in younger patients.",
    applications: ["Staging and prognosis", "Core decompression", "Arthroplasty timing"],
    abosSection: "abos_p2_adult_reconstruction",
    nbkId: "NBK441999",
    nbkSection: "Osteonecrosis",
  },

  // ── Spine (12) ──────────────────────────────────────────────────────
  {
    shortName: "cervical_spine_degenerative_disease",
    cluster: "Spine",
    subcategory: "Cervical Spine",
    title: "Cervical Spine Degenerative Disease",
    definition:
      "Age-related cervical spondylosis causing radiculopathy, myelopathy, and axial neck pain from disc degeneration and osteophyte formation.",
    summary:
      "Myelopathy presents with gait disturbance, hyperreflexia, and Hoffman sign. ACDF and posterior decompression/fusion are main surgical options.",
    relevance: "ABOS cervical spine 4% weight.",
    applications: ["Myelopathy vs radiculopathy", "ACDF indications", "Surgical approach selection"],
    abosSection: "abos_p2_adult_spine",
    highYield: true,
    nbkId: "NBK448124",
    nbkSection: "Cervical Degenerative",
  },
  {
    shortName: "cervical_spine_trauma_and_instability",
    cluster: "Spine",
    subcategory: "Cervical Spine",
    title: "Cervical Spine Trauma and Instability",
    definition:
      "Acute cervical spine injuries including occipitocervical, subaxial fracture-dislocations, and ligamentous instability.",
    summary:
      "SLIC score guides subaxial cervical spine treatment. Occipitocervical dissociation is highly unstable requiring urgent stabilization.",
    relevance: "Overlaps spine_trauma node; focuses on cervical-specific algorithms.",
    applications: ["SLIC score", "Occipitocervical stabilization", "Clearance in trauma"],
    abosSection: "abos_p2_adult_spine",
    nbkId: "NBK448124",
    nbkSection: "Cervical Trauma",
    reviewerNote: "Potential overlap with spine_trauma_fractures — consider merge if redundant after resident review.",
  },
  {
    shortName: "craniocervical_junction_disorders",
    cluster: "Spine",
    subcategory: "Cervical Spine",
    title: "Craniocervical Junction Disorders",
    definition:
      "Congenital and acquired disorders of the occiput-C2 region including basilar invagination, odontoid pathology, and rheumatoid instability.",
    summary:
      "Rheumatoid pannus causes atlantoaxial instability. Odontoid fractures in elderly may be managed operatively or with C1-C2 fusion.",
    relevance: "ABOS occiput-C2 subsection.",
    applications: ["Atlantoaxial instability", "Odontoid fracture management", "Basilar invagination"],
    abosSection: "abos_p2_adult_spine",
    nbkId: "NBK448124",
    nbkSection: "Craniocervical",
  },
  {
    shortName: "thoracic_spine_disorders",
    cluster: "Spine",
    subcategory: "Thoracic Spine",
    title: "Thoracic Spine Disorders",
    definition:
      "Pathology of the thoracic and thoracolumbar spine including fracture, deformity, disc herniation, and inflammatory disease.",
    summary:
      "Thoracic disc herniation presents with myelopathy. Scheuermann kyphosis and thoracic deformity require sagittal balance assessment.",
    relevance: "Lower ABOS weight but testable in deformity contexts.",
    applications: ["Thoracic disc herniation", "Scheuermann kyphosis", "Thoracolumbar fracture"],
    abosSection: "abos_p2_adult_spine",
    nbkId: "NBK448124",
    nbkSection: "Thoracic Spine",
  },
  {
    shortName: "lumbar_disc_herniation_and_radiculopathy",
    cluster: "Spine",
    subcategory: "Lumbar Spine",
    title: "Lumbar Disc Herniation and Radiculopathy",
    definition:
      "Displacement of lumbar intervertebral disc material causing nerve root compression and radicular pain or neurologic deficit.",
    summary:
      "Most disc herniations improve conservatively. Cauda equina syndrome requires emergent decompression. Surgical options include microdiscectomy.",
    relevance: "Common clinical presentation; overlaps general back pain red flags.",
    applications: ["Conservative vs surgical timing", "Cauda equina recognition", "Microdiscectomy outcomes"],
    abosSection: "abos_p2_adult_spine",
    highYield: true,
    nbkId: "NBK448124",
    nbkSection: "Lumbar Disc Herniation",
  },
  {
    shortName: "lumbar_spinal_stenosis",
    cluster: "Spine",
    subcategory: "Lumbar Spine",
    title: "Lumbar Spinal Stenosis",
    definition:
      "Narrowing of the lumbar spinal canal or neural foramina causing neurogenic claudication and radiculopathy in older adults.",
    summary:
      "Neurogenic claudication improves with flexion (shopping cart sign). Decompression with or without fusion depends on spondylolisthesis and instability.",
    relevance: "High-volume degenerative spine pathology.",
    applications: ["Neurogenic vs vascular claudication", "Decompression vs fusion", "Outcome expectations"],
    abosSection: "abos_p2_adult_spine",
    nbkId: "NBK448124",
    nbkSection: "Spinal Stenosis",
  },
  {
    shortName: "spondylolisthesis",
    cluster: "Spine",
    subcategory: "Lumbar Spine",
    title: "Spondylolisthesis",
    definition:
      "Anterior slippage of one vertebral body on another from isthmic, degenerative, or traumatic causes.",
    summary:
      "Isthmic spondylolisthesis affects young athletes; degenerative affects older adults. High-grade slips may require fusion with reduction.",
    relevance: "ABOS lumbar and sports spine crossover.",
    applications: ["Meyerding grading", "Pars defect recognition", "Fusion indications"],
    abosSection: "abos_p2_adult_spine",
    nbkId: "NBK448124",
    nbkSection: "Spondylolisthesis",
  },
  {
    shortName: "spinal_deformity_scoliosis_adult",
    cluster: "Spine",
    subcategory: "Spinal Deformity",
    title: "Adult Spinal Deformity",
    definition:
      "Sagittal and coronal plane malalignment in skeletally mature patients including degenerative scoliosis and fixed kyphosis.",
    summary:
      "SVA, PT, and PI-LL mismatch predict disability. Surgery balances correction with complication risk including pseudarthrosis and junctional failure.",
    relevance: "ABOS deformity section; growing subspecialty.",
    applications: ["Sagittal balance parameters", "Osteotomy planning", "Junctional kyphosis prevention"],
    abosSection: "abos_p2_adult_spine",
    nbkId: "NBK448124",
    nbkSection: "Adult Deformity",
  },
  {
    shortName: "spinal_cord_injury_syndromes",
    cluster: "Spine",
    subcategory: "Spinal Cord Injury",
    title: "Spinal Cord Injury Syndromes",
    definition:
      "Partial and complete spinal cord injury patterns including central cord, anterior cord, Brown-Séquard, and cauda equina syndromes.",
    summary:
      "Central cord syndrome affects upper extremities more than lower. ASIA impairment scale documents neurologic level and completeness.",
    relevance: "ABOS nonspecific spine section; critical for trauma and degenerative emergencies.",
    applications: ["ASIA examination", "Syndrome pattern recognition", "Steroid protocol knowledge"],
    abosSection: "abos_p2_adult_spine",
    highYield: true,
    nbkId: "NBK448124",
    nbkSection: "Spinal Cord Injury",
  },
  {
    shortName: "spinal_infections_and_inflammatory_disease",
    cluster: "Spine",
    subcategory: "Spine Infections",
    title: "Spinal Infections and Inflammatory Disease",
    definition:
      "Discitis, osteomyelitis, epidural abscess, and spondyloarthropathies affecting the vertebral column.",
    summary:
      "MRI is diagnostic for spinal infection. Biopsy guides antibiotics. Ankylosing spondylitis causes fusion and fracture risk through brittle spine.",
    relevance: "Infection management overlaps general ID; orthopaedic surgical indications distinct.",
    applications: ["MRI findings in discitis", "Surgical debridement indications", "Ankylosing spondylitis fractures"],
    abosSection: "abos_p2_adult_spine",
    nbkId: "NBK448124",
    nbkSection: "Spinal Infection",
  },
  {
    shortName: "spinal_fusion_and_instrumentation_principles",
    cluster: "Spine",
    subcategory: "Spine Surgery",
    title: "Spinal Fusion and Instrumentation Principles",
    definition:
      "Biomechanical and biologic principles of arthrodesis including graft selection, interbody fusion, and pedicle screw fixation.",
    summary:
      "360-degree fusion combines anterior support with posterior tension band. Pedicle screw density and rod contour affect construct stiffness.",
    relevance: "Operative foundation for spine surgery subspecialty.",
    applications: ["Interbody cage selection", "Pedicle screw placement", "Pseudarthrosis risk factors"],
    abosSection: "abos_p2_adult_spine",
    nbkId: "NBK448124",
    nbkSection: "Spinal Fusion",
  },
  {
    shortName: "sacroiliac_joint_dysfunction",
    cluster: "Spine",
    subcategory: "Pelvic Spine",
    title: "Sacroiliac Joint Dysfunction",
    definition:
      "Pain arising from the sacroiliac joint from instability, arthritis, trauma, or post-fusion stress transfer.",
    summary:
      "Diagnosis is clinical with provocative tests; injection confirms. Fusion is reserved for refractory cases after excluding lumbar pathology.",
    relevance: "ABOS nonspecific site section.",
    applications: ["Provocative testing", "Diagnostic injection", "SI fusion indications"],
    abosSection: "abos_p2_adult_spine",
    nbkId: "NBK448124",
    nbkSection: "Sacroiliac Joint",
    reviewerNote: "Scope vs general low back pain — confirm distinct L3 vs L4 detail on review.",
  },

  // ── Sports Medicine (9) ───────────────────────────────────────────────
  {
    shortName: "anterior_cruciate_ligament_injury",
    cluster: "Sports Medicine",
    subcategory: "Knee Ligaments",
    title: "Anterior Cruciate Ligament Injury",
    definition:
      "Tear of the anterior cruciate ligament destabilizing the knee in rotation and anterior translation, common in pivoting sports.",
    summary:
      "Pivot shift and Lachman tests suggest ACL injury. MRI confirms tear pattern. Reconstruction uses autograft or allograft with tunnel placement critical to kinematics.",
    relevance: "Highest-yield sports medicine knee topic on ABOS.",
    applications: ["Graft selection", "Reconstruction timing", "Return-to-play criteria"],
    abosSection: "abos_p2_sports_medicine",
    highYield: true,
    nbkId: "NBK442001",
    nbkSection: "ACL Injury",
  },
  {
    shortName: "posterior_cruciate_and_collateral_ligament_injuries",
    cluster: "Sports Medicine",
    subcategory: "Knee Ligaments",
    title: "Posterior Cruciate and Collateral Ligament Injuries",
    definition:
      "Injuries to the PCL, MCL, LCL, and posterolateral corner causing varus, valgus, or posterior instability of the knee.",
    summary:
      "PCL injuries often from dashboard injury. PLC injuries require anatomic reconstruction. Combined ligament injuries have higher stiffness risk.",
    relevance: "ABOS knee dislocations/instability 2% weight within sports.",
    applications: ["PLC reconstruction", "PCL nonoperative vs operative", "Multi-ligament knee protocol"],
    abosSection: "abos_p2_sports_medicine",
    nbkId: "NBK442001",
    nbkSection: "PCL and Collateral",
  },
  {
    shortName: "meniscal_tears_and_management",
    cluster: "Sports Medicine",
    subcategory: "Meniscus",
    title: "Meniscal Tears and Management",
    definition:
      "Tears of the fibrocartilaginous meniscus from acute trauma or degenerative change affecting knee mechanics and pain.",
    summary:
      "Red-white zone vascularity determines healing potential. Repair is preferred in young patients with vertical tears; partial meniscectomy for irreparable patterns.",
    relevance: "Cartilage/meniscus ABOS sports section.",
    applications: ["Repair vs resection", "Meniscal root repair", "Discoid meniscus in peds"],
    abosSection: "abos_p2_sports_medicine",
    highYield: true,
    nbkId: "NBK442001",
    nbkSection: "Meniscal Tears",
  },
  {
    shortName: "shoulder_instability_and_labral_injuries",
    cluster: "Sports Medicine",
    subcategory: "Shoulder Instability",
    title: "Shoulder Instability and Labral Injuries",
    definition:
      "Traumatic or atraumatic glenohumeral subluxation and dislocation with associated labral and capsular pathology.",
    summary:
      "Bankart lesions occur with anterior instability. Hill-Sachs and engaging lesions affect recurrence risk. Latarjet addresses bone loss.",
    relevance: "Core sports shoulder topic overlapping shoulder/elbow subspecialty.",
    applications: ["Instability classification", "Bankart repair", "Bone loss management"],
    abosSection: "abos_p2_sports_medicine",
    highYield: true,
    nbkId: "NBK551582",
    nbkSection: "Shoulder Instability",
  },
  {
    shortName: "rotator_cuff_pathology",
    cluster: "Sports Medicine",
    subcategory: "Rotator Cuff",
    title: "Rotator Cuff Pathology",
    definition:
      "Tendinopathy, partial-thickness, and full-thickness tears of the rotator cuff tendons causing pain and weakness.",
    summary:
      "Subacromial impingement and cuff tears present with night pain and weakness. MRI quantifies tear size and retraction guiding repair versus debridement.",
    relevance: "Heavily tested; MOON cohort informs repair decisions.",
    applications: ["Repair indications", "Massive irreparable cuff options", "Rehabilitation protocols"],
    abosSection: "abos_p2_sports_medicine",
    highYield: true,
    nbkId: "NBK551582",
    nbkSection: "Rotator Cuff",
    extraSources: [pubmed("20413057", "MOON Shoulder Group — rotator cuff outcomes")],
  },
  {
    shortName: "patellofemoral_instability_and_disorders",
    cluster: "Sports Medicine",
    subcategory: "Patellofemoral",
    title: "Patellofemoral Instability and Disorders",
    definition:
      "Lateral patellar dislocation, maltracking, and anterior knee pain from patellofemoral joint dysplasia and soft-tissue imbalance.",
    summary:
      "TT-TG distance and trochlear dysplasia guide instability surgery. MPFL reconstruction restores restraint in recurrent dislocators.",
    relevance: "ABOS extensor mechanism and patellofemoral section.",
    applications: ["MPFL reconstruction", "Trochleoplasty indications", "Patellar maltracking"],
    abosSection: "abos_p2_sports_medicine",
    nbkId: "NBK442001",
    nbkSection: "Patellofemoral",
  },
  {
    shortName: "extensor_mechanism_knee_injuries",
    cluster: "Sports Medicine",
    subcategory: "Extensor Mechanism",
    title: "Extensor Mechanism Knee Injuries",
    definition:
      "Disruption of the quadriceps tendon, patellar tendon, or patella fracture compromising knee extension.",
    summary:
      "Patellar tendon and quadriceps tears require operative repair. Bipartite patella mimics fracture. Stiffness and rerupture are complications.",
    relevance: "ABOS sports knee extensor mechanism 2% weight.",
    applications: ["Acute repair technique", "Patella fracture fixation", "Rehabilitation progression"],
    abosSection: "abos_p2_sports_medicine",
    nbkId: "NBK442001",
    nbkSection: "Extensor Mechanism",
  },
  {
    shortName: "cartilage_injuries_and_restoration",
    cluster: "Sports Medicine",
    subcategory: "Cartilage",
    title: "Cartilage Injuries and Restoration",
    definition:
      "Focal articular cartilage defects and osteochondral injuries managed with marrow stimulation, grafting, or cell-based therapies.",
    summary:
      "Microfracture, OATS, and MACI are options by defect size and location. OCD lesions in adolescents may require drilling or fixation.",
    relevance: "ABOS cartilage/meniscus section.",
    applications: ["Defect size classification", "OCD management", "Return to sport after cartilage procedure"],
    abosSection: "abos_p2_sports_medicine",
    nbkId: "NBK442001",
    nbkSection: "Cartilage Restoration",
  },
  {
    shortName: "sports_medicine_medical_conditions",
    cluster: "Sports Medicine",
    subcategory: "Medical Sports Medicine",
    title: "Sports Medicine Medical Conditions",
    definition:
      "Non-musculoskeletal conditions affecting athletes including concussion, cardiac screening, heat illness, and endocrine disorders.",
    summary:
      "Return-to-play protocols follow concussion guidelines. Female athlete triad and RED-S affect bone health. Sickle cell trait affects exertional collapse.",
    relevance: "ABOS medical aspects of sports medicine 1%.",
    applications: ["Concussion return-to-play", "Preparticipation screening", "Heat stroke management"],
    abosSection: "abos_p2_sports_medical",
    nbkId: "NBK557519",
    nbkSection: "Medical Sports Medicine",
  },

  // ── Shoulder and Elbow (8) ──────────────────────────────────────────
  {
    shortName: "glenohumeral_arthritis_non_arthroplasty",
    cluster: "Shoulder and Elbow",
    subcategory: "Shoulder Arthritis",
    title: "Glenohumeral Arthritis — Non-Arthroplasty Management",
    definition:
      "Degenerative, inflammatory, and post-traumatic glenohumeral arthritis managed conservatively or with joint-preserving surgery.",
    summary:
      "Young patients may undergo arthroscopic debridement or interposition. Cuff tear arthropathy requires reverse total shoulder arthroplasty rather than anatomic replacement.",
    relevance: "Shoulder joint arthritis ABOS section before arthroplasty nodes.",
    applications: ["Conservative management", "Cuff tear arthropathy recognition", "Young patient options"],
    abosSection: "abos_p2_shoulder_elbow",
    nbkId: "NBK551582",
    nbkSection: "Shoulder Arthritis",
  },
  {
    shortName: "primary_shoulder_arthroplasty",
    cluster: "Shoulder and Elbow",
    subcategory: "Shoulder Arthroplasty",
    title: "Primary Shoulder Arthroplasty",
    definition:
      "Anatomic total shoulder, hemiarthroplasty, and reverse total shoulder replacement for end-stage glenohumeral disease.",
    summary:
      "Reverse TSA is indicated for cuff tear arthropathy and complex fractures. Component version and glenosphere position affect stability.",
    relevance: "ABOS primary shoulder arthroplasty 1%.",
    applications: ["Anatomic vs reverse selection", "Glenoid bone loss", "Postoperative instability"],
    abosSection: "abos_p2_shoulder_elbow",
    highYield: true,
    nbkId: "NBK551582",
    nbkSection: "Shoulder Arthroplasty",
  },
  {
    shortName: "revision_shoulder_arthroplasty",
    cluster: "Shoulder and Elbow",
    subcategory: "Shoulder Arthroplasty",
    title: "Revision Shoulder Arthroplasty",
    definition:
      "Reoperation for failed shoulder replacement due to infection, instability, loosening, or component malposition.",
    summary:
      "Instability after anatomic TSA may require conversion to reverse. Periprosthetic infection follows similar principles to hip and knee.",
    relevance: "ABOS revision shoulder arthroplasty section.",
    applications: ["Instability revision", "Glenoid loosening", "Infection workup"],
    abosSection: "abos_p2_shoulder_elbow",
    nbkId: "NBK551582",
    nbkSection: "Revision Shoulder",
  },
  {
    shortName: "shoulder_stiffness_and_capsular_disorders",
    cluster: "Shoulder and Elbow",
    subcategory: "Shoulder Stiffness",
    title: "Shoulder Stiffness and Capsular Disorders",
    definition:
      "Limited glenohumeral motion from adhesive capsulitis, postoperative or post-traumatic stiffness, and calcific tendinopathy.",
    summary:
      "Adhesive capsulitis progresses through freezing and thawing phases. Manipulation under anesthesia and capsular release are options for refractory stiffness.",
    relevance: "ABOS shoulder other conditions section.",
    applications: ["Adhesive capsulitis phases", "MUA indications", "Post-traumatic stiffness"],
    abosSection: "abos_p2_shoulder_elbow",
    nbkId: "NBK551582",
    nbkSection: "Shoulder Stiffness",
  },
  {
    shortName: "elbow_arthritis_and_arthroplasty",
    cluster: "Shoulder and Elbow",
    subcategory: "Elbow Arthritis",
    title: "Elbow Arthritis and Arthroplasty",
    definition:
      "Degenerative and post-traumatic elbow arthritis managed with debridement, interposition, or total elbow arthroplasty.",
    summary:
      "TEA is reserved for low-demand patients with rheumatoid or post-traumatic arthritis. Linked versus unlinked designs differ in stability.",
    relevance: "ABOS elbow joint arthritis section.",
    applications: ["TEA patient selection", "Ulnohumeral arthroplasty", "Post-traumatic contracture release"],
    abosSection: "abos_p2_shoulder_elbow",
    nbkId: "NBK551582",
    nbkSection: "Elbow Arthritis",
  },
  {
    shortName: "elbow_instability_non_acute",
    cluster: "Shoulder and Elbow",
    subcategory: "Elbow Instability",
    title: "Elbow Instability — Chronic and Recurrent",
    definition:
      "Chronic medial collateral ligament insufficiency and posterolateral rotatory instability of the elbow.",
    summary:
      "UCL reconstruction restores valgus stability in throwers. PLRI results from LCL complex disruption; anatomic reconstruction restores rotatory stability.",
    relevance: "Overlaps sports medicine elbow section.",
    applications: ["UCL reconstruction", "PLRI testing", "Throwing athlete return"],
    abosSection: "abos_p2_shoulder_elbow",
    nbkId: "NBK551582",
    nbkSection: "Elbow Instability",
  },
  {
    shortName: "acromioclavicular_and_sternoclavicular_injuries",
    cluster: "Shoulder and Elbow",
    subcategory: "Clavicular Joints",
    title: "Acromioclavicular and Sternoclavicular Injuries",
    definition:
      "Ligamentous injuries and dislocations of the acromioclavicular and sternoclavicular joints from direct trauma.",
    summary:
      "Type III AC injuries are managed operatively versus nonoperatively by activity and preference. Posterior SC dislocation can compress mediastinal structures.",
    relevance: "Distinct from clavicle shaft fractures; ABOS scapula/clavicle section.",
    applications: ["Rockwood AC classification", "SC dislocation urgency", "AC reconstruction techniques"],
    abosSection: "abos_p2_shoulder_elbow",
    nbkId: "NBK551582",
    nbkSection: "AC and SC Joints",
  },
  {
    shortName: "proximal_biceps_and_throwing_shoulder",
    cluster: "Shoulder and Elbow",
    subcategory: "Throwing Athlete",
    title: "Proximal Biceps and Throwing Shoulder",
    definition:
      "Pathology of the long head of biceps and overhead athlete shoulder including internal impingement and GIRD.",
    summary:
      "SLAP tears and biceps tenodesis versus tenotomy are debated in overhead athletes. GIRD and internal impingement contribute to labral pathology.",
    relevance: "ABOS throwing shoulder subsection.",
    applications: ["Biceps tenodesis", "GIRD stretching", "Internal impingement management"],
    abosSection: "abos_p2_shoulder_elbow",
    nbkId: "NBK551582",
    nbkSection: "Throwing Shoulder",
  },

  // ── Hand and Wrist (10) ───────────────────────────────────────────────
  {
    shortName: "distal_radius_fractures",
    cluster: "Hand and Wrist",
    subcategory: "Wrist Fractures",
    title: "Distal Radius Fractures",
    definition:
      "Fractures of the distal radius and ulna from fall on outstretched hand, classified by displacement and articular involvement.",
    summary:
      "AO and Frye classifications guide treatment. ORIF with volar locking plate is common for displaced fractures. Malunion causes DRUJ dysfunction.",
    relevance: "Highest-volume hand/wrist fracture; ABOS wrist fracture 1.5%.",
    applications: ["Volar plate fixation", "DRUJ assessment", "Elderly vs young management"],
    abosSection: "abos_p2_hand_wrist",
    highYield: true,
    nbkId: "NBK551582",
    nbkSection: "Distal Radius",
  },
  {
    shortName: "carpal_fractures_and_instability",
    cluster: "Hand and Wrist",
    subcategory: "Carpal Injuries",
    title: "Carpal Fractures and Instability",
    definition:
      "Scaphoid and other carpal fractures and perilunate injury patterns disrupting carpal alignment.",
    summary:
      "Scaphoid waist fractures risk nonunion and AVN. Perilunate and lunate dislocations require urgent reduction and fixation.",
    relevance: "ABOS carpus fracture section.",
    applications: ["Scaphoid fixation", "Perilunate reduction", "SNAC wrist progression"],
    abosSection: "abos_p2_hand_wrist",
    nbkId: "NBK551582",
    nbkSection: "Carpal Fractures",
  },
  {
    shortName: "wrist_arthritis_and_arthropathy",
    cluster: "Hand and Wrist",
    subcategory: "Wrist Arthritis",
    title: "Wrist Arthritis and Arthropathy",
    definition:
      "Degenerative, post-traumatic, inflammatory, and septic arthritis of the radiocarpal and distal radioulnar joints.",
    summary:
      "SLAC and SNAC wrists progress from scaphoid or ligament pathology. Partial and total wrist arthrodesis or arthroplasty are salvage options.",
    relevance: "ABOS wrist arthritis 1%.",
    applications: ["SLAC/SNAC progression", "Four-corner fusion", "DRUJ management"],
    abosSection: "abos_p2_hand_wrist",
    nbkId: "NBK551582",
    nbkSection: "Wrist Arthritis",
  },
  {
    shortName: "flexor_tendon_injuries_and_repair",
    cluster: "Hand and Wrist",
    subcategory: "Tendon Injuries",
    title: "Flexor Tendon Injuries and Repair",
    definition:
      "Laceration or rupture of flexor digitorum and flexor pollicis longus tendons within the fibro-osseous sheath.",
    summary:
      "Zone II (no man's land) repairs require core and epitendinous sutures. Early protected motion protocols reduce adhesions.",
    relevance: "ABOS hand tendon section.",
    applications: ["Zone classification", "Repair technique", "Rehabilitation protocols"],
    abosSection: "abos_p2_hand_wrist",
    nbkId: "NBK551582",
    nbkSection: "Flexor Tendons",
  },
  {
    shortName: "extensor_tendon_injuries_and_repair",
    cluster: "Hand and Wrist",
    subcategory: "Tendon Injuries",
    title: "Extensor Tendon Injuries and Repair",
    definition:
      "Disruption of extensor tendons over the dorsum of the hand and wrist from laceration or attrition.",
    summary:
      "Extensor zones guide repair approach. Mallet finger may be managed with splinting; sagittal band rupture causes extensor subluxation.",
    relevance: "Complements flexor tendon cluster for hand surgery.",
    applications: ["Extensor zone repair", "Mallet finger management", "Sagittal band reconstruction"],
    abosSection: "abos_p2_hand_wrist",
    nbkId: "NBK551582",
    nbkSection: "Extensor Tendons",
  },
  {
    shortName: "nerve_compression_syndromes_upper_extremity",
    cluster: "Hand and Wrist",
    subcategory: "Nerve Compression",
    title: "Nerve Compression Syndromes of the Upper Extremity",
    definition:
      "Entrapment neuropathies including carpal tunnel, cubital tunnel, and radial tunnel syndromes causing pain and dysfunction.",
    summary:
      "EMG/NCS confirms diagnosis and severity. Carpal tunnel release is most common; cubital tunnel options include in situ release and transposition.",
    relevance: "ABOS wrist and hand nerve section.",
    applications: ["Carpal tunnel release", "Cubital tunnel surgery", "Conservative management"],
    abosSection: "abos_p2_hand_wrist",
    highYield: true,
    nbkId: "NBK551582",
    nbkSection: "Nerve Compression",
  },
  {
    shortName: "hand_fractures_and_dislocations",
    cluster: "Hand and Wrist",
    subcategory: "Hand Fractures",
    title: "Hand Fractures and Dislocations",
    definition:
      "Fractures of metacarpals and phalanges and dislocations of MCP, PIP, and DIP joints including thumb CMC instability.",
    summary:
      "Boxer's fracture of fifth metacarpal neck often managed closed. Bennett and Rolando fractures require thumb CMC stabilization. Gamekeeper's thumb needs UCL repair.",
    relevance: "ABOS hand fracture 1%.",
    applications: ["Metacarpal fixation", "Gamekeeper's thumb", "PIP fracture-dislocations"],
    abosSection: "abos_p2_hand_wrist",
    nbkId: "NBK551582",
    nbkSection: "Hand Fractures",
  },
  {
    shortName: "dupuytren_and_hand_contractures",
    cluster: "Hand and Wrist",
    subcategory: "Hand Contractures",
    title: "Dupuytren Disease and Hand Contractures",
    definition:
      "Fibroproliferative disorder of palmar fascia and other contractures including Volkmann ischemic contracture and intrinsic tightness.",
    summary:
      "Dupuytren cords cause MCP and PIP contracture; collagenase and fasciectomy are treatment options. Volkmann contracture follows compartment syndrome.",
    relevance: "ABOS contracture section.",
    applications: ["Dupuytren staging", "Collagenase vs surgery", "Volkmann prevention"],
    abosSection: "abos_p2_hand_wrist",
    nbkId: "NBK551582",
    nbkSection: "Dupuytren",
  },
  {
    shortName: "wrist_ligament_and_tfcc_injuries",
    cluster: "Hand and Wrist",
    subcategory: "Wrist Ligaments",
    title: "Wrist Ligament and TFCC Injuries",
    definition:
      "Tears of intrinsic wrist ligaments and triangular fibrocartilage complex causing ulnar-sided wrist pain and instability.",
    summary:
      "Scapholunate dissociation leads to DISI deformity. TFCC tears cause DRUJ instability; foveal tears have worse prognosis.",
    relevance: "ABOS TFCC and wrist instability section.",
    applications: ["Scapholunate repair", "TFCC repair vs debridement", "Ulnar shortening"],
    abosSection: "abos_p2_hand_wrist",
    nbkId: "NBK551582",
    nbkSection: "TFCC",
  },
  {
    shortName: "wrist_and_hand_infections",
    cluster: "Hand and Wrist",
    subcategory: "Hand Infections",
    title: "Wrist and Hand Infections",
    definition:
      "Septic arthritis, flexor tenosynovitis, felon, and deep space infections of the hand requiring urgent drainage.",
    summary:
      "Kanavel signs diagnose flexor tenosynovitis. Human bites and IV drug use are high-risk. Emergent irrigation prevents tendon and joint destruction.",
    relevance: "Time-critical hand surgery topic.",
    applications: ["Kanavel criteria", "Irrigation and debridement", "Fight bite management"],
    abosSection: "abos_p2_hand_wrist",
    nbkId: "NBK551582",
    nbkSection: "Hand Infections",
  },

  // ── Foot and Ankle (10) ───────────────────────────────────────────────
  {
    shortName: "ankle_fractures_and_pilon_injuries",
    cluster: "Foot and Ankle",
    subcategory: "Ankle Fractures",
    title: "Ankle Fractures and Pilon Injuries",
    definition:
      "Malleolar ankle fractures and intra-articular distal tibial pilon fractures disrupting the ankle mortise.",
    summary:
      "Anatomic reduction of the mortise and syndesmosis restoration are goals. Pilon fractures often use staged ORIF after soft-tissue recovery.",
    relevance: "ABOS ankle/leg fracture 2%.",
    applications: ["Syndesmosis fixation", "Staged pilon protocol", "Mortise alignment"],
    abosSection: "abos_p2_foot_ankle",
    highYield: true,
    nbkId: "NBK557386",
    nbkSection: "Ankle Fractures",
  },
  {
    shortName: "ankle_sprains_and_chronic_instability",
    cluster: "Foot and Ankle",
    subcategory: "Ankle Instability",
    title: "Ankle Sprains and Chronic Instability",
    definition:
      "Lateral and medial ligament sprains of the ankle and chronic functional or mechanical instability after incomplete healing.",
    summary:
      "ATFL and CFL are commonly injured in inversion. Chronic instability may require Broström repair or ligament reconstruction.",
    relevance: "ABOS ankle sprain section 1%.",
    applications: ["Acute sprain rehabilitation", "Broström repair", "Chronic instability assessment"],
    abosSection: "abos_p2_foot_ankle",
    nbkId: "NBK557386",
    nbkSection: "Ankle Sprains",
  },
  {
    shortName: "achilles_tendon_disorders",
    cluster: "Foot and Ankle",
    subcategory: "Achilles Tendon",
    title: "Achilles Tendon Disorders",
    definition:
      "Achilles tendinopathy and acute or chronic rupture of the Achilles tendon affecting plantarflexion power.",
    summary:
      "Acute rupture managed operatively or nonoperatively by patient factors. Chronic rupture may require tendon transfer or lengthening.",
    relevance: "ABOS tendon/muscle ankle section.",
    applications: ["Rupture management", "Tendinopathy rehabilitation", "Re-rupture prevention"],
    abosSection: "abos_p2_foot_ankle",
    highYield: true,
    nbkId: "NBK557386",
    nbkSection: "Achilles Tendon",
  },
  {
    shortName: "total_ankle_arthroplasty_and_arthrodesis",
    cluster: "Foot and Ankle",
    subcategory: "Ankle Arthritis",
    title: "Total Ankle Arthroplasty and Ankle Arthrodesis",
    definition:
      "Surgical treatment of end-stage ankle arthritis with joint replacement or fusion.",
    summary:
      "TAA preserves motion in appropriate candidates; arthrodesis remains gold standard for deformity and heavy demand. Alignment guides fusion technique.",
    relevance: "ABOS ankle arthritis section.",
    applications: ["TAA vs arthrodesis selection", "Fusion positioning", "Revision options"],
    abosSection: "abos_p2_foot_ankle",
    nbkId: "NBK557386",
    nbkSection: "Ankle Arthritis",
  },
  {
    shortName: "hindfoot_fractures_and_disorders",
    cluster: "Foot and Ankle",
    subcategory: "Hindfoot",
    title: "Hindfoot Fractures and Disorders",
    definition:
      "Calcaneus, talus, and navicular fractures and hindfoot alignment disorders affecting gait.",
    summary:
      "Calcaneus fractures correlate with axial loading and may be intra-articular. Talus fractures risk AVN. Hawkins sign indicates vascularity.",
    relevance: "ABOS hindfoot fracture section.",
    applications: ["Calcaneus ORIF vs ORIF timing", "Talus AVN monitoring", "Subtalar fusion"],
    abosSection: "abos_p2_foot_ankle",
    nbkId: "NBK557386",
    nbkSection: "Hindfoot",
  },
  {
    shortName: "plantar_fasciitis_and_heel_pain",
    cluster: "Foot and Ankle",
    subcategory: "Heel Pain",
    title: "Plantar Fasciitis and Heel Pain",
    definition:
      "Plantar fascial overload causing medial heel pain and related calcaneal stress and bony pathology.",
    summary:
      "First-step pain is characteristic. Conservative care includes stretching, orthotics, and night splints. Calcaneal stress fracture must be excluded.",
    relevance: "Common outpatient foot complaint.",
    applications: ["Conservative protocol", "Steroid injection limits", "Stress fracture differentiation"],
    abosSection: "abos_p2_foot_ankle",
    nbkId: "NBK557386",
    nbkSection: "Heel Pain",
  },
  {
    shortName: "adult_acquired_flatfoot_deformity",
    cluster: "Foot and Ankle",
    subcategory: "Flatfoot",
    title: "Adult Acquired Flatfoot Deformity",
    definition:
      "Progressive loss of medial longitudinal arch from posterior tibial tendon insufficiency and peritalar subluxation.",
    summary:
      "Johnson and Strom stages guide treatment from orthotics to tendon transfer and fusion. Flexible versus rigid deformity affects surgical plan.",
    relevance: "ABOS posterior tibial dysfunction section.",
    applications: ["Stage-based treatment", "FDL transfer", "Triple arthrodesis"],
    abosSection: "abos_p2_foot_ankle",
    nbkId: "NBK557386",
    nbkSection: "Flatfoot",
  },
  {
    shortName: "forefoot_deformities_and_disorders",
    cluster: "Foot and Ankle",
    subcategory: "Forefoot",
    title: "Forefoot Deformities and Disorders",
    definition:
      "Hallux valgus, hallux rigidus, lesser toe deformities, metatarsalgia, and neuroma causing forefoot pain and dysfunction.",
    summary:
      "Hallux valgus angle and IM angle guide bunion surgery. Cheilectomy versus fusion for hallux rigidus depends on arthritis severity.",
    relevance: "ABOS forefoot 1% weight.",
    applications: ["Bunion osteotomy selection", "Hallux rigidus fusion", "Morton neuroma management"],
    abosSection: "abos_p2_foot_ankle",
    nbkId: "NBK557386",
    nbkSection: "Forefoot",
  },
  {
    shortName: "lisfranc_and_midfoot_injuries",
    cluster: "Foot and Ankle",
    subcategory: "Midfoot",
    title: "Lisfranc and Midfoot Injuries",
    definition:
      "Tarsometatarsal joint complex injuries from direct or indirect force causing instability of the midfoot arch.",
    summary:
      "Missed Lisfranc injuries cause chronic pain and collapse. ORIF versus primary fusion depends on instability pattern.",
    relevance: "ABOS midfoot section; sports and trauma crossover.",
    applications: ["Lisfranc classification", "Fixation vs fusion", "Weight-bearing protocol"],
    abosSection: "abos_p2_foot_ankle",
    nbkId: "NBK557386",
    nbkSection: "Lisfranc",
  },
  {
    shortName: "diabetic_foot_and_charcot_arthropathy",
    cluster: "Foot and Ankle",
    subcategory: "Diabetic Foot",
    title: "Diabetic Foot and Charcot Arthropathy",
    definition:
      "Neuropathic foot ulceration, infection, and progressive osseous destruction from Charcot neuroarthropathy in diabetes.",
    summary:
      "Offloading and infection control are priorities. Charcot presents with warm swollen foot; early immobilization prevents rocker-bottom deformity.",
    relevance: "ABOS Charcot and diabetic foot section.",
    applications: ["Ulcer offloading", "Charcot staging", "Reconstructive salvage"],
    abosSection: "abos_p2_foot_ankle",
    nbkId: "NBK557386",
    nbkSection: "Diabetic Foot",
  },

  // ── Paediatric Orthopaedics (12) ──────────────────────────────────────
  {
    shortName: "developmental_dysplasia_of_the_hip",
    cluster: "Paediatric Orthopaedics",
    subcategory: "Hip Development",
    title: "Developmental Dysplasia of the Hip",
    definition:
      "Abnormal development of the hip joint ranging from dysplasia to subluxation and dislocation in infancy.",
    summary:
      "Ortolani and Barlow maneuvers screen neonates. Pavlik harness treats reducible dislocations; open reduction for failed closed treatment.",
    relevance: "Most common paediatric hip topic on ABOS.",
    applications: ["Screening examination", "Pavlik harness", "Open reduction timing"],
    abosSection: "abos_p2_pediatrics",
    highYield: true,
    nbkId: "NBK557519",
    nbkSection: "DDH",
  },
  {
    shortName: "legg_calve_perthes_disease",
    cluster: "Paediatric Orthopaedics",
    subcategory: "Hip Development",
    title: "Legg-Calvé-Perthes Disease",
    definition:
      "Idiopathic avascular necrosis of the femoral head in children causing hip pain and potential femoral head deformity.",
    summary:
      "Age at onset and Herring lateral pillar classification guide containment treatment. Goal is spherical femoral head at skeletal maturity.",
    relevance: "ABOS hip developmental section.",
    applications: ["Containment surgery", "Prognostic factors", "Activity modification"],
    abosSection: "abos_p2_pediatrics",
    nbkId: "NBK557519",
    nbkSection: "Perthes",
  },
  {
    shortName: "slipped_capital_femoral_epiphysis",
    cluster: "Paediatric Orthopaedics",
    subcategory: "Hip Adolescent",
    title: "Slipped Capital Femoral Epiphysis",
    definition:
      "Slippage of the femoral epiphysis relative to the metaphysis through the physis in overweight adolescents.",
    summary:
      "Stable versus unstable slips differ in AVN risk. In situ pinning is standard; urgent treatment of unstable slips.",
    relevance: "High-yield paediatric hip emergency.",
    applications: ["Stable vs unstable slip", "In situ pinning", "Prophylactic contralateral pinning"],
    abosSection: "abos_p2_pediatrics",
    highYield: true,
    nbkId: "NBK557519",
    nbkSection: "SCFE",
  },
  {
    shortName: "clubfoot_and_congenital_foot_deformities",
    cluster: "Paediatric Orthopaedics",
    subcategory: "Congenital Foot",
    title: "Clubfoot and Congenital Foot Deformities",
    definition:
      "Congenital talipes equinovarus and other congenital foot anomalies including vertical talus and tarsal coalition.",
    summary:
      "Ponseti serial casting and tenotomy correct most clubfeet. Vertical talus requires early reduction. Coalitions present with adolescent flatfoot pain.",
    relevance: "ABOS paediatric foot section.",
    applications: ["Ponseti method", "Vertical talus management", "Coalition resection"],
    abosSection: "abos_p2_pediatrics",
    nbkId: "NBK557519",
    nbkSection: "Clubfoot",
  },
  {
    shortName: "paediatric_fractures_physeal_injuries",
    cluster: "Paediatric Orthopaedics",
    subcategory: "Paediatric Trauma",
    title: "Paediatric Fractures and Physeal Injuries",
    definition:
      "Fractures in growing bone classified by Salter-Harris involving the physis with unique remodeling and growth disturbance risk.",
    summary:
      "Salter-Harris I-II often managed closed; III-IV require anatomic reduction. Physeal bar resection may prevent angular deformity.",
    relevance: "Foundation for all paediatric trauma.",
    applications: ["Salter-Harris classification", "Growth arrest recognition", "Remodeling potential"],
    abosSection: "abos_p2_pediatrics",
    highYield: true,
    nbkId: "NBK557519",
    nbkSection: "Physeal Injuries",
  },
  {
    shortName: "supracondylar_and_elbow_fractures_pediatric",
    cluster: "Paediatric Orthopaedics",
    subcategory: "Paediatric Trauma",
    title: "Supracondylar and Elbow Fractures — Paediatric",
    definition:
      "Supracondylar humerus, lateral condyle, medial epicondyle, and radial neck fractures in children with vascular and nerve risk.",
    summary:
      "Gartland classification guides supracondylar management. Brachial artery and AIN injury require monitoring. CRPP is common for displaced fractures.",
    relevance: "Most common paediatric fracture around elbow.",
    applications: ["Gartland types", "Vascular monitoring", "CRPP technique"],
    abosSection: "abos_p2_pediatrics",
    nbkId: "NBK557519",
    nbkSection: "Paediatric Elbow",
  },
  {
    shortName: "paediatric_spine_deformity_scoliosis",
    cluster: "Paediatric Orthopaedics",
    subcategory: "Paediatric Spine",
    title: "Paediatric Spine Deformity — Scoliosis",
    definition:
      "Idiopathic and congenital spinal curvature in children and adolescents requiring bracing or surgical correction.",
    summary:
      "Lenke classification guides adolescent idiopathic scoliosis surgery. Early-onset scoliosis may use growing rods. Congenital scoliosis from vertebral anomalies.",
    relevance: "ABOS paediatric spine 1.5%.",
    applications: ["Bracing indications", "Fusion levels selection", "Growing rod techniques"],
    abosSection: "abos_p2_pediatrics",
    nbkId: "NBK557519",
    nbkSection: "Paediatric Scoliosis",
  },
  {
    shortName: "paediatric_spine_spondylolysis_listhesis",
    cluster: "Paediatric Orthopaedics",
    subcategory: "Paediatric Spine",
    title: "Paediatric Spondylolysis and Spondylolisthesis",
    definition:
      "Pars interarticularis defects and vertebral slippage in children and adolescents, often in athletic populations.",
    summary:
      "Activity modification and bracing treat low-grade isthmic slips in adolescents. High-grade slips may require fusion in situ or reduction.",
    relevance: "Sports and paediatric spine crossover.",
    applications: ["Pars defect imaging", "Slip grading", "Fusion indications in adolescents"],
    abosSection: "abos_p2_pediatrics",
    nbkId: "NBK557519",
    nbkSection: "Paediatric Spondylolisthesis",
  },
  {
    shortName: "spina_bifida_and_myelomeningocele_orthopaedics",
    cluster: "Paediatric Orthopaedics",
    subcategory: "Neuromuscular Paeds",
    title: "Spina Bifida and Myelomeningocele — Orthopaedic Management",
    definition:
      "Congenital neural tube defects causing paralytic deformities of the lower extremities requiring bracing and corrective surgery.",
    summary:
      "Hip dislocation and equinovarus foot are common. Ambulatory potential depends on neurologic level. Late spinal deformity requires fusion.",
    relevance: "ABOS paediatric neuromuscular section.",
    applications: ["Ambulation prognosis", "Foot deformity correction", "Spinal deformity fusion"],
    abosSection: "abos_p2_pediatrics",
    nbkId: "NBK557519",
    nbkSection: "Spina Bifida",
  },
  {
    shortName: "limb_length_discrepancy_and_angular_deformity",
    cluster: "Paediatric Orthopaedics",
    subcategory: "Limb Deformity",
    title: "Limb Length Discrepancy and Angular Deformity",
    definition:
      "Leg length inequality and coronal or sagittal angular deformities from congenital, developmental, or post-traumatic causes.",
    summary:
      "Moseley charting predicts growth remaining. Guided growth for angular correction; epiphysiodesis or lengthening for LLD.",
    relevance: "ABOS torsional and angular deformity section.",
    applications: ["Growth remaining calculation", "Guided growth plates", "Lengthening principles"],
    abosSection: "abos_p2_pediatrics",
    nbkId: "NBK557519",
    nbkSection: "Limb Deformity",
  },
  {
    shortName: "paediatric_sports_and_overuse_injuries",
    cluster: "Paediatric Orthopaedics",
    subcategory: "Paediatric Sports",
    title: "Paediatric Sports and Overuse Injuries",
    definition:
      "Apophysitis, stress fractures, and osteochondritis dissecans in skeletally immature athletes including Little Leaguer elbow.",
    summary:
      "Osgood-Schlatter and Sever disease are traction apophysitis. Little Leaguer elbow involves medial epicondyle apophysitis. OCD may need drilling or fixation.",
    relevance: "ABOS paediatric sports 1.5%.",
    applications: ["Apophysitis management", "OCD in immature skeleton", "Pitch count guidelines"],
    abosSection: "abos_p2_pediatrics",
    nbkId: "NBK557519",
    nbkSection: "Paediatric Sports",
  },
  {
    shortName: "osteogenesis_imperfecta_and_skeletal_dysplasias",
    cluster: "Paediatric Orthopaedics",
    subcategory: "Skeletal Dysplasias",
    title: "Osteogenesis Imperfecta and Skeletal Dysplasias",
    definition:
      "Genetic disorders of connective tissue and bone matrix causing fragility, deformity, and short stature.",
    summary:
      "OI types differ in severity and hearing loss risk. Intramedullary rodding prevents fracture cycles. Bisphosphonates reduce fracture rate in OI.",
    relevance: "ABOS paediatric general syndromes section.",
    applications: ["OI classification", "Rodding surgery", "Multidisciplinary care"],
    abosSection: "abos_p2_pediatrics",
    nbkId: "NBK557519",
    nbkSection: "Skeletal Dysplasias",
  },

  // ── Orthopaedic Oncology (8) ──────────────────────────────────────────
  {
    shortName: "bone_tumor_evaluation_and_biopsy",
    cluster: "Orthopaedic Oncology",
    subcategory: "Tumor Principles",
    title: "Bone Tumor Evaluation and Biopsy",
    definition:
      "Systematic radiographic and histologic evaluation of bone lesions including biopsy planning to avoid contamination.",
    summary:
      "Age and location narrow differential. Biopsy tract must be excisable. Enneking staging applies to musculoskeletal tumors.",
    relevance: "Foundation for all oncology nodes; ABOS imaging/biopsy sections.",
    applications: ["Radiographic differential", "Biopsy technique", "Staging workup"],
    abosSection: "abos_p2_oncology",
    highYield: true,
    nbkId: "NBK557519",
    nbkSection: "Tumor Evaluation",
  },
  {
    shortName: "benign_bone_tumors",
    cluster: "Orthopaedic Oncology",
    subcategory: "Benign Bone Tumors",
    title: "Benign Bone Tumors",
    definition:
      "Non-malignant bone lesions including osteochondroma, enchondroma, bone cysts, and giant cell tumor of bone.",
    summary:
      "Osteochondroma is most common benign tumor. GCT is locally aggressive and may require curettage with adjuvants. Simple bone cysts occur in pediatric long bones.",
    relevance: "ABOS benign bone 2%.",
    applications: ["Lesion recognition on imaging", "GCT management", "Osteoid osteoma ablation"],
    abosSection: "abos_p2_oncology",
    nbkId: "NBK557519",
    nbkSection: "Benign Bone Tumors",
  },
  {
    shortName: "primary_malignant_bone_tumors",
    cluster: "Orthopaedic Oncology",
    subcategory: "Malignant Bone Tumors",
    title: "Primary Malignant Bone Tumors",
    definition:
      "Osteosarcoma, Ewing sarcoma, chondrosarcoma, and chordoma requiring multimodal therapy and limb salvage when possible.",
    summary:
      "Osteosarcoma occurs in metaphysis of long bones in adolescents. Neoadjuvant chemotherapy and wide resection are standard. Ewing is radiosensitive.",
    relevance: "ABOS malignant bone 1%; high yield per topic.",
    applications: ["Chemotherapy protocols", "Limb salvage vs amputation", "Pathologic fracture management"],
    abosSection: "abos_p2_oncology",
    highYield: true,
    nbkId: "NBK557519",
    nbkSection: "Malignant Bone Tumors",
  },
  {
    shortName: "soft_tissue_sarcoma",
    cluster: "Orthopaedic Oncology",
    subcategory: "Soft Tissue Malignancy",
    title: "Soft Tissue Sarcoma",
    definition:
      "Malignant mesenchymal tumors of soft tissues requiring wide excision often combined with radiation.",
    summary:
      "MRI defines compartment and neurovascular involvement. Margin status drives local recurrence. STS subtypes include liposarcoma and synovial sarcoma.",
    relevance: "ABOS malignant soft tissue 1%.",
    applications: ["MRI staging", "Radiation timing", "Margin principles"],
    abosSection: "abos_p2_oncology",
    nbkId: "NBK557519",
    nbkSection: "Soft Tissue Sarcoma",
  },
  {
    shortName: "benign_soft_tissue_tumors",
    cluster: "Orthopaedic Oncology",
    subcategory: "Benign Soft Tissue",
    title: "Benign Soft Tissue Tumors",
    definition:
      "Lipoma, pigmented villonodular synovitis, nerve sheath tumors, and other benign soft-tissue masses.",
    summary:
      "PVNS may be diffuse or localized; synovectomy is treatment. Lipomas are common; atypical features warrant MRI. Schwannomas arise from nerve sheath.",
    relevance: "ABOS benign soft tissue 0.5%.",
    applications: ["PVNS management", "Lipoma vs liposarcoma features", "Nerve sheath tumor surgery"],
    abosSection: "abos_p2_oncology",
    nbkId: "NBK557519",
    nbkSection: "Benign Soft Tissue",
  },
  {
    shortName: "metastatic_bone_disease",
    cluster: "Orthopaedic Oncology",
    subcategory: "Metastatic Disease",
    title: "Metastatic Bone Disease",
    definition:
      "Secondary malignant involvement of bone from carcinoma, myeloma, or lymphoma causing pain, fracture, and hypercalcemia.",
    summary:
      "Mirels score guides prophylactic fixation. Radiation and bisphosphonates/denosumab reduce skeletal events. Pathologic fracture through tumor needs stabilization.",
    relevance: "ABOS metastatic disease 2%.",
    applications: ["Prophylactic fixation", "Radiation oncology coordination", "Hypercalcemia management"],
    abosSection: "abos_p2_oncology",
    highYield: true,
    nbkId: "NBK557519",
    nbkSection: "Metastatic Bone Disease",
  },
  {
    shortName: "limb_salvage_and_reconstruction_oncology",
    cluster: "Orthopaedic Oncology",
    subcategory: "Limb Salvage",
    title: "Limb Salvage and Reconstruction in Oncology",
    definition:
      "Techniques preserving limb function after tumor resection including endoprosthesis, allograft, and rotationplasty.",
    summary:
      "Wide margin is oncologic priority. Endoprosthesis with expandable options used in skeletally immature patients. Allograft-prosthetic composite for segmental defects.",
    relevance: "Integrates trauma, reconstruction, and oncology principles.",
    applications: ["Endoprosthesis selection", "Allograft reconstruction", "Rotationplasty indications"],
    abosSection: "abos_p2_oncology",
    nbkId: "NBK557519",
    nbkSection: "Limb Salvage",
  },
  {
    shortName: "oncologic_syndromes_and_staging",
    cluster: "Orthopaedic Oncology",
    subcategory: "Tumor Syndromes",
    title: "Oncologic Syndromes and Staging",
    definition:
      "Hereditary and syndromic associations with musculoskeletal tumors including MHE, Ollier disease, and Li-Fraumeni syndrome.",
    summary:
      "Multiple hereditary exostoses carry chondrosarcoma risk. Maffucci syndrome links enchondromas with hemangiomas. Recognition guides surveillance.",
    relevance: "ABOS syndromes 0.5%.",
    applications: ["Syndrome recognition", "Surveillance protocols", "Genetic counseling referral"],
    abosSection: "abos_p2_oncology",
    nbkId: "NBK557519",
    nbkSection: "Oncologic Syndromes",
  },

  // ── Neuromuscular and Rehabilitation (6) ────────────────────────────────
  {
    shortName: "cerebral_palsy_orthopaedic_management",
    cluster: "Neuromuscular and Rehabilitation",
    subcategory: "Cerebral Palsy",
    title: "Cerebral Palsy — Orthopaedic Management",
    definition:
      "Musculoskeletal manifestations of cerebral palsy including spasticity, contractures, and gait abnormalities requiring multidisciplinary care.",
    summary:
      "GMFCS level predicts ambulation. SEMLS and single-event multilevel surgery address gait deviations. Hip surveillance prevents dislocation.",
    relevance: "ABOS paediatric and neuromuscular sections.",
    applications: ["GMFCS classification", "Hip surveillance", "Multilevel surgery planning"],
    abosSection: "abos_p2_neuromuscular",
    nbkId: "NBK557519",
    nbkSection: "Cerebral Palsy",
    sharedNote: "Related to paediatric neuromuscular content — adult CP transition may warrant L4 detail.",
  },
  {
    shortName: "peripheral_nerve_injury_brachial_plexus",
    cluster: "Neuromuscular and Rehabilitation",
    subcategory: "Peripheral Nerve",
    title: "Peripheral Nerve Injury — Brachial Plexus and Upper Extremity",
    definition:
      "Traumatic and iatrogenic nerve injuries requiring electrodiagnostic evaluation and surgical reconstruction including nerve graft and transfer.",
    summary:
      "Sunderland classification describes injury severity. Nerve repair, grafting, and tendon transfer restore function when reinnervation is limited.",
    relevance: "Links trauma brachial plexus to reconstructive nerve surgery.",
    applications: ["Nerve repair timing", "Tendon transfer principles", "EMG interpretation"],
    abosSection: "abos_p2_neuromuscular",
    nbkId: "NBK551582",
    nbkSection: "Peripheral Nerve Injury",
  },
  {
    shortName: "peripheral_neuropathy_and_nerve_entrapment_lower_extremity",
    cluster: "Neuromuscular and Rehabilitation",
    subcategory: "Peripheral Nerve",
    title: "Peripheral Neuropathy and Lower Extremity Nerve Entrapment",
    definition:
      "Common peroneal, tarsal tunnel, and other lower extremity entrapment neuropathies and systemic neuropathy affecting gait.",
    summary:
      "Foot drop from peroneal nerve palsy affects swing phase clearance. Tarsal tunnel syndrome causes medial ankle and plantar symptoms.",
    relevance: "ABOS foot and ankle nerve injury section.",
    applications: ["Foot drop workup", "Tarsal tunnel release", "Neuropathic ulcer prevention"],
    abosSection: "abos_p2_neuromuscular",
    nbkId: "NBK557386",
    nbkSection: "Lower Extremity Nerve",
  },
  {
    shortName: "muscular_dystrophy_and_neuropathy_orthopaedic",
    cluster: "Neuromuscular and Rehabilitation",
    subcategory: "Neuromuscular Disease",
    title: "Muscular Dystrophy and Neuropathy — Orthopaedic Management",
    definition:
      "Progressive neuromuscular disorders including Duchenne muscular dystrophy and Charcot-Marie-Tooth disease with orthopaedic deformities.",
    summary:
      "DMD patients develop contractures and scoliosis; steroid therapy slows decline. CMT causes cavovarus foot requiring bracing or osteotomy.",
    relevance: "ABOS paediatric neuromuscular 1%.",
    applications: ["DMD contracture management", "Scoliosis fusion in DMD", "CMT foot reconstruction"],
    abosSection: "abos_p2_neuromuscular",
    nbkId: "NBK557519",
    nbkSection: "Muscular Dystrophy",
  },
  {
    shortName: "orthopaedic_rehabilitation_principles",
    cluster: "Neuromuscular and Rehabilitation",
    subcategory: "Rehabilitation",
    title: "Orthopaedic Rehabilitation Principles",
    definition:
      "Structured recovery protocols after musculoskeletal injury and surgery emphasizing range of motion, strengthening, and functional progression.",
    summary:
      "Phased rehabilitation protects healing tissue while preventing stiffness. Weight-bearing protocols differ by fixation stability and procedure type.",
    relevance: "Cross-cutting ABOS perioperative and subspecialty topic.",
    applications: ["Post-fracture protocols", "Post-arthroplasty precautions", "Return-to-activity criteria"],
    abosSection: "abos_p2_neuromuscular",
    nbkId: "NBK557519",
    nbkSection: "Rehabilitation",
  },
  {
    shortName: "patient_reported_outcomes_orthopaedic",
    cluster: "Neuromuscular and Rehabilitation",
    subcategory: "Outcomes Measurement",
    title: "Patient-Reported Outcomes in Orthopaedics",
    definition:
      "Validated instruments measuring function and quality of life after musculoskeletal treatment including WOMAC, HOOS, and KOOS.",
    summary:
      "PROMs standardize outcome assessment in research and registries. MCID defines clinically meaningful change. Registry data inform implant performance.",
    relevance: "Links to biostatistics; ABOS outcomes research context.",
    applications: ["WOMAC/KOOS interpretation", "Registry participation", "MCID application"],
    abosSection: "abos_p1_biostatistics",
    nbkId: "NBK557519",
    nbkSection: "Patient-Reported Outcomes",
  },
];

/** Topic L3 nodes after resident review pass (hubs added separately in build). */
export const ORTHOPAEDIC_L3_SPECS = applyReviewDecisions(ORTHOPAEDIC_L3_RAW_SPECS);
