/**
 * Sparse L2 subdivision gates — cross-subdivision or cross-domain unlocks only.
 * Not a parent→child listing of L3 nodes; genuine learning gates (G3 policy).
 */
import { l2Id } from "./spineDomains.js";

export const SPINE_L2_UNLOCKS: Record<string, readonly string[]> = {
  [l2Id("mathematics", "Pre-Calculus & Functions")]: [
    l2Id("mathematics", "Single-Variable Calculus"),
    l2Id("mathematics", "Statistics & Probability"),
  ],
  [l2Id("mathematics", "Single-Variable Calculus")]: [
    l2Id("mathematics", "Multivariable Calculus"),
    l2Id("mathematics", "Differential Equations"),
    l2Id("physics", "Classical Mechanics"),
  ],
  [l2Id("mathematics", "Algebra")]: [l2Id("mathematics", "Linear Algebra")],
  [l2Id("physics", "Classical Mechanics")]: [
    l2Id("physics", "Waves & Oscillations"),
    l2Id("physics", "Fluid Mechanics"),
  ],
  [l2Id("chemistry", "General & Inorganic Chemistry")]: [
    l2Id("chemistry", "Organic Chemistry"),
    l2Id("chemistry", "Physical Chemistry"),
  ],
  [l2Id("biology", "Cell Biology")]: [l2Id("biology", "Molecular Biology & Genetics")],
};

export function l2UnlockTargets(l2ConceptId: string): string[] {
  return [...(SPINE_L2_UNLOCKS[l2ConceptId] ?? [])];
}
