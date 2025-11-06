"use client";

import { useEffect, useState } from "react";

import ky from "ky";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
  const { monthlyQuota, usedThisPeriod } = subscription;
  const remainingScans = monthlyQuota - usedThisPeriod;

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
      <Button
        disabled={isDisabled || remainingScans < 1}
        onClick={handleScanMarket}
        className={cn(isScanning && "animate-pulse")}
      >
        {isScanning ? "Scan in progress" : "Perform scan"}
      </Button>
    </>
  );
}

export default ScanActionButtons;
