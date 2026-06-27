import type { ConceptSourceReference } from "../../types/domainContext.js";

export interface OrthoL5Spec {
  shortName: string;
  title: string;
  definition: string;
  summary: string;
  sharedNote?: string;
  nbkSection?: string;
  source?: ConceptSourceReference;
}

export interface OrthoL4Spec {
  shortName: string;
  title: string;
  definition: string;
  summary: string;
  prerequisites?: string[];
  sharedNote?: string;
  nbkSection?: string;
  source?: ConceptSourceReference;
  l5?: OrthoL5Spec[];
}

/** L4/L5 children for one L3 anchor. */
export interface OrthoAnchorL4L5Spec {
  anchorShortName: string;
  l4: OrthoL4Spec[];
  notes?: string;
}

/** L4/L5 ortho domain_context on an existing spine L3 (merged perioperative nodes). */
export interface OrthoExistingAnchorL4L5Spec {
  existingSpineId: string;
  deferredFrom: string;
  subcategory: string;
  l4: OrthoL4Spec[];
  notes?: string;
}
