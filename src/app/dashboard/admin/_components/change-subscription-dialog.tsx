"use client";

import { useState } from "react";

import ky from "ky";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ADMIN_UPDATE_SUBSCRIPTION_URL } from "@/constants/url";
import useUser from "@/hooks/use-user";
import { toastError } from "@/lib/utils";
import { UserDataType } from "@/types/user";

interface ChangeSubscriptionDialogProps {
  readonly user: UserDataType;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess: () => void;
}

const PERIOD_PRESETS = [
  { label: "1 Month", days: 30 },
  { label: "2 Months", days: 60 },
  { label: "3 Months", days: 90 },
  { label: "6 Months", days: 180 },
  { label: "1 Year", days: 365 },
  { label: "2 Years", days: 730 },
];

// eslint-disable-next-line complexity
export default function ChangeSubscriptionDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ChangeSubscriptionDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro" | "enterprise">(user.subscription.plan);
  const [autoRenew, setAutoRenew] = useState(user.subscription.autoRenew);
  const [periodPreset, setPeriodPreset] = useState<string>("30");
  const [customDays, setCustomDays] = useState<string>("");
  const [doScanNow, setDoScanNow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { idToken } = useUser();

  const isCustomPeriod = periodPreset === "custom";
  const periodDays = isCustomPeriod ? customDays : periodPreset;

  async function handleUpdateSubscription() {
    if (!idToken) {
      toast.error("You are not authorized to perform this action.");
      return;
    }

    const hasChanges =
      selectedPlan !== user.subscription.plan || autoRenew !== user.subscription.autoRenew || doScanNow;

    if (!hasChanges) {
      toast.info("No changes detected.");
      return;
    }

    try {
      setIsLoading(true);

      await ky.put(ADMIN_UPDATE_SUBSCRIPTION_URL, {
        json: {
          userId: user.id,
          plan: selectedPlan,
          autoRenew,
          periodDays: Number.parseInt(periodDays, 10) || 30,
          doScanNow,
        },
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        timeout: 10000,
      });

      toast.success(`Successfully updated subscription to ${selectedPlan}.`);
      onSuccess();
    } catch (error) {
      toastError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle>Change Subscription</DialogTitle>
          <DialogDescription>
            Update the subscription plan for {user.name} ({user.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Plan</Label>
            <div className="bg-muted rounded-md border p-3">
              <p className="text-sm capitalize">{user.subscription.plan}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Status: <span className="capitalize">{user.subscription.status}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-select" className="text-sm font-medium">
              New Plan
            </Label>
            <Select
              value={selectedPlan}
              onValueChange={(value) => setSelectedPlan(value as "free" | "pro" | "enterprise")}
            >
              <SelectTrigger id="plan-select">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period-select" className="text-sm font-medium">
              Subscription Period
            </Label>
            <Select value={periodPreset} onValueChange={setPeriodPreset}>
              <SelectTrigger id="period-select">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_PRESETS.map((preset) => (
                  <SelectItem key={preset.days} value={preset.days.toString()}>
                    {preset.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {isCustomPeriod && (
              <div className="space-y-1">
                <Label htmlFor="custom-days" className="text-muted-foreground text-xs">
                  Number of days
                </Label>
                <Input
                  id="custom-days"
                  type="number"
                  min="1"
                  placeholder="Enter number of days"
                  value={customDays}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (Number.parseInt(value, 10) > 0 && Number.parseInt(value, 10) <= 10000)) {
                      setCustomDays(value);
                    }
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-renew"
              checked={autoRenew}
              onCheckedChange={(checked) => setAutoRenew(checked === true)}
            />
            <Label htmlFor="auto-renew" className="cursor-pointer text-sm font-medium">
              Auto-renew subscription
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="scan-now" checked={doScanNow} onCheckedChange={(checked) => setDoScanNow(checked === true)} />
            <Label htmlFor="scan-now" className="cursor-pointer text-sm font-medium">
              Trigger a scan now
            </Label>
          </div>

          {(selectedPlan !== user.subscription.plan || autoRenew !== user.subscription.autoRenew || doScanNow) && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                {selectedPlan !== user.subscription.plan && (
                  <>
                    Plan will change from <span className="font-medium capitalize">{user.subscription.plan}</span> to{" "}
                    <span className="font-medium capitalize">{selectedPlan}</span>.
                    <br />
                  </>
                )}
                {autoRenew !== user.subscription.autoRenew && (
                  <>
                    Auto-renew will be {autoRenew ? "enabled" : "disabled"}.
                    <br />
                  </>
                )}
                {doScanNow && (
                  <>
                    A scan will be triggered immediately after update.
                    <br />
                  </>
                )}
                Period duration:{" "}
                {isCustomPeriod
                  ? `${customDays || 0} days`
                  : (PERIOD_PRESETS.find((p) => p.days.toString() === periodDays)?.label ?? `${periodDays} days`)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateSubscription}
            disabled={
              isLoading ||
              (selectedPlan === user.subscription.plan && autoRenew === user.subscription.autoRenew && !doScanNow) ||
              (isCustomPeriod && (!customDays || Number.parseInt(customDays, 10) <= 0))
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
