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
    const subject = encodeURIComponent("No Insights");
    const body = encodeURIComponent(
      `Hello Threadlify Support,

I recently upgraded to ${userData?.subscription.plan ?? "pro"} but I'm still not seeing any insights.

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
        <EmptyTitle>No Insights Yet</EmptyTitle>
        <EmptyDescription>
          {isProOrPremium
            ? "We automatically scan the market to gather data and generate actionable insights from real user posts. Insights will appear here as we discover them."
            : "There are no insights yet. Please wait until data is captured from real user posts."}
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
