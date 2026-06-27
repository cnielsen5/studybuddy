import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { buildLibraryBundle, type BuildLibraryBundleInput } from "./buildLibraryBundle.js";
import {
  formatLibraryExportSummary,
  validateLibraryBundle,
} from "./libraryConformance.js";
import type { LibraryBundle } from "../types/libraryBundle.js";
import type { LibraryExportRecord } from "../types/libraryBundle.js";
import { LibraryExportRecordSchema } from "../types/libraryBundle.js";

export interface ExportLibraryOptions {
  publish?: boolean;
  version?: string;
  outPath?: string;
}

export interface ExportLibraryResult {
  bundle: LibraryBundle;
  record: LibraryExportRecord;
}

export async function exportLibraryBundle(
  input: BuildLibraryBundleInput,
  artifactPath: string,
  options: ExportLibraryOptions = {}
): Promise<ExportLibraryResult> {
  const bundle = buildLibraryBundle({
    ...input,
    options: {
      publish: options.publish,
      version: options.version,
    },
  });

  const validation = validateLibraryBundle(bundle);
  if (!validation.valid) {
    const summary = validation.issues
      .filter((issue) => issue.severity === "error")
      .map((issue) => issue.message)
      .join("; ");
    throw new Error(`Library export conformance failed: ${summary}`);
  }

  await mkdir(dirname(artifactPath), { recursive: true });
  await writeFile(artifactPath, JSON.stringify(bundle, null, 2), "utf8");

  if (options.outPath) {
    await mkdir(dirname(options.outPath), { recursive: true });
    await writeFile(options.outPath, JSON.stringify(bundle, null, 2), "utf8");
  }

  const record: LibraryExportRecord = LibraryExportRecordSchema.parse({
    exportedAt: bundle.manifest.updated_at,
    libraryId: bundle.manifest.id,
    artifactPath,
    publishStatus: bundle.manifest.status,
    stats: {
      concepts: bundle.concepts.length,
      relationships: bundle.relationships.length,
      cards: bundle.cards.length,
      questions: bundle.questions.length,
    },
    notes: [
      formatLibraryExportSummary(bundle),
      ...validation.issues
        .filter((issue) => issue.severity === "warning")
        .map((issue) => `Warning: ${issue.message}`),
    ],
  });

  return { bundle, record };
}

export { validateLibraryBundle, formatLibraryExportSummary };
