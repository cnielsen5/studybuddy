/**
 * OrthoBullets-native L3 sections for the orthopaedic spine subtree.
 *
 * These 11 sections mirror the OrthoBullets top-level "Topics" navigation
 * (see product screenshots): they become the L3 nodes under the
 * `Orthopaedic Surgery` L2 root. Below each section the new scheme is:
 *
 *   L3 = Section (this file)
 *   L4 = Chapter  (OrthoBullets "Chapters")
 *   L5 = Topic    (OrthoBullets "Topics" leaf pages)
 *
 * OrthoBullets' intermediate "Fields" level (e.g. "General Trauma",
 * "Upper Extremity") is intentionally collapsed into the section — chapters
 * are attached directly to the section, with the originating field preserved
 * as metadata on each chapter for traceability.
 */

export type ObSectionSlug =
  | "trauma"
  | "spine"
  | "shoulder_elbow"
  | "knee_sports"
  | "pediatrics"
  | "recon"
  | "hand"
  | "foot_ankle"
  | "pathology"
  | "basic_science"
  | "anatomy";

export interface ObSection {
  slug: ObSectionSlug;
  /** L3 spine id short name → spine_medicine_clinical_l3_<shortName> */
  shortName: string;
  /** Display title shown in the OrthoBullets lens / review UI. */
  title: string;
  /** Lens section id. */
  lensSectionId: string;
  order: number;
  definition: string;
  summary: string;
  relevance: string;
  applications: string[];
}

const sec = (
  slug: ObSectionSlug,
  shortName: string,
  title: string,
  order: number,
  definition: string,
  summary: string,
  relevance: string,
  applications: string[]
): ObSection => ({
  slug,
  shortName,
  title,
  lensSectionId: `lens_section_ob_${slug}`,
  order,
  definition,
  summary,
  relevance,
  applications,
});

/** The 11 OrthoBullets sections, in OrthoBullets nav order. */
export const OB_SECTIONS: ObSection[] = [
  sec(
    "trauma",
    "orthopaedic_trauma",
    "Trauma",
    0,
    "Acute musculoskeletal injuries including fractures, dislocations, polytrauma, and complications of traumatic injury.",
    "Fracture principles, regional trauma by extremity, pelvis and acetabulum, and damage-control orthopaedics.",
    "OrthoBullets Trauma section; ABOS Adult Trauma.",
    ["Fracture management", "Polytrauma staging", "Open fracture care"]
  ),
  sec(
    "spine",
    "orthopaedic_spine",
    "Spine",
    1,
    "Degenerative, deformity, infectious, neoplastic, and traumatic disorders of the vertebral column and spinal cord.",
    "Cervical, thoracic, and lumbar pathology, spinal deformity, trauma, tumors, and fusion principles.",
    "OrthoBullets Spine section; ABOS Adult Spine.",
    ["Radiculopathy and myelopathy", "Spinal deformity", "Spine trauma"]
  ),
  sec(
    "shoulder_elbow",
    "orthopaedic_shoulder_and_elbow",
    "Shoulder & Elbow",
    2,
    "Non-traumatic and post-traumatic disorders of the shoulder and elbow including instability, cuff pathology, arthritis, and arthroplasty.",
    "Shoulder instability, rotator cuff, arthroplasty, elbow arthritis, and throwing-athlete pathology.",
    "OrthoBullets Shoulder & Elbow section; ABOS Shoulder and Elbow.",
    ["Shoulder arthroplasty", "Instability surgery", "Elbow reconstruction"]
  ),
  sec(
    "knee_sports",
    "orthopaedic_knee_and_sports",
    "Knee & Sports",
    3,
    "Athletic and degenerative knee injuries and broader sports medicine including ligament, meniscal, cartilage, and patellofemoral disorders.",
    "Knee ligament and meniscal injury, patellofemoral disorders, cartilage restoration, and medical sports medicine.",
    "OrthoBullets Knee & Sports section; ABOS Sports Medicine.",
    ["Return to play", "Knee ligament reconstruction", "Cartilage restoration"]
  ),
  sec(
    "pediatrics",
    "orthopaedic_pediatrics",
    "Pediatrics",
    4,
    "Musculoskeletal disorders in children including developmental hip conditions, physeal trauma, spine deformity, and neuromuscular disease.",
    "DDH, SCFE, Perthes, clubfoot, physeal fractures, paediatric spine, CP, and skeletal dysplasias.",
    "OrthoBullets Pediatrics section; ABOS Pediatrics.",
    ["Growth-aware treatment", "Pavlik harness", "Guided growth"]
  ),
  sec(
    "recon",
    "orthopaedic_recon",
    "Recon",
    5,
    "Elective joint replacement and revision surgery for end-stage arthropathy of the hip and knee, plus reconstruction basic science.",
    "Hip and knee arthropathy, arthroplasty, bearing surfaces, wear and osteolysis, PJI, and periprosthetic fracture.",
    "OrthoBullets Recon section; ABOS Adult Reconstruction.",
    ["Arthroplasty", "Revision surgery", "Joint preservation decisions"]
  ),
  sec(
    "hand",
    "orthopaedic_hand",
    "Hand",
    6,
    "Disorders of the hand and wrist including fracture, arthritis, tendon, nerve compression, and infection.",
    "Distal radius and carpal injuries, tendon repairs, nerve compression, Dupuytren, and hand infections.",
    "OrthoBullets Hand section; ABOS Hand.",
    ["Microsurgical repair", "Carpal instability", "Hand trauma"]
  ),
  sec(
    "foot_ankle",
    "orthopaedic_foot_and_ankle",
    "Foot & Ankle",
    7,
    "Disorders of the foot and ankle including fracture, instability, deformity, arthritis, and diabetic foot disease.",
    "Ankle fracture, Achilles pathology, hindfoot and forefoot deformity, and Charcot arthropathy.",
    "OrthoBullets Foot & Ankle section; ABOS Foot and Ankle.",
    ["Ankle arthroplasty", "Flatfoot reconstruction", "Diabetic limb salvage"]
  ),
  sec(
    "pathology",
    "orthopaedic_pathology",
    "Pathology",
    8,
    "Benign and malignant tumors of bone and soft tissue plus metabolic and infectious musculoskeletal pathology, including staging, biopsy, and limb salvage.",
    "Tumor evaluation, primary bone malignancy, soft-tissue sarcoma, metastatic disease, metabolic bone disease, and musculoskeletal infection.",
    "OrthoBullets Pathology section; ABOS Oncology and pathology.",
    ["Biopsy principles", "Limb salvage", "Pathologic fracture"]
  ),
  sec(
    "basic_science",
    "orthopaedic_basic_science",
    "Basic Science",
    9,
    "Applied basic sciences supporting musculoskeletal diagnosis and treatment including biomechanics, imaging, implant science, and perioperative principles.",
    "Biomechanics, gait, musculoskeletal imaging, implant tribology, soft-tissue biology, fracture healing, and perioperative principles.",
    "OrthoBullets Basic Science section; ABOS General Principles.",
    ["Board examination foundation", "Cross-subspecialty principles"]
  ),
  sec(
    "anatomy",
    "orthopaedic_anatomy",
    "Anatomy",
    10,
    "Regional musculoskeletal anatomy and surgical approaches relevant to orthopaedic diagnosis and operative exposure.",
    "Bony, ligamentous, neurovascular, and muscular anatomy by region, plus standard surgical approaches.",
    "OrthoBullets Anatomy section; ABOS anatomy and approaches.",
    ["Surgical exposure planning", "Neurovascular safe zones", "Regional anatomy review"]
  ),
];

