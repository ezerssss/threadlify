import * as z from "zod";

/** Per-lens insight summary: one paragraph per lens (only when 5+ signals exist). */
export const InsightSummarySchema = z.object({
  market_icp: z.string(),
  pain: z.string(),
  feature: z.string(),
  onboarding: z.string(),
  monetization: z.string(),
  trust: z.string(),
});

export type InsightSummaryType = z.infer<typeof InsightSummarySchema>;
