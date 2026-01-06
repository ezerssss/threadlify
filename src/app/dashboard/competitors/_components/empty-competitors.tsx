"use client";

import { useEffect, useState } from "react";

import { IconEyeOff } from "@tabler/icons-react";
import ky from "ky";
import { Mail, Scan } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SCAN_REQUEST_URL } from "@/constants/url";
import useUser from "@/hooks/use-user";
import { cn, toastError } from "@/lib/utils";

// eslint-disable-next-line complexity
export function EmptyCompetitors() {
  const { userData, idToken } = useUser();
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setIsScanning(userData?.isScanning ?? false);
  }, [userData?.isScanning]);

  const isProOrPremium = userData?.subscription.plan === "pro" || userData?.subscription.plan === "enterprise";
  const { subscription } = userData ?? {};
  const remainingScans = subscription ? subscription.monthlyQuota - subscription.usedThisPeriod : 0;
  const isFreeTier = !subscription?.plan || subscription.plan === "free";
  const isButtonDisabled = isScanning || remainingScans < 1 || !subscription?.plan || subscription.plan === "free";

  // Determine tooltip message based on button state
  function getTooltipMessage(): string {
    if (isScanning) {
      return "Scan in progress...";
    }

    if (isButtonDisabled) {
      if (isFreeTier) {
        if (remainingScans > 0) {
          return "Upgrade to Pro to perform scans";
        } else {
          return "Upgrade to Pro to get more scans";
        }
      }

      // Pro/Enterprise but zero scans
      if (remainingScans < 1) {
        return "Your scans will reset at the start of your next billing cycle";
      }
    }

    // Button is enabled - show action message
    return "Click to perform a scan and gather market data";
  }

  const tooltipMessage = getTooltipMessage();

  async function handleScanMarket() {
    if (remainingScans < 1) {
      toastError("You have no scans remaining on your current plan. Please upgrade or purchase additional scans.");
      return;
    }

    if (isScanning) {
      toastError("A scan is currently in progress. Please wait for it to finish before scanning.");
      return;
    }

    try {
      setIsScanning(true);
      if (!idToken) {
        throw new Error("You are unauthorized to do this action.");
      }

      await ky.post(SCAN_REQUEST_URL, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      toastError(error);
      setIsScanning(false);
    }
  }

  function handleContactSupport() {
    const subject = encodeURIComponent("No Data After Scan - Competitor Tracking");
    const body = encodeURIComponent(
      `Hello Threadlify Support,

I recently upgraded to ${userData?.subscription.plan ?? "pro"} and performed a scan, but I'm still not seeing any competitor insights.

Could you please help me troubleshoot this issue?

Thank you!`,
    );
    window.location.href = `mailto:support@threadlify.io?subject=${subject}&body=${body}`;
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconEyeOff />
        </EmptyMedia>
        <EmptyTitle>No Competitor Insights Yet</EmptyTitle>
        <EmptyDescription>
          {isProOrPremium
            ? "Start a scan to gather market data and analyze competitor conversations."
            : "Competitor tracking insights will appear here once we analyze market conversations about your competitors."}
        </EmptyDescription>
      </EmptyHeader>
      {isProOrPremium && (
        <EmptyContent>
          <div className="flex w-full flex-col gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="w-full">
                  <Button
                    onClick={handleScanMarket}
                    disabled={isButtonDisabled}
                    className={cn(isScanning && "animate-pulse", "w-full")}
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    {isScanning ? "Scan in progress..." : "Perform scan"}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipMessage}</p>
              </TooltipContent>
            </Tooltip>
            <Button variant="outline" onClick={handleContactSupport}>
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </EmptyContent>
      )}
    </Empty>
  );
}
