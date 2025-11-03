"use client";

import Link from "next/link";

import { EditIcon, InfoIcon, LinkIcon } from "lucide-react";
import { siFacebook, siReddit, siX } from "simple-icons";
import { parse } from "tldts";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useUser from "@/hooks/use-user";

import { AccountOverViewSkeleton } from "./skeleton/account-overview-skeleton";

const recentPayments = [
  {
    id: 1,
    icon: siReddit,
    title: "Reddit",
    subtitle: "Scanned relevant subreddits",
    amount: 19,
    date: "Jul 8",
  },
  {
    id: 2,
    icon: siX,
    title: "X",
    subtitle: "1 year worth of posts scanned and analyzed",
    amount: 84,
    date: "Jul 7",
  },
  {
    id: 3,
    icon: siReddit,
    title: "Reddit",
    subtitle: "1 year worth of posts scanned and analyzed",
    amount: 160,
    date: "Jul 4",
  },
  {
    id: 4,
    icon: siFacebook,
    title: "Facebook",
    subtitle: "1 year worth of posts scanned and analyzed",
    amount: 340,
    date: "Jul 4",
  },
];

export function AccountOverview() {
  const { userData } = useUser();

  if (!userData?.profile) {
    return <AccountOverViewSkeleton />;
  }

  const { name, url, profile, strategy, subscription, totalScans } = userData;
  const { monthlyQuota, usedThisPeriod } = subscription;
  const remainingScans = monthlyQuota - usedThisPeriod;

  const parsedUrl = parse(url).domain;

  return (
    <Card className="overflow-hidden shadow-xs">
      <CardHeader className="items-center">
        <CardTitle>My Profile</CardTitle>
        <CardDescription>
          Your auto-generated profile, growth strategy, and other relevant information in one view.
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <Button size="icon" variant="outline">
            <EditIcon className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-primary text-primary-foreground relative w-full space-y-2 overflow-hidden rounded-xl p-4 perspective-distant">
            <div className="space-y-1">
              <p className="font-bold">{name}</p>
              <p className="text-sm text-pretty">{profile.description}</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="font-bold">Growth Strategy</p>
              <p className="text-sm text-pretty">{strategy}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Website URL</span>
              <Link href={url} target="_blank" className="flex items-center gap-1 font-medium tabular-nums">
                <LinkIcon size={14} className="text-muted-foreground" />
                {parsedUrl}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Monthly scan limit</span>
              <span className="font-medium tabular-nums">{monthlyQuota}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                Remaining scans
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon size="14" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Scans reset at the start of each billing cycle while your paid plan is active.</p>
                  </TooltipContent>
                </Tooltip>
              </span>

              <span className="font-medium tabular-nums">{remainingScans}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total lifetime scans</span>
              <span className="font-medium tabular-nums">{totalScans}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
