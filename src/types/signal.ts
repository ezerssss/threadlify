import * as z from "zod";

/** Lenses for signals: one signal per lens per post. */
export const SIGNAL_LENSES = ["market_icp", "feature", "onboarding", "monetization", "trust"];

export const SignalLensSchema = z.enum(SIGNAL_LENSES);

/** One quote with text and link to source (post or comment URL). No limit on count; UI shows 5 first, "see more" for rest. */
export const SignalQuoteSchema = z.object({
  text: z.string().min(1),
  url: z.string().min(1),
});

export const SignalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  lens: SignalLensSchema,
  description: z.string().min(1),
  count: z.number().int().min(0),
  createdAt: z.string(),
  updatedAt: z.string(),
  quotes: z.array(SignalQuoteSchema),
});

export type SignalType = z.infer<typeof SignalSchema>;

/** Only signals with 5+ posts supporting them are shown as valid. */
export const MIN_SIGNAL_COUNT = 5;
