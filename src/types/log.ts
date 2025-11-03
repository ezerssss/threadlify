import * as z from "zod";

import { SubscriptionPlanEnum } from "./subscription";

export const ScanLogSchema = z.object({
  id: z.string().min(1),
  logType: z.literal("scan"),
  scanType: z.string().min(1),
  userId: z.string().min(1),
  platform: z.string().min(1),
  postsAnalyzed: z.number().int().nonnegative(),
  relevantPosts: z.number().int().nonnegative(),
  durationMs: z.number().nonnegative(),
  date: z.iso.datetime(),
  status: z.enum(["success", "failed"]),
  errorMessage: z.string().nullable(),
});
export type ScanLogType = z.infer<typeof ScanLogSchema>;

export const PaymentLogSchema = z.object({
  id: z.string().min(1),
  logType: z.literal("payment"),
  userId: z.string().nullable(),
  subscriptionId: z.string().min(1),
  amount: z.number().nonnegative(),
  currency: z.string().min(1),
  method: z.enum(["paypal", "stripe", "manual", "other"]),
  status: z.enum(["pending", "completed", "failed", "refunded"]),
  subscriptionPlan: SubscriptionPlanEnum,
  notes: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type PaymentLogType = z.infer<typeof PaymentLogSchema>;
