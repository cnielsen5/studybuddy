import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import type { IntentDialogueAnswers } from "../types/intentDialogue.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import { buildIntentFromDialogue } from "./buildIntentFromDialogue.js";
import { searchLensCatalog } from "./lensCatalog.js";

export interface IntentDialogueOptions {
  rl?: ReturnType<typeof createInterface>;
}

/**
 * Stage 1 — conversational intent collection (4–6 questions).
 * Returns LibraryCreationIntent; user never sees the JSON.
 */
export async function collectIntentDialogue(
  options: IntentDialogueOptions = {}
): Promise<LibraryCreationIntent> {
  const rl = options.rl ?? createInterface({ input, output });
  const closeRl = !options.rl;

  try {
    console.log("\n── Stage 1: Intent dialogue ──\n");
    console.log(
      "Answer a few questions so we can tailor your library. Think of this as talking to a librarian.\n"
    );

    const purposeStatement = await askMultiline(
      rl,
      "What is this library for?\n" +
        "(e.g. studying for USMLE Step 1, college organic chemistry, ABOS orthopaedic boards)"
    );

    const audienceLevel = await choose(
      rl,
      "What level are you studying at?",
      [
        { value: "highschool" as const, label: "High School" },
        { value: "undergrad" as const, label: "Undergraduate / College" },
        { value: "grad" as const, label: "Graduate School" },
        { value: "professional" as const, label: "Professional (Medical, Legal, Business, …)" },
        { value: "self_taught" as const, label: "Self-taught / Personal interest" },
      ],
      "undergrad"
    );

    const curriculumBranch = await choose(
      rl,
      "Is there a specific curriculum, course, or study guide you want to follow?",
      [
        { value: "custom" as const, label: "Yes — I have a syllabus or document" },
        { value: "catalog" as const, label: "Yes — a well-known program or exam" },
        { value: "logical" as const, label: "No — organize it logically for my topic" },
      ],
      "logical"
    );

    let curriculum: IntentDialogueAnswers["curriculum"];
    if (curriculumBranch === "custom") {
      const name = await ask(rl, "Curriculum / syllabus name", "My syllabus");
      const sourceUrl = await ask(rl, "Link (optional, paste URL or leave blank)", "");
      curriculum = {
        mode: "custom",
        name,
        sourceUrl: sourceUrl && /^https?:\/\//i.test(sourceUrl) ? sourceUrl : undefined,
      };
    } else if (curriculumBranch === "catalog") {
      const query = await ask(rl, "Search programs (e.g. ABOS, USMLE, Orthobullets)", "ABOS");
      const matches = searchLensCatalog(query);
      if (matches.length === 0) {
        console.log("No catalog match — using logical organization.");
        curriculum = { mode: "logical" };
      } else {
        console.log("\nMatching programs:");
        matches.forEach((m, i) => console.log(`  ${i + 1}. ${m.name}`));
        const pick = await ask(rl, `Choose 1–${matches.length}`, "1");
        const index = Math.max(0, Math.min(matches.length - 1, Number.parseInt(pick, 10) - 1));
        const chosen = matches[index] ?? matches[0];
        curriculum = {
          mode: "catalog",
          lensId: chosen.id,
          lensName: chosen.name,
        };
      }
    } else {
      curriculum = { mode: "logical" };
    }

    const scopeNotes = await ask(
      rl,
      "Topics to include or leave out? (optional — press Enter to skip)",
      ""
    );

    const usagePurpose = await choose(
      rl,
      "How are you planning to use this library?",
      [
        {
          value: "exam_prep" as const,
          label: "Exam prep — high-yield, practice questions",
        },
        {
          value: "deep_understanding" as const,
          label: "Deep understanding — comprehensive, connections emphasized",
        },
        {
          value: "reference" as const,
          label: "Quick reference — lighter load, key facts",
        },
      ],
      "exam_prep"
    );

    const answers: IntentDialogueAnswers = {
      purposeStatement,
      audienceLevel,
      curriculum,
      scopeNotes: scopeNotes || undefined,
      usagePurpose,
    };

    const intent = buildIntentFromDialogue(answers);
    console.log(`\n✓ Intent captured: "${intent.libraryTitle}" (${intent.domain})\n`);
    return intent;
  } finally {
    if (closeRl) rl.close();
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

async function askMultiline(
  rl: ReturnType<typeof createInterface>,
  prompt: string
): Promise<string> {
  console.log(`\n${prompt}`);
  const line = (await rl.question("> ")).trim();
  return line;
}

async function choose<T extends string>(
  rl: ReturnType<typeof createInterface>,
  label: string,
  options: Array<{ value: T; label: string }>,
  defaultValue: T
): Promise<T> {
  console.log(`\n${label}`);
  options.forEach((opt, index) => {
    const marker = opt.value === defaultValue ? " (default)" : "";
    console.log(`  ${index + 1}. ${opt.label}${marker}`);
  });

  while (true) {
    const answer = (
      await rl.question(`Choose 1–${options.length} [default]: `)
    ).trim();
    if (!answer) return defaultValue;
    const index = Number.parseInt(answer, 10);
    if (index >= 1 && index <= options.length) {
      return options[index - 1].value;
    }
    console.log("Invalid choice — try again.");
  }
}
