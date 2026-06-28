import type { ObSectionSlug } from "./sections.js";

/**
 * OrthoBullets-native taxonomy model. One `ObSectionTaxonomy` per L3 section
 * holds the chapters (L4) and topics (L5) below it. This is the single source
 * of truth that the spine generator and the OrthoBullets lens both read.
 */

/** Traceable source reference for a taxonomy node. */
export interface ObSourceRef {
  source: string;
  chapter?: string;
  section?: string;
  /** Absolute OrthoBullets URL for the topic/chapter, when scraped from the site. */
  url?: string;
}

/** A leaf OrthoBullets "Topic" page → becomes an L5 spine concept. */
export interface ObTopic {
  /** Stable short name → spine_medicine_clinical_l5_<shortName>. */
  shortName: string;
  title: string;
  definition: string;
  summary: string;
  /** Count of source rows (concept_title cards) that informed this topic. */
  cardCount?: number;
  /** OrthoBullets numeric topic id (from the topic URL), when scraped. */
  obTopicId?: string;
  source?: ObSourceRef;
}

/** An OrthoBullets "Chapter" → becomes an L4 spine concept. */
export interface ObChapter {
  shortName: string;
  title: string;
  definition: string;
  summary: string;
  /** Originating OrthoBullets "Field" (collapsed into the section), kept for traceability. */
  field?: string;
  topics: ObTopic[];
  source?: ObSourceRef;
}

/** Full taxonomy for one L3 section. */
export interface ObSectionTaxonomy {
  section: ObSectionSlug;
  /** Where the chapters/topics came from. */
  provenance: "orthobullets_sheet" | "rebucketed_existing_spine" | "pending_import";
  /** True when authoritative OrthoBullets data has not yet been imported. */
  obDataPending: boolean;
  notes?: string;
  chapters: ObChapter[];
}
