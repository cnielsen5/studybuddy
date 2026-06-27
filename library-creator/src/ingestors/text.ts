import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { ingestText } from "./textCore.js";

export { ingestText } from "./textCore.js";

export async function ingestTextFile(filePath: string) {
  const text = await readFile(filePath, "utf8");
  const ext = filePath.split(".").pop()?.toLowerCase();
  const sourceType =
    ext === "md" || ext === "markdown" ? "text" : ext === "syllabus" ? "syllabus" : "text";

  return ingestText(text, {
    sourceType,
    label: basename(filePath),
  });
}
