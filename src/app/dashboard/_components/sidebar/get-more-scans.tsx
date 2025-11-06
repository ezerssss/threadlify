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

interface ManualEmailProps {
  selectedPlanData: Plan;
  paypalEmail: string;
}

function ManualEmail(props: ManualEmailProps) {
  const { selectedPlanData, paypalEmail } = props;
  const [copied, setCopied] = useState<boolean>(false);

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(paypalEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  return (
    <div className="space-y-4 border-t px-2 pt-4">
      <h4 className="text-sm font-semibold text-gray-900">How to upgrade to {selectedPlanData.name}:</h4>

      <div className="space-y-4 text-sm text-gray-600">
        <div className="flex gap-3">
          <div className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
            1
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Send payment via PayPal</p>
            <p className="mt-1 mb-2 text-xs">
              Amount:{" "}
              <span className="text-primary font-semibold">
                {selectedPlanData.price}
                {selectedPlanData.period}
              </span>
            </p>
            <div className="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 p-2">
              <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <code className="flex-1 text-xs break-all">{paypalEmail}</code>
              <button
                onClick={handleCopyEmail}
                className="flex-shrink-0 rounded p-1 transition-colors hover:bg-gray-200"
                title="Copy email"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
            2
          </div>
          <div>
            <p className="font-medium text-gray-900">Email us your receipt</p>
            <p className="mt-1 text-xs">
              Send your PayPal receipt and the email you used for registration to{" "}
              <span className="text-primary font-medium">{paypalEmail}</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Include: Plan name ({selectedPlanData.name}), your registered email, and payment screenshot
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
            3
          </div>
          <div>
            <p className="font-medium text-gray-900">Get activated within 24 hours</p>
            <p className="mt-1 text-xs">We&apos;ll upgrade your account and send you a confirmation email</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs text-amber-800">
          <span className="font-semibold">Important:</span> Make sure to specify which plan you&apos;re purchasing and
          include your registered email address so we can activate your account correctly.
        </p>
      </div>
    </div>
  );
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

  const subject = encodeURIComponent(`Upgrade Request: ${selectedPlanData.name} Plan`);
  const body = encodeURIComponent(
    `Hello Threadlify Team,


I would like to request an upgrade to the ${selectedPlanData.name} plan.


Account email: <ENTER YOUR REGISTERED EMAIL>
Selected plan: ${selectedPlanData.name}


Please let me know the next steps to proceed with the upgrade. Thank you.


Best regards,
<YOUR NAME>`,
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
  const [open, setOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const paypalEmail = "support@threadlify.io"; // Replace with your actual PayPal email

  const plans: Plan[] = [
    {
      id: "professional",
      name: "Professional",
      icon: Zap,
      originalPrice: "$100",
      price: "$50",
      period: "/month",
      scans: "20 scans per month",
      badge: "Limited Offer",
      badgeColor: "bg-green-500",
      features: ["All core features included", "Email support", "Discount available for the first 20 customers only"],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: Building2,
      price: "Custom",
      period: "",
      scans: "Unlimited scans",
      badge: "Most Popular",
      badgeColor: "bg-primary",
      features: ["All features included in the Professional plan", "Unlimited monthly scans", "Priority support"],
    },
  ];

  function handlePlanSelect(planId: string) {
    setSelectedPlan(planId);
  }

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Get More Scans</Button>
        </DialogTrigger>

        <DialogContent className="scrollbar-thin bg-card max-h-[90vh] overflow-y-auto p-4">
          <DialogHeader>
            <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <CreditCard className="text-primary h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-2xl">Upgrade Your Plan</DialogTitle>
            <DialogDescription className="text-center text-base">
              Choose the plan that works best for you
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
                      {plan.originalPrice && (
                        <span className="mr-2 text-sm text-gray-400 line-through">{plan.originalPrice}</span>
                      )}
                      <span className="text-primary text-3xl font-bold">{plan.price}</span>
                      <span className="text-sm text-gray-600">{plan.period}</span>
                    </div>

                    <p className="mb-3 text-sm font-medium text-gray-700">{plan.scans}</p>

                    <ul className="space-y-1.5">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
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
    </div>
  );
}
