import type { DomainContext } from "../types/domainContext.js";
import { emptySpineLinkedContent } from "../types/domainContext.js";

export function emptySpineDomainLinks(): DomainContext["linked_content"] {
  return emptySpineLinkedContent();
}
