import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import type {
  AudienceProfile,
  LibraryCreationIntent,
  LibraryPurpose,
} from "../types/intent.js";

export interface PromptOptions {
  rl?: ReturnType<typeof createInterface>;
}

export async function collectLibraryCreationIntent(
  defaults?: Partial<{ libraryTitle: string; domain: string }>,
  options: PromptOptions = {}
): Promise<LibraryCreationIntent> {
  const rl = options.rl ?? createInterface({ input, output });
  const closeRl = !options.rl;

  try {
    console.log("\nLibrary creation intent (3–5 questions)\n");

    const libraryTitle = await ask(
      rl,
      "Library title",
      defaults?.libraryTitle ?? "Untitled Library"
    );
    const domain = await ask(rl, "Domain", defaults?.domain ?? "General");
    const purpose = await choose<LibraryPurpose>(
      rl,
      "Primary purpose",
      [
        { value: "exam_prep", label: "Exam prep (high-yield, diagnostic-heavy)" },
        {
          value: "deep_understanding",
          label: "Deep understanding (relationships, integration)",
        },
        { value: "reference", label: "Reference (broad coverage, lighter questions)" },
      ],
      "exam_prep"
    );

    const audienceLevel = await choose<AudienceProfile["level"]>(
      rl,
      "Audience level",
      [
        { value: "highschool", label: "High school" },
        { value: "undergrad", label: "Undergraduate" },
        { value: "grad", label: "Graduate" },
        { value: "professional", label: "Professional / clinical" },
      ],
      "undergrad"
    );

    const targetDepth = await choose<AudienceProfile["targetDepth"]>(
      rl,
      "Target depth",
      [
        { value: "survey", label: "Survey — overview and key terms" },
        { value: "working", label: "Working — apply and reason" },
        { value: "mastery", label: "Mastery — nuance, edge cases, transfer" },
      ],
      "working"
    );

    const priorRaw = await ask(
      rl,
      "Prerequisites assumed known (comma-separated, or leave blank)",
      ""
    );
    const priorKnowledge = priorRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const scopeRaw = await ask(
      rl,
      "Explicitly out of scope (comma-separated topics, or leave blank)",
      ""
    );
    const scopeBoundaries = scopeRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const augment = await yesNo(
      rl,
      "Allow external source augmentation later (Phase 2+)?",
      false
    );

    const description = await ask(
      rl,
      "Short library description (optional)",
      ""
    );

    return {
      libraryTitle,
      libraryDescription: description || undefined,
      domain,
      purpose,
      audience: {
        level: audienceLevel,
        priorKnowledge,
        targetDepth,
      },
      scopeBoundaries,
      externalAugmentationAllowed: augment,
      similarityThreshold: 0.9,
    };
  } finally {
    if (closeRl) {
      rl.close();
    }
  }
}

async function ask(
  rl: ReturnType<typeof createInterface>,
  label: string,
  defaultValue: string
): Promise<string> {
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  const answer = (await rl.question(`${label}${suffix}: `)).trim();
  return answer || defaultValue;
}

async function yesNo(
  rl: ReturnType<typeof createInterface>,
  label: string,
  defaultValue: boolean
): Promise<boolean> {
  const hint = defaultValue ? "Y/n" : "y/N";
  const answer = (await rl.question(`${label} (${hint}): `)).trim().toLowerCase();
  if (!answer) return defaultValue;
  return answer.startsWith("y");
}

async function choose<T extends string>(
  rl: ReturnType<typeof createInterface>,
  label: string,
  options: Array<{ value: T; label: string }>,
  defaultValue: T
): Promise<T> {
  console.log(`\n${label}:`);
  options.forEach((opt, index) => {
    const marker = opt.value === defaultValue ? " (default)" : "";
    console.log(`  ${index + 1}. ${opt.label}${marker}`);
  });

  while (true) {
    const answer = (
      await rl.question(`Choose 1–${options.length} [default]: `)
    ).trim();
    if (!answer) {
      return defaultValue;
    }
    const index = Number.parseInt(answer, 10);
    if (index >= 1 && index <= options.length) {
      return options[index - 1].value;
    }
    const match = options.find(
      (opt) => opt.value === answer || opt.label.toLowerCase() === answer.toLowerCase()
    );
    if (match) {
      return match.value;
    }
    console.log("Invalid choice — try again.");
  }
}
