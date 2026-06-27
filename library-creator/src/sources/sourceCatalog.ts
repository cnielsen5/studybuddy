import type { CuratedSource } from "../types/sourceConfig.js";

/** Maintained open-source reference catalog for Stage 2. */
export const CURATED_SOURCE_CATALOG: CuratedSource[] = [
  {
    id: "openstax_anatomy_physiology_2e",
    title: "OpenStax Anatomy & Physiology 2e",
    publisher: "OpenStax",
    url: "https://openstax.org/details/books/anatomy-and-physiology-2e",
    domainIds: ["medicine_preclinical"],
    tags: ["anatomy", "physiology", "undergrad"],
    recommended: true,
  },
  {
    id: "statpearls_msk",
    title: "StatPearls — Musculoskeletal",
    publisher: "StatPearls",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK448124/",
    domainIds: ["medicine_clinical"],
    tags: ["orthopaedic", "msk", "clinical"],
    recommended: true,
  },
  {
    id: "libretexts_biomechanics",
    title: "LibreTexts Biomechanics",
    publisher: "LibreTexts",
    domainIds: ["medicine_clinical", "physics"],
    tags: ["biomechanics", "engineering"],
    recommended: false,
  },
  {
    id: "ncbi_orthopaedic_topics",
    title: "NCBI Bookshelf — Orthopaedic topics",
    publisher: "NCBI",
    domainIds: ["medicine_clinical"],
    tags: ["orthopaedic", "clinical reference"],
    recommended: false,
  },
  {
    id: "openstax_chemistry_2e",
    title: "OpenStax Chemistry 2e",
    publisher: "OpenStax",
    url: "https://openstax.org/details/books/chemistry-2e",
    domainIds: ["chemistry"],
    tags: ["chemistry", "undergrad"],
    recommended: true,
  },
  {
    id: "openstax_calculus_vol1",
    title: "OpenStax Calculus Volume 1",
    publisher: "OpenStax",
    url: "https://openstax.org/details/books/calculus-volume-1",
    domainIds: ["mathematics"],
    tags: ["calculus", "math"],
    recommended: true,
  },
];

export function filterCatalogForDomain(
  spineDomainId: string | undefined
): CuratedSource[] {
  if (!spineDomainId || spineDomainId === "mixed") {
    return CURATED_SOURCE_CATALOG;
  }
  return CURATED_SOURCE_CATALOG.filter(
    (s) => s.domainIds.length === 0 || s.domainIds.includes(spineDomainId)
  );
}

export function getCuratedSource(id: string): CuratedSource | undefined {
  return CURATED_SOURCE_CATALOG.find((s) => s.id === id);
}
