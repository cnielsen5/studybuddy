/**
 * Re-buckets the existing (ABOS/StatPearls-derived) orthopaedic spine content
 * into the new OrthoBullets section → chapter → topic scheme, without
 * fabricating any new medical content.
 *
 * Legacy shape:   hub (L3) → topic (L3) → L4 → L5
 * New shape:      section (L3) → chapter (L4) → topic (L5)
 *
 * Mapping:
 *   legacy hub        → section            (LEGACY_HUB_TO_SECTION)
 *   legacy topic L3   → chapter (L4)       (content reused verbatim)
 *   legacy L4         → topic (L5)         (content reused verbatim)
 *   legacy L5         → folded into card-level content (counted, not a spine node)
 *
 * Sections with authoritative OrthoBullets data (Recon) are excluded here and
 * built from the sheet taxonomy instead.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  LEGACY_HUB_REMAP_NOTES,
  LEGACY_HUB_TO_SECTION,
  OB_SECTION_BY_SLUG,
  type ObSectionSlug,
} from "./sections.js";
import type { ObChapter, ObSectionTaxonomy, ObTopic } from "./taxonomyTypes.js";

interface RawConcept {
  id: string;
  content: { title: string; definition: string; summary: string };
  dependency_graph: { parent_concept_id: string };
  resolution_level: number;
}

interface OrthoL23Draft {
  hub_concepts: RawConcept[];
  concepts: RawConcept[];
}

const stripL3 = (id: string) => id.replace(/^spine_medicine_clinical_l3_/, "");
const stripL4 = (id: string) => id.replace(/^spine_medicine_clinical_l4_/, "");

/** Sections that come from authoritative OrthoBullets data and must not be re-bucketed. */
const EXCLUDE_SECTIONS = new Set<ObSectionSlug>(["recon"]);

export interface RebucketResult {
  taxonomies: ObSectionTaxonomy[];
  /** Legacy L5 nodes folded into card content (per section). */
  foldedL5Counts: Record<string, number>;
}

export function rebucketExistingOrtho(repoRoot: string): RebucketResult {
  const l23Path = join(repoRoot, "content/spine/drafts/orthopaedic-surgery-l2-l3.draft.json");
  const bundleDir = join(repoRoot, "content/spine/drafts/orthopaedic-l4-l5/bundles");

  const draft = JSON.parse(readFileSync(l23Path, "utf8")) as OrthoL23Draft;

  // Index bundles by anchor_l3_id (= legacy topic L3 id).
  const bundlesByAnchor = new Map<string, RawConcept[]>();
  if (existsSync(bundleDir)) {
    for (const file of readdirSync(bundleDir).filter((f) => f.endsWith(".json"))) {
      const bundle = JSON.parse(readFileSync(join(bundleDir, file), "utf8")) as {
        _meta: { anchor_l3_id: string };
        concepts: RawConcept[];
      };
      bundlesByAnchor.set(bundle._meta.anchor_l3_id, bundle.concepts);
    }
  }

  // hub id → section slug
  const hubIdToSection = new Map<string, ObSectionSlug>();
  for (const hub of draft.hub_concepts) {
    const section = LEGACY_HUB_TO_SECTION[stripL3(hub.id)];
    if (section) hubIdToSection.set(hub.id, section);
  }

  const chaptersBySection = new Map<ObSectionSlug, ObChapter[]>();
  const foldedL5Counts: Record<string, number> = {};

  for (const topicL3 of draft.concepts) {
    const hubId = topicL3.dependency_graph.parent_concept_id;
    const section = hubIdToSection.get(hubId);
    if (!section || EXCLUDE_SECTIONS.has(section)) continue;

    const chapterShort = `ob_${section}_${stripL3(topicL3.id)}`;
    const bundleConcepts = bundlesByAnchor.get(topicL3.id) ?? [];

    const l4s = bundleConcepts.filter((c) => c.resolution_level === 4);
    const l5s = bundleConcepts.filter((c) => c.resolution_level === 5);
    foldedL5Counts[section] = (foldedL5Counts[section] ?? 0) + l5s.length;

    // Count folded L5 per parent L4 for card hints.
    const l5ByParent = new Map<string, number>();
    for (const l5 of l5s) {
      const p = l5.dependency_graph.parent_concept_id;
      l5ByParent.set(p, (l5ByParent.get(p) ?? 0) + 1);
    }

    const topics: ObTopic[] = l4s.map((l4) => ({
      shortName: `ob_${section}_${stripL4(l4.id)}`,
      title: l4.content.title,
      definition: l4.content.definition,
      summary: l4.content.summary,
      cardCount: l5ByParent.get(l4.id) ?? 0,
      source: { source: "Spine (ABOS/StatPearls re-bucketed)", chapter: topicL3.content.title, section: l4.content.title },
    }));

    const chapter: ObChapter = {
      shortName: chapterShort,
      title: topicL3.content.title,
      field: OB_SECTION_BY_SLUG[section].title,
      definition: topicL3.content.definition,
      summary: topicL3.content.summary,
      topics,
      source: { source: "Spine (ABOS/StatPearls re-bucketed)", chapter: topicL3.content.title },
    };

    if (!chaptersBySection.has(section)) chaptersBySection.set(section, []);
    chaptersBySection.get(section)!.push(chapter);
  }

  const taxonomies: ObSectionTaxonomy[] = [];
  for (const [slug, chapters] of chaptersBySection) {
    chapters.sort((a, b) => a.title.localeCompare(b.title));
    const remapNotes = Object.entries(LEGACY_HUB_REMAP_NOTES)
      .filter(([hub]) => LEGACY_HUB_TO_SECTION[hub] === slug)
      .map(([, note]) => note);
    taxonomies.push({
      section: slug,
      provenance: "rebucketed_existing_spine",
      obDataPending: true,
      notes:
        "Re-bucketed from existing ABOS/StatPearls spine content; awaiting authoritative OrthoBullets chapter/topic import." +
        (remapNotes.length ? ` ${remapNotes.join(" ")}` : ""),
      chapters,
    });
  }

  return { taxonomies, foldedL5Counts };
}
