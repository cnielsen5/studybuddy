import { z } from "zod";

export const DomainArchetypeIdSchema = z.enum([
  "anatomy",
  "math",
  "chemistry",
  "history",
  "physics",
  "law",
  "mixed",
]);

export type DomainArchetypeId = z.infer<typeof DomainArchetypeIdSchema>;

export const DomainProfileSchema = z.object({
  archetypeId: DomainArchetypeIdSchema,
  primaryLearningMode: z.enum([
    "memorization",
    "practice",
    "conceptual",
    "mixed",
  ]),
  cardTierWeights: z.object({
    core: z.number(),
    extension: z.number(),
    certification: z.number(),
    remedial: z.number(),
  }),
  cardTypeWeights: z.object({
    basic: z.number(),
    cloze: z.number(),
    imageOcclusion: z.number(),
  }),
  pedagogicalRoleWeights: z.object({
    recognition: z.number(),
    recall: z.number(),
    application: z.number(),
    integration: z.number(),
  }),
  questionDensity: z.number().positive(),
  relationshipDensity: z.number().nonnegative(),
  prefersDiagnosticQuestions: z.boolean(),
});

export type DomainProfile = z.infer<typeof DomainProfileSchema>;
