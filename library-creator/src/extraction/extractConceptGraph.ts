import type { DomainProfile } from "../types/domainProfile.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import type { ParsedSource } from "../types/parsedSource.js";
import type { ConceptGraphDraft } from "../types/draftConcept.js";
import { extractConceptGraphHeuristic } from "./heuristicConceptExtractor.js";
import { extractConceptGraphOpenAI } from "./openaiConceptExtractor.js";
import {
  detectSourceStructure,
  extractConceptGraphStructured,
} from "./structuredConceptExtractor.js";

export interface ExtractConceptGraphOptions {
  useAi?: boolean;
  maxConcepts?: number;
  /**
   * When the provided content carries an explicit hierarchy, mirror it into the
   * concept map (layered) instead of flattening. Defaults to true.
   */
  preserveStructure?: boolean;
}

export async function extractConceptGraph(
  parsedSource: ParsedSource,
  intent: LibraryCreationIntent,
  domainProfile: DomainProfile,
  options: ExtractConceptGraphOptions = {}
): Promise<ConceptGraphDraft> {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.LIBRARY_CREATOR_OPENAI_API_KEY;

  if (options.useAi && apiKey) {
    try {
      return await extractConceptGraphOpenAI(
        parsedSource,
        intent,
        domainProfile,
        apiKey,
        { maxConcepts: options.maxConcepts }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`AI extraction failed (${message}). Falling back to heuristic.`);
    }
  } else if (options.useAi && !apiKey) {
    console.warn("OPENAI_API_KEY not set — using heuristic extraction.");
  }

  // Reflect provided content structure into the concept map when present.
  if (options.preserveStructure !== false) {
    const structure = detectSourceStructure(parsedSource);
    if (structure.hasStructure) {
      return extractConceptGraphStructured(parsedSource, intent, domainProfile, {
        maxConcepts: options.maxConcepts,
      });
    }
  }

  return extractConceptGraphHeuristic(parsedSource, intent, domainProfile, {
    maxConcepts: options.maxConcepts,
  });
}
