import {
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LibraryCreationJob,
  LibraryCreationJobSchema,
} from "../types/pipeline.js";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function defaultJobsDir(): string {
  return join(PACKAGE_ROOT, ".jobs");
}

export class JobStore {
  constructor(private readonly jobsDir: string = defaultJobsDir()) {}

  jobDir(jobId: string): string {
    return join(this.jobsDir, jobId);
  }

  jobPath(jobId: string): string {
    return join(this.jobDir(jobId), "job.json");
  }

  artifactPath(jobId: string, filename: string): string {
    return join(this.jobDir(jobId), "artifacts", filename);
  }

  async ensureJobDir(jobId: string): Promise<void> {
    await mkdir(join(this.jobDir(jobId), "artifacts"), { recursive: true });
  }

  async save(job: LibraryCreationJob): Promise<void> {
    LibraryCreationJobSchema.parse(job);
    await this.ensureJobDir(job.id);
    await writeFile(this.jobPath(job.id), JSON.stringify(job, null, 2), "utf8");
  }

  async load(jobId: string): Promise<LibraryCreationJob> {
    const raw = await readFile(this.jobPath(jobId), "utf8");
    return LibraryCreationJobSchema.parse(JSON.parse(raw));
  }

  async saveArtifact(
    jobId: string,
    filename: string,
    data: unknown
  ): Promise<string> {
    await this.ensureJobDir(jobId);
    const path = this.artifactPath(jobId, filename);
    await writeFile(path, JSON.stringify(data, null, 2), "utf8");
    return path;
  }

  async listJobIds(): Promise<string[]> {
    try {
      const entries = await readdir(this.jobsDir, { withFileTypes: true });
      return entries.filter((entry) => entry.isDirectory()).map((e) => e.name);
    } catch {
      return [];
    }
  }
}

export function createJobId(): string {
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return `lc_${suffix}`;
}
