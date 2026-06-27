export interface LensCatalogEntry {
  id: string;
  name: string;
  domainId: string;
  searchTerms: string[];
  description: string;
}

/** Curated lenses surfaced in Stage 1 autocomplete. */
export const LENS_CATALOG: LensCatalogEntry[] = [
  {
    id: "lens_abos_orthopaedic_2025",
    name: "ABOS Orthopaedic Surgery Board Certification 2025",
    domainId: "medicine_clinical",
    searchTerms: [
      "abos",
      "orthopaedic",
      "orthopedic",
      "boards",
      "board certification",
      "ortho boards",
    ],
    description: "Official ABOS blueprint structure for orthopaedic surgery residents.",
  },
  {
    id: "lens_orthobullets_orthopaedic_2026",
    name: "Orthobullets Orthopaedic Topic Navigation 2026",
    domainId: "medicine_clinical",
    searchTerms: ["orthobullets", "ortho bullets", "orthopaedic topics", "orthopedic topics"],
    description: "Subspecialty hub navigation mirroring Orthobullets topic clusters.",
  },
  {
    id: "lens_abos_blueprint_2024.stub",
    name: "ABOS Blueprint (outline stub)",
    domainId: "medicine_clinical",
    searchTerms: ["abos stub", "abos outline"],
    description: "Section outline only — mappings empty; for schema reference.",
  },
];

export function searchLensCatalog(query: string, limit = 8): LensCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return LENS_CATALOG.filter((e) => !e.id.includes(".stub")).slice(0, limit);
  }

  const scored = LENS_CATALOG.map((entry) => {
    let score = 0;
    if (entry.name.toLowerCase().includes(q)) score += 3;
    if (entry.id.toLowerCase().includes(q)) score += 2;
    for (const term of entry.searchTerms) {
      if (term.includes(q) || q.includes(term)) score += 2;
      if (term.startsWith(q)) score += 1;
    }
    return { entry, score };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ entry }) => entry);
}

export function getLensCatalogEntry(lensId: string): LensCatalogEntry | undefined {
  return LENS_CATALOG.find((e) => e.id === lensId);
}
