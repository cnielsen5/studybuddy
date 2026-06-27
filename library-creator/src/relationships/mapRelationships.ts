import type { ConceptGraphDraft } from "../types/draftConcept.js";
import type { DomainProfile } from "../types/domainProfile.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import type { RelationshipsDraft } from "../types/draftRelationship.js";
import { mapRelationshipsHeuristic } from "./heuristicRelationshipMapper.js";

export interface MapRelationshipsOptions {
  useAi?: boolean;
}

export async function mapRelationships(
  conceptGraph: ConceptGraphDraft,
  intent: LibraryCreationIntent,
  domainProfile: DomainProfile,
  options: MapRelationshipsOptions = {}
): Promise<{
  draft: RelationshipsDraft;
  concepts: ConceptGraphDraft["concepts"];
}> {
  if (options.useAi) {
    console.warn(
      "AI relationship mapping is not implemented yet — using heuristic mapper."
    );
  }

  return mapRelationshipsHeuristic({ conceptGraph, intent, domainProfile });
}
