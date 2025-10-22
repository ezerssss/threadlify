"use client";

import Link from "next/link";

import { EditIcon, LinkIcon } from "lucide-react";
import { siApple, siFacebook, siReddit, siX } from "simple-icons";
import { parse } from "tldts";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import useUser from "@/hooks/use-user";

function ChipSVG() {
  return (
    <svg enableBackground="new 0 0 132 92" viewBox="0 0 132 92" xmlns="http://www.w3.org/2000/svg" className="w-14">
      <title>Chip</title>
      <rect x="0.5" y="0.5" width="131" height="91" rx="15" className="fill-accent stroke-accent" />
      <rect x="9.5" y="9.5" width="48" height="21" rx="10.5" className="fill-accent stroke-accent-foreground" />
      <rect x="9.5" y="61.5" width="48" height="21" rx="10.5" className="fill-accent stroke-accent-foreground" />
      <rect x="9.5" y="35.5" width="48" height="21" rx="10.5" className="fill-accent stroke-accent-foreground" />
      <rect x="74.5" y="9.5" width="48" height="21" rx="10.5" className="fill-accent stroke-accent-foreground" />
      <rect x="74.5" y="61.5" width="48" height="21" rx="10.5" className="fill-accent stroke-accent-foreground" />
      <rect x="74.5" y="35.5" width="48" height="21" rx="10.5" className="fill-accent stroke-accent-foreground" />
    </svg>
  );
}

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

  if (!userData) {
    return null;
  }

  const { name, url, profile, strategy } = userData;

  const parsedUrl = parse(url).domain;

  return (
    <Card className="shadow-xs">
      <CardHeader className="items-center">
        <CardTitle>My Profile</CardTitle>
        <CardDescription>
          Your auto-generated profile, growth strategy, and other relevant information in one view.
        </CardDescription>
        <CardAction>
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
              <span className="text-muted-foreground">Remaining scans</span>
              <span className="font-medium tabular-nums">4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total scans</span>
              <span className="font-medium tabular-nums">1</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" size="sm">
              Buy more scans
            </Button>
            <Button className="flex-1" variant="outline" size="sm">
              Set Limit
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h6 className="text-muted-foreground text-sm uppercase">Recent Scans</h6>

            <div className="space-y-4">
              {recentPayments.map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-2">
                  <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
                    <SimpleIcon icon={transaction.icon} className="size-5" />
                  </div>
                  <div className="flex w-full items-end justify-between">
                    <div>
                      <p className="text-sm font-medium">{transaction.title}</p>
                      <p className="text-muted-foreground line-clamp-1 text-xs">{transaction.subtitle}</p>
                    </div>
                    <div>
                      <span className="text-sm leading-none font-medium tabular-nums">{transaction.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full" size="sm" variant="outline">
              View All Payments
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
