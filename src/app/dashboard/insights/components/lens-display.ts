import { Users, AlertCircle, Puzzle, Rocket, CreditCard, ShieldCheck, LucideIcon } from "lucide-react";
import type { z } from "zod";

import { SignalLensSchema } from "@/types/signal";

export type SignalLensKey = z.infer<typeof SignalLensSchema>;

export const LENS_DISPLAY: Record<SignalLensKey, { label: string; icon: string; Icon: LucideIcon; color: string }> = {
  market_icp: {
    label: "Market & ICP",
    icon: "Users",
    Icon: Users,
    color: "oklch(0.67 0.14 245)",
  },
  pain: {
    label: "Pain",
    icon: "AlertCircle",
    Icon: AlertCircle,
    color: "oklch(0.55 0.22 25)",
  },
  feature: {
    label: "Feature",
    icon: "Puzzle",
    Icon: Puzzle,
    color: "oklch(0.66 0.17 75)",
  },
  onboarding: {
    label: "Onboarding",
    icon: "Rocket",
    Icon: Rocket,
    color: "oklch(0.62 0.16 260)",
  },
  monetization: {
    label: "Monetization",
    icon: "CreditCard",
    Icon: CreditCard,
    color: "oklch(0.60 0.20 95)",
  },
  trust: {
    label: "Trust",
    icon: "ShieldCheck",
    Icon: ShieldCheck,
    color: "oklch(0.58 0.19 270)",
  },
};
