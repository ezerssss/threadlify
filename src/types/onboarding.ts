import * as z from "zod";

export const OnboardingSchema = z.object({
  name: z.string().min(1),
  url: z.url(),
  strategy: z.string().min(1),
});

export type OnboardingType = z.infer<typeof OnboardingSchema>;
