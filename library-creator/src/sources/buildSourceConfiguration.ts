import type { LibraryCreationIntent } from "../types/intent.js";
import type { SourceConfiguration } from "../types/sourceConfig.js";
import { filterCatalogForDomain } from "./sourceCatalog.js";

export interface BuildSourceConfigurationOptions {
  /** Pre-selected catalog ids; defaults to recommended tiles for domain. */
  selectedCatalogIds?: string[];
  uploads?: SourceConfiguration["uploads"];
  webUrls?: string[];
}

/**
 * Stage 2 — pre-select recommended curated sources for the intent domain.
 */
export function buildSourceConfiguration(
  intent: LibraryCreationIntent,
  options: BuildSourceConfigurationOptions = {}
): SourceConfiguration {
  const catalog = filterCatalogForDomain(intent.spineDomainId);
  const recommendedIds = catalog.filter((s) => s.recommended).map((s) => s.id);

  const selectedCatalogIds =
    options.selectedCatalogIds ??
    (recommendedIds.length > 0 ? recommendedIds : catalog.slice(0, 2).map((s) => s.id));

  return {
    uploads: options.uploads ?? [],
    webUrls: options.webUrls ?? [],
    selectedCatalogIds,
    similarityThreshold: intent.similarityThreshold,
  };
}
