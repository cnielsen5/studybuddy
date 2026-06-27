import { z } from "zod";

/** User-facing curriculum choice from Stage 1 question 3. */
export const CurriculumChoiceSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("custom"),
    name: z.string().min(1),
    sourceUrl: z.string().url().optional(),
    /** Client-side upload reference or job artifact path — not the file bytes. */
    uploadRef: z.string().optional(),
  }),
  z.object({
    mode: z.literal("catalog"),
    lensId: z.string().min(1),
    lensName: z.string().min(1),
  }),
  z.object({
    mode: z.literal("logical"),
  }),
]);

export type CurriculumChoice = z.infer<typeof CurriculumChoiceSchema>;

/** Raw answers from the Stage 1 intent dialogue (UI or CLI). */
export const IntentDialogueAnswersSchema = z.object({
  purposeStatement: z.string().min(1),
  audienceLevel: z.enum([
    "highschool",
    "undergrad",
    "grad",
    "professional",
    "self_taught",
  ]),
  curriculum: CurriculumChoiceSchema,
  scopeNotes: z.string().optional(),
  usagePurpose: z.enum(["exam_prep", "deep_understanding", "reference"]),
});

export type IntentDialogueAnswers = z.infer<typeof IntentDialogueAnswersSchema>;
