import type { SpineDomainId } from "./spineDomains.js";
import type { SpineConcept } from "./spineSchema.js";
import { MATHEMATICS_L3 } from "./data/mathematicsL3.js";
import { PHYSICS_L3 } from "./data/physicsL3.js";
import { CHEMISTRY_L3 } from "./data/chemistryL3.js";
import { BIOLOGY_L3 } from "./data/biologyL3.js";
import { MEDICINE_PRECLINICAL_L3 } from "./data/medicinePreclinicalL3.js";
import { MEDICINE_CLINICAL_L3 } from "./data/medicineClinicalL3.js";
import { PSYCHOLOGY_NEUROSCIENCE_L3 } from "./data/psychologyNeuroscienceL3.js";

export const SPINE_LEVEL3_BY_DOMAIN: Record<SpineDomainId, SpineConcept[]> = {
  mathematics: MATHEMATICS_L3,
  physics: PHYSICS_L3,
  chemistry: CHEMISTRY_L3,
  biology: BIOLOGY_L3,
  medicine_preclinical: MEDICINE_PRECLINICAL_L3,
  medicine_clinical: MEDICINE_CLINICAL_L3,
  psychology_neuroscience: PSYCHOLOGY_NEUROSCIENCE_L3,
};
