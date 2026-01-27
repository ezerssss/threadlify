"use client";

import { useState, useMemo } from "react";

import { format } from "date-fns";
import ky from "ky";
import { Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ADMIN_EXTEND_SUBSCRIPTION_URL } from "@/constants/url";
import useUser from "@/hooks/use-user";
import { formatISODate, toastError } from "@/lib/utils";
import { UserDataType } from "@/types/user";

interface ExtendSubscriptionDialogProps {
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
export default function ExtendSubscriptionDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ExtendSubscriptionDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [periodPreset, setPeriodPreset] = useState<string>("30");
  const [customDays, setCustomDays] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { idToken } = useUser();

  const isCustomPeriod = periodPreset === "custom";
  const periodDays = isCustomPeriod ? customDays : periodPreset;

  // Calculate date from days
  const calculatedDate = useMemo(() => {
    if (!user.subscription.periodEnd) return undefined;
    const currentEndDate = new Date(user.subscription.periodEnd);
    const days = Number.parseInt(periodDays, 10) || 0;
    if (days > 0) {
      const newDate = new Date(currentEndDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    }
    return undefined;
  }, [periodDays, user.subscription.periodEnd]);

  // Calculate days from selected date
  const calculatedDays = useMemo(() => {
    if (!selectedDate || !user.subscription.periodEnd) return undefined;
    const currentEndDate = new Date(user.subscription.periodEnd);
    const diffTime = selectedDate.getTime() - currentEndDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : undefined;
  }, [selectedDate, user.subscription.periodEnd]);

  const handleDaysChange = (preset: string) => {
    setPeriodPreset(preset);
    if (preset !== "custom") {
      setCustomDays("");
      // Clear selected date when changing preset to let it recalculate
      setSelectedDate(undefined);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    // When date is selected, switch to custom and calculate days
    if (date && calculatedDays) {
      setPeriodPreset("custom");
      setCustomDays(calculatedDays.toString());
    }
  };

  const handleCustomDaysChange = (value: string) => {
    if (value === "" || (Number.parseInt(value, 10) > 0 && Number.parseInt(value, 10) <= 10000)) {
      setCustomDays(value);
      // Clear selected date when manually entering days
      setSelectedDate(undefined);
    }
  };

  const finalPeriodDays = useMemo(() => {
    if (selectedDate && calculatedDays) {
      return calculatedDays;
    }
    return Number.parseInt(periodDays, 10) || 0;
  }, [selectedDate, calculatedDays, periodDays]);

  async function handleExtendSubscription() {
    if (!idToken) {
      toast.error("You are not authorized to perform this action.");
      return;
    }

    if (finalPeriodDays <= 0) {
      toast.error("Please select a valid period or date.");
      return;
    }

    try {
      setIsLoading(true);

      await ky.post(ADMIN_EXTEND_SUBSCRIPTION_URL, {
        json: {
          userId: user.id,
          periodDays: finalPeriodDays,
        },
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        timeout: 10000,
      });

      toast.success(`Successfully extended subscription by ${finalPeriodDays} days.`);
      onSuccess();
    } catch (error) {
      toastError(error);
    } finally {
      setIsLoading(false);
    }
  }

  const currentEndDate = user.subscription.periodEnd ? new Date(user.subscription.periodEnd) : new Date();
  const newEndDate = selectedDate ?? calculatedDate ?? currentEndDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle>Extend Subscription</DialogTitle>
          <DialogDescription>
            Extend the subscription period for {user.name} ({user.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Period End</Label>
            <div className="bg-muted rounded-md border p-3">
              <p className="text-sm">
                {user.subscription.periodEnd ? formatISODate(user.subscription.periodEnd) : "Not set"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Calendar */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate || calculatedDate
                      ? format(selectedDate ?? calculatedDate ?? new Date(), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate ?? calculatedDate}
                    onSelect={handleDateChange}
                    disabled={(date) => date < currentEndDate}
                  />
                </PopoverContent>
              </Popover>
              {calculatedDays && (
                <p className="text-muted-foreground text-xs">
                  {calculatedDays} {calculatedDays === 1 ? "day" : "days"} from current end date
                </p>
              )}
            </div>

            {/* Days Input */}
            <div className="space-y-2">
              <Label htmlFor="period-select" className="text-sm font-medium">
                Extend by Days
              </Label>
              <Select value={periodPreset} onValueChange={handleDaysChange}>
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
                    onChange={(e) => handleCustomDaysChange(e.target.value)}
                  />
                </div>
              )}
              {calculatedDate && !isCustomPeriod && (
                <p className="text-muted-foreground text-xs">New end date: {format(calculatedDate, "PPP")}</p>
              )}
            </div>
          </div>

          {(selectedDate ?? Number.parseInt(periodDays, 10) > 0) && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Subscription will be extended by <span className="font-medium">{finalPeriodDays}</span>{" "}
                {finalPeriodDays === 1 ? "day" : "days"}.
                <br />
                New period end: <span className="font-medium">{format(newEndDate, "PPP")}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleExtendSubscription} disabled={isLoading || finalPeriodDays <= 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Extend Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
