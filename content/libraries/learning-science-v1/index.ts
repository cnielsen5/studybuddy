import { concepts, LIBRARY_ID, LIBRARY_META } from "./concepts";
import { cards } from "./cards";
import { relationships } from "./relationships";
import { questions } from "./questions";

export { LIBRARY_ID, LIBRARY_META, concepts, cards, relationships, questions };

export const learningScienceLibrary = {
  manifest: LIBRARY_META,
  concepts,
  relationships,
  cards,
  questions,
};

export default learningScienceLibrary;
