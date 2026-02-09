import * as z from "zod";

/** Per-lens insight summary: one paragraph per lens (only when 5+ signals exist). */
const InsightLensSchema = z.object({
  headline: z.string().min(1), // 1-2 sentences capturing the main takeaway
  subline: z.string().min(1), // Supporting context/subheadline
  bullets: z.array(z.string().min(1)).min(1), // Array of bullet points with details
});

/** Per-lens insight: structured format with headline, subline, and bullets for each lens. */
export const InsightSummarySchema = z.object({
  market_icp: InsightLensSchema,
  feature: InsightLensSchema,
  onboarding: InsightLensSchema,
  monetization: InsightLensSchema,
  trust: InsightLensSchema,
});

export type InsightSummaryType = z.infer<typeof InsightSummarySchema>;
