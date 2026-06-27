import type { OrthoL4Spec, OrthoL5Spec } from "./orthopaedicL4L5Types.js";

export function l4(
  shortName: string,
  title: string,
  definition: string,
  summary: string,
  opts: Partial<OrthoL4Spec> = {}
): OrthoL4Spec {
  return { shortName, title, definition, summary, ...opts };
}

export function l5(
  shortName: string,
  title: string,
  definition: string,
  summary: string,
  opts: Partial<OrthoL5Spec> = {}
): OrthoL5Spec {
  return { shortName, title, definition, summary, ...opts };
}
