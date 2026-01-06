"use client";

import { useEffect, useState } from "react";

import ky from "ky";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SCAN_REQUEST_URL } from "@/constants/url";
import useUser from "@/hooks/use-user";
import { cn, toastError } from "@/lib/utils";

import GetMoreScans from "./get-more-scans";

function ScanActionButtons() {
  const { userData, idToken } = useUser();
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setIsDisabled(userData?.isScanning ?? true);
  }, [userData?.isScanning]);

  if (!userData) {
    return null;
  }

  const { subscription, isScanning } = userData;
  const { monthlyQuota, usedThisPeriod, plan } = subscription;
  const remainingScans = monthlyQuota - usedThisPeriod;
  const isFreeTier = plan === "free";
  const isButtonDisabled = isDisabled || remainingScans < 1 || isFreeTier;

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
      setIsDisabled(true);
      if (!idToken) {
        throw new Error("Your are unauthorized to do this action.");
      }

      await ky.post(SCAN_REQUEST_URL, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      toastError(error);
    }
  }

  return (
    <>
      <p className="text-sm">Scans left: {remainingScans}</p>
      <GetMoreScans />
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              disabled={isButtonDisabled}
              onClick={handleScanMarket}
              className={cn(isScanning && "animate-pulse")}
            >
              {isScanning ? "Scan in progress" : "Perform scan"}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}

export default ScanActionButtons;
