"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { IconArticle, IconHammer } from "@tabler/icons-react";
import ky from "ky";
import { Mail, Scan } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SCAN_REQUEST_URL } from "@/constants/url";
import useUser from "@/hooks/use-user";
import { cn, toastError } from "@/lib/utils";

// eslint-disable-next-line complexity
export default function EmptyKanban() {
  const router = useRouter();
  const { userData, idToken } = useUser();
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setIsScanning(userData?.isScanning ?? false);
  }, [userData?.isScanning]);

  function handleClick() {
    router.push("/dashboard/profile");
  }

  const isProfileGenerated = !!userData?.profile;
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
    const subject = encodeURIComponent("No Data After Scan - Kanban");
    const body = encodeURIComponent(
      `Hello Threadlify Support,

I recently upgraded to ${userData?.subscription.plan ?? "pro"} and performed a scan, but I'm still not seeing any data in my Kanban board.

Could you please help me troubleshoot this issue?

Thank you!`,
    );
    window.location.href = `mailto:support@threadlify.io?subject=${subject}&body=${body}`;
  }

  const icon = isProfileGenerated ? <IconArticle /> : <IconHammer />;
  const title = isProfileGenerated ? "No relevant posts yet" : "We're still building your profile";
  const content = isProfileGenerated
    ? isProOrPremium
      ? "Start a scan to gather market data and populate your kanban board with relevant posts."
      : "New items will appear here automatically once we spot something useful."
    : "Your dashboard will start filling in as soon as everything is ready. This should not take too long.";

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{content}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {isProOrPremium ? (
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
        ) : (
          <Button onClick={handleClick}>View Profile</Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
