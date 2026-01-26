import React, { useState } from "react";

import { Copy, Check, Mail, CreditCard, Zap, Building2, LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpgradeModalStore } from "@/stores/upgrade";

interface Plan {
  id: string;
  name: string;
  icon: LucideIcon;
  originalPrice?: string;
  price: string;
  period: string;
  scans: string;
  badge: string;
  badgeColor: string;
  features: string[];
}

function FallbackInstructions() {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
      <p className="mb-1 font-semibold">If the email button doesn&apos;t work:</p>
      <ol className="ml-4 list-decimal space-y-1">
        <li>Open your email app manually (Gmail, Outlook, etc.).</li>
        <li>
          Compose a new message to <span className="font-medium">support@threadlify.io</span>.
        </li>
        <li>
          Use the subject: <span className="font-medium">&quot;Upgrade Request – Your Plan&quot;</span>.
        </li>
        <li>Include your registered email and the plan you&apos;d like to upgrade to.</li>
      </ol>
    </div>
  );
}

interface RequestEmailProps {
  selectedPlanData: Plan;
  supportEmail: string;
}

function RequestEmail(props: RequestEmailProps) {
  const { selectedPlanData, supportEmail } = props;
  const [showFallback, setShowFallback] = useState(false);

  const subject = encodeURIComponent(`Plan Upgrade Request – ${selectedPlanData.name}`);
  const body = encodeURIComponent(
    `Upgrade Request Details
-------------------------
Plan: ${selectedPlanData.name}

Message:
Please proceed with the upgrade process at your earliest convenience.

Thank you`,
  );

  const mailtoLink = `mailto:${supportEmail}?subject=${subject}&body=${body}`;

  return (
    <div className="space-y-4 border-t px-2 pt-4">
      <h4 className="text-sm font-semibold text-gray-900">Request Upgrade for {selectedPlanData.name}</h4>

      <p className="text-sm text-gray-600">
        You selected the <span className="text-primary font-medium">{selectedPlanData.name}</span> plan. Request an
        upgrade using the button below.
      </p>

      <a href={mailtoLink}>
        <Button className="flex w-full items-center gap-2">
          <Mail className="h-4 w-4" /> Request Upgrade
        </Button>
      </a>

      <button
        onClick={() => setShowFallback(!showFallback)}
        className="mt-2 w-full cursor-pointer text-xs text-gray-500 underline hover:text-gray-700"
      >
        Email button not working?
      </button>

      {showFallback && <FallbackInstructions />}

      <div className="mt-1 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p>Make sure to include your registered email in the message so we can activate your upgraded plan properly.</p>
      </div>
    </div>
  );
}

export default function PremiumUpgradeDialog() {
  const open = useUpgradeModalStore((state) => state.isOpen);
  const setOpen = useUpgradeModalStore((state) => state.setIsOpen);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const paypalEmail = "support@threadlify.io"; // Replace with your actual PayPal email

  const plans: Plan[] = [
    {
      id: "professional",
      name: "Professional",
      icon: Zap,
      price: "$100",
      period: "/month",
      scans: "Automatic scans included",
      badge: "Most Popular",
      badgeColor: "bg-primary",
      features: ["All core features included", "Automatic market scanning every other day", "Email support"],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: Building2,
      price: "Custom",
      period: "",
      scans: "Unlimited automatic scans",
      badge: "Best Value",
      badgeColor: "bg-green-500",
      features: ["All features included in the Professional plan", "Unlimited automatic scans", "Priority support"],
    },
  ];

  function handlePlanSelect(planId: string) {
    setSelectedPlan(planId);
  }

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="scrollbar-thin bg-card max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader>
          <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <CreditCard className="text-primary h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-2xl">Upgrade Your Plan</DialogTitle>
          <DialogDescription className="text-center text-base">
            Choose the plan that works best for you. All plans include automatic scans that run continuously to gather
            market data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;

              return (
                <button
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`relative rounded-lg border-2 p-5 text-left transition-all duration-300 hover:scale-[102%] ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`absolute -top-3 right-2 mb-2 w-fit rounded-lg px-2 py-1 text-xs font-semibold text-white ${plan.badgeColor}`}
                  >
                    {plan.badge}
                  </div>

                  <div className="mb-3 flex items-center gap-1">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                      <Icon className="text-primary h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                  </div>

                  <div className="mb-3">
                    <span className="text-primary text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-gray-600">{plan.period}</span>
                  </div>

                  <p className="mb-3 text-sm font-medium text-gray-700">{plan.scans}</p>

                  <ul className="space-y-1.5">
                    {plan.features.map((feature, idx) => (
                      <li key={feature} className="flex items-start gap-2 text-xs text-gray-600">
                        <Check className="text-primary mt-0.5 h-3 w-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Instructions Section - Only show when plan is selected */}
          {selectedPlan && selectedPlanData && (
            <RequestEmail selectedPlanData={selectedPlanData} supportEmail={paypalEmail} />
          )}

          {!selectedPlan && (
            <div className="py-4 text-center text-sm text-gray-500">
              Select a plan above to see payment instructions
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