export const OB_SECTION_BY_SLUG: Record<ObSectionSlug, ObSection> = Object.fromEntries(
  OB_SECTIONS.map((s) => [s.slug, s])
) as Record<ObSectionSlug, ObSection>;

/**
 * Maps the legacy subspecialty hub shortNames (orthopaedicHubs.ts) onto the new
 * OrthoBullets sections, so existing spine content can be re-bucketed without
 * fabrication. Where the legacy hub has no clean OrthoBullets home this is
 * flagged in `LEGACY_HUB_REMAP_NOTES`.
 */
export const LEGACY_HUB_TO_SECTION: Record<string, ObSectionSlug> = {
  orthopaedic_basic_science: "basic_science",
  orthopaedic_trauma: "trauma",
  orthopaedic_adult_reconstruction: "recon",
  orthopaedic_spine: "spine",
  orthopaedic_sports_medicine: "knee_sports",
  orthopaedic_shoulder_and_elbow: "shoulder_elbow",
  orthopaedic_hand_and_wrist: "hand",
  orthopaedic_foot_and_ankle: "foot_ankle",
  orthopaedic_pediatrics: "pediatrics",
  orthopaedic_oncology: "pathology",
  // OrthoBullets has no standalone Neuromuscular/Rehabilitation section.
  // Cross-cutting nerve + rehab principles map to Basic Science pending review.
  orthopaedic_neuromuscular_rehabilitation: "basic_science",
};

export const LEGACY_HUB_REMAP_NOTES: Record<string, string> = {
  orthopaedic_sports_medicine:
    "Merged into 'Knee & Sports' to match OrthoBullets; non-knee sports topics retained here.",
  orthopaedic_oncology:
    "Renamed to 'Pathology' to match OrthoBullets (tumors + metabolic/infectious MSK pathology).",
  orthopaedic_neuromuscular_rehabilitation:
    "No OrthoBullets equivalent section; provisionally placed under Basic Science. Review per-topic placement.",
};
