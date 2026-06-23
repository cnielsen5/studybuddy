import learningScienceV1 from "../../../content/libraries/learning-science-v1/library.json";

export type LibraryCardTier = "core" | "extension" | "certification" | "remedial";

export interface LibraryCardMeta {
  cardId: string;
  conceptId: string;
  cardTier: LibraryCardTier;
  pedagogicalRole: string;
}

interface LibraryCardJson {
  id: string;
  type: string;
  relations?: { concept_id?: string };
  config?: { card_tier?: string; pedagogical_role?: string };
}

interface LibraryBundleJson {
  cards: LibraryCardJson[];
}

const LIBRARIES: Record<string, LibraryBundleJson> = {
  lib_learning_science_v1: learningScienceV1 as LibraryBundleJson,
};

const ALLOWED_TIERS = new Set<LibraryCardTier>([
  "core",
  "extension",
  "certification",
  "remedial",
]);

export function getCardConceptId(
  libraryId: string,
  cardId: string
): string | undefined {
  const bundle = LIBRARIES[libraryId];
  if (!bundle) return undefined;

  const card = bundle.cards.find((entry) => entry.id === cardId);
  if (!card || card.type !== "card") return undefined;
  return card.relations?.concept_id;
}

export function getConceptCardMeta(
  libraryId: string,
  conceptId: string
): LibraryCardMeta[] {
  const bundle = LIBRARIES[libraryId];
  if (!bundle) return [];

  return bundle.cards
    .filter(
      (card) =>
        card.type === "card" && card.relations?.concept_id === conceptId
    )
    .map((card) => ({
      cardId: card.id,
      conceptId,
      cardTier: normalizeTier(card.config?.card_tier),
      pedagogicalRole: card.config?.pedagogical_role ?? "recall",
    }));
}

function normalizeTier(tier: string | undefined): LibraryCardTier {
  if (tier && ALLOWED_TIERS.has(tier as LibraryCardTier)) {
    return tier as LibraryCardTier;
  }
  return "core";
}
