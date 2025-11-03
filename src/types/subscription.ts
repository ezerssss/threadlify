import * as z from "zod";

export const SubscriptionPlanEnum = z.enum(["free", "pro", "enterprise"]);

export const SubscriptionSchema = z.object({
  plan: SubscriptionPlanEnum,
  status: z.enum(["active", "canceled", "past_due"]),
  autoRenew: z.boolean(),

  subscriptionId: z.string().nullable(),

  monthlyQuota: z.number(), // 3, 20, or 999999 (for unlimited)
  usedThisPeriod: z.number().nonnegative(),
  quotaResetDate: z.iso.datetime(), // reset scans used this period

  periodStart: z.iso.datetime().nullable(), // start of current billing cycle
  periodEnd: z.iso.datetime().nullable(), // end of billing cycle
});
