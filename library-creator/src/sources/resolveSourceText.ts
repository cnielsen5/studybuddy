import { getLensCatalogEntry } from "../intent/lensCatalog.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import type { CurriculumLens, CurriculumSection } from "../types/curriculumLens.js";
import type { SourceConfiguration } from "../types/sourceConfig.js";
import { getCuratedSource } from "./sourceCatalog.js";

const MIN_BODY_CHARS = 24;

function paragraphFor(title: string, context: string): string {
  return `${title} — core study material for ${context}. Review definitions, clinical presentation, diagnosis, and management at working depth.`;
}

export function hasConfiguredSources(sourceConfiguration: SourceConfiguration): boolean {
  return (
    sourceConfiguration.selectedCatalogIds.length > 0 ||
    sourceConfiguration.webUrls.length > 0 ||
    sourceConfiguration.uploads.length > 0
  );
}

function catalogSection(
  intent: LibraryCreationIntent,
  sourceConfiguration: SourceConfiguration
): string[] {
  const lines: string[] = ["## Curated open references"];

  for (const id of sourceConfiguration.selectedCatalogIds) {
    const source = getCuratedSource(id);
    if (!source) continue;
    lines.push(`### ${source.title}`);
    const urlNote = source.url ? ` Reference: ${source.url}.` : "";
    lines.push(
      paragraphFor(
        `${source.title} (${source.publisher})`,
        `${intent.domain}${urlNote}`
      )
    );
  }

  if (sourceConfiguration.webUrls.length > 0) {
    lines.push("## Additional web sources");
    for (const url of sourceConfiguration.webUrls) {
      lines.push(`### Web resource`);
      lines.push(paragraphFor(url, intent.domain));
    }
  }

  return lines;
}

function lensOutlineSections(lens: CurriculumLens, maxSections = 32): string[] {
  const lines: string[] = [`## Curriculum outline — ${lens.name}`, lens.description];

  const byParent = new Map<string | null, CurriculumSection[]>();
  for (const section of lens.sections) {
    const key = section.parent_section_id;
    const bucket = byParent.get(key) ?? [];
    bucket.push(section);
    byParent.set(key, bucket);
  }
  for (const bucket of byParent.values()) {
    bucket.sort((a, b) => a.order - b.order);
  }

  let emitted = 0;

  function walk(parentId: string | null, depth: number): void {
    if (emitted >= maxSections) return;
    for (const section of byParent.get(parentId) ?? []) {
      if (emitted >= maxSections) break;
      const heading = `${"#".repeat(Math.min(depth + 2, 4))} ${section.title}`;
      lines.push(heading);

      const mappedTitles = lens.concept_mappings
        .filter((m) => m.section_id === section.id)
        .slice(0, 2)
        .map((m) => m.lens_specific.title_in_lens)
        .filter(Boolean);

      const focus =
        mappedTitles.length > 0
          ? `Topics include ${mappedTitles.join(" and ")}.`
          : `Exam blueprint section for structured review.`;

      lines.push(paragraphFor(section.title, `${lens.name}. ${focus}`));
      emitted += 1;
      walk(section.id, depth + 1);
    }
  }

  walk(null, 0);
  return lines;
}

function lensCatalogStub(intent: LibraryCreationIntent): string[] {
  if (!intent.curriculumLensId) return [];
  const entry = getLensCatalogEntry(intent.curriculumLensId);
  if (!entry) return [];
  return [
    `## Curriculum lens — ${entry.name}`,
    paragraphFor(entry.name, entry.description),
  ];
}

/**
 * Synthesize ingestible markdown when the user skips paste/upload.
 * Uses selected catalog tiles and (when available) curriculum lens sections.
 */
export function buildDefaultSourceText(
  intent: LibraryCreationIntent,
  sourceConfiguration: SourceConfiguration,
  options: { lens?: CurriculumLens; maxLensSections?: number } = {}
): string {
  const intro = [
    `# ${intent.libraryTitle}`,
    intent.purposeStatement?.trim() ||
      intent.libraryDescription?.trim() ||
      `Structured library for ${intent.domain}.`,
    "",
    "This outline is generated from recommended open references and curriculum structure.",
  ];

  const body = [
    ...catalogSection(intent, sourceConfiguration),
    ...(options.lens
      ? lensOutlineSections(options.lens, options.maxLensSections ?? 32)
      : lensCatalogStub(intent)),
  ];

  const text = [...intro, ...body].join("\n\n");
  if (text.replace(/\s/g, "").length < MIN_BODY_CHARS) {
    throw new Error("Could not build default source text from selected references.");
  }
  return text;
}

export function resolveSourceText(
  sourceText: string,
  intent: LibraryCreationIntent,
  sourceConfiguration: SourceConfiguration,
  options: { lens?: CurriculumLens } = {}
): string {
  if (sourceText.trim()) {
    return sourceText;
  }
  if (!hasConfiguredSources(sourceConfiguration)) {
    throw new Error(
      "Add pasted notes, files, URLs, or keep at least one curated source selected."
    );
  }
  return buildDefaultSourceText(intent, sourceConfiguration, options);
}
