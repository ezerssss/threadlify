"use client";

import { IconBulbOff } from "@tabler/icons-react";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import useUser from "@/hooks/use-user";

export function EmptyObjectives() {
  const { userData } = useUser();

  const isProOrPremium = userData?.subscription.plan === "pro" || userData?.subscription.plan === "enterprise";

  function handleContactSupport() {
    const subject = encodeURIComponent("No Signals");
    const body = encodeURIComponent(
      `Hello Threadlify Support,

I recently upgraded to ${userData?.subscription.plan ?? "pro"} but I'm still not seeing any market signals.

Could you please help me troubleshoot this issue?

Thank you!`,
    );
    window.location.href = `mailto:support@threadlify.io?subject=${subject}&body=${body}`;
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconBulbOff />
        </EmptyMedia>
        <EmptyTitle>No Market Signals Yet</EmptyTitle>
        <EmptyDescription>
          {isProOrPremium
            ? "We scan the market and surface recurring themes backed by 5+ posts. When we have enough, we generate a short summary per category. Market signals will appear here as we discover them."
            : "There are no market signals yet. Each signal needs 5+ supporting posts to appear."}
        </EmptyDescription>
      </EmptyHeader>
      {isProOrPremium && (
        <EmptyContent>
          <Button variant="outline" onClick={handleContactSupport}>
            <Mail className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
