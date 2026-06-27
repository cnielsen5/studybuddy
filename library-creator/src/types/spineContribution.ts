import { z } from "zod";

export const SpineContributionRecommendationSchema = z.enum([
  "promote_to_spine",
  "review_needed",
  "too_specific",
]);

export type SpineContributionRecommendation = z.infer<
  typeof SpineContributionRecommendationSchema
>;

export const SpineContributionCandidateSchema = z.object({
  concept_id: z.string().min(1),
  anchor_spine_id: z.string().min(1),
  domain_id: z.string().min(1),
  title: z.string().min(1),
  generated_for_library: z.string().min(1),
  generated_for_user: z.string().min(1),
  quality_signals: z.object({
    source_citations: z.number().int().nonnegative(),
    similar_user_count: z.number().int().nonnegative().default(0),
    card_performance: z.number().min(0).max(1).optional(),
  }),
  recommendation: SpineContributionRecommendationSchema,
  created_at: z.string().datetime(),
});

export type SpineContributionCandidate = z.infer<
  typeof SpineContributionCandidateSchema
>;

export const SpineContributionQueueSchema = z.object({
  version: z.literal(1),
  updated_at: z.string().datetime(),
  candidates: z.array(SpineContributionCandidateSchema),
});

export type SpineContributionQueue = z.infer<typeof SpineContributionQueueSchema>;
