import type { SeedCard } from "../lib/types";

export const SEED_LIBRARY_ID = "lib_dev_001";

export const seedCards: SeedCard[] = [
  {
    id: "card_0001",
    conceptId: "concept_001",
    front: "What is spaced repetition?",
    back: "A learning technique that schedules reviews at increasing intervals to maximize long-term retention.",
  },
  {
    id: "card_0002",
    conceptId: "concept_001",
    front: "What does FSRS stand for?",
    back: "Free Spaced Repetition Scheduler — an algorithm that models memory stability and difficulty.",
  },
  {
    id: "card_0003",
    conceptId: "concept_002",
    front: "What is event sourcing?",
    back: "Storing state changes as an immutable sequence of events, then deriving current state from those events.",
  },
  {
    id: "card_0004",
    conceptId: "concept_002",
    front: "What is a projector in this architecture?",
    back: "A server function that reads events and updates read-model views (like card schedule state).",
  },
  {
    id: "card_0005",
    conceptId: "concept_003",
    front: "What is a concept map in Socrates?",
    back: "A graph of concepts connected by relationships, with cards and questions attached to each concept.",
  },
];
