/**
 * Builds the OrthoBullets curriculum lens directly from the OrthoBullets-native
 * taxonomy so the lens navigation mirrors the spine structure exactly:
 *   section → chapter (L4) → topic (L5).
 */
import type { CurriculumLens } from "../../../types/curriculumLens.js";
import { OB_SECTIONS } from "./sections.js";
import type { ObSectionTaxonomy } from "./taxonomyTypes.js";

const l4Id = (shortName: string) => `spine_medicine_clinical_l4_${shortName}`;
const l5Id = (shortName: string) => `spine_medicine_clinical_l5_${shortName}`;

export function buildOrthobulletsLensFromTaxonomy(
  taxonomies: ObSectionTaxonomy[]
): CurriculumLens {
  const bySection = new Map(taxonomies.map((t) => [t.section, t]));

  const sections: CurriculumLens["sections"] = OB_SECTIONS.map((s) => ({
    id: s.lensSectionId,
    title: s.title,
    parent_section_id: null,
    order: s.order,
  }));

  const concept_mappings: CurriculumLens["concept_mappings"] = [];

  for (const section of OB_SECTIONS) {
    const taxonomy = bySection.get(section.slug);
    if (!taxonomy) continue;
    let order = 0;
    for (const chapter of taxonomy.chapters) {
      concept_mappings.push({
        spine_concept_id: l4Id(chapter.shortName),
        section_id: section.lensSectionId,
        lens_specific: {
          title_in_lens: chapter.title,
          order_in_section: order++,
          high_yield_in_lens: false,
          depth_in_lens: 4,
          notes: `orthobullets_chapter; provenance=${taxonomy.provenance}${
            chapter.field ? `; field=${chapter.field}` : ""
          }`,
        },
      });
      for (const topic of chapter.topics) {
        concept_mappings.push({
          spine_concept_id: l5Id(topic.shortName),
          section_id: section.lensSectionId,
          lens_specific: {
            title_in_lens: topic.title,
            order_in_section: order++,
            high_yield_in_lens: false,
            depth_in_lens: 5,
            notes: `orthobullets_topic; chapter=${chapter.title}`,
          },
        });
      }
    }
  }

  return {
    id: "lens_orthobullets_orthopaedic_2026",
    name: "Orthobullets Orthopaedic Topic Taxonomy",
    source: "Orthobullets",
    domain_id: "medicine_clinical",
    version: "2026-orthobullets",
    description:
      "OrthoBullets-native navigation: eleven sections (L3) → chapters (L4) → topics (L5), mirroring the OrthoBullets topic taxonomy.",
    intended_audience: "Orthopaedic surgery residents using topic-based study workflows",
    sections,
    concept_mappings,
    metadata: {
      created_at: "2026-06-27T00:00:00Z",
      status: "active",
    },
  };
}
