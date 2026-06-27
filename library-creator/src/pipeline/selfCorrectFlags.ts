import type { ReconcileFlag } from "../types/reconcile.js";
import { MAX_FLAGS_BEFORE_SELF_CORRECTION } from "../types/reconcile.js";

/**
 * If Stage 3 produces too many flags, auto-resolve obvious ones before Stage 4.
 * Conservative defaults: include scope content, add missing coverage, confirm new concepts.
 */
export function selfCorrectFlags(flags: ReconcileFlag[]): {
  flags: ReconcileFlag[];
  autoResolvedCount: number;
} {
  if (flags.length <= MAX_FLAGS_BEFORE_SELF_CORRECTION) {
    return { flags, autoResolvedCount: 0 };
  }

  let autoResolvedCount = 0;
  const corrected = flags.map((flag) => {
    if (flag.resolution !== "pending") return flag;

    if (flag.type === "scope_question" && flag.defaultResolution === "include") {
      autoResolvedCount += 1;
      return { ...flag, resolution: "include" as const };
    }
    if (flag.type === "missing_coverage" && flag.defaultResolution === "add_coverage") {
      autoResolvedCount += 1;
      return { ...flag, resolution: "add_coverage" as const };
    }
    if (
      flag.type === "new_concept_confirmation" &&
      flag.defaultResolution === "confirmed"
    ) {
      autoResolvedCount += 1;
      return { ...flag, resolution: "confirmed" as const };
    }
    return flag;
  });

  return { flags: corrected, autoResolvedCount };
}
