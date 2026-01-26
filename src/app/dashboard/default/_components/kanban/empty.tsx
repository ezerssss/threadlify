"use client";

import { useRouter } from "next/navigation";

import { IconArticle, IconHammer } from "@tabler/icons-react";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import useUser from "@/hooks/use-user";

export default function EmptyKanban() {
  const router = useRouter();
  const { userData } = useUser();

  function handleClick() {
    router.push("/dashboard/profile");
  }

  const isProfileGenerated = !!userData?.profile;
  const isProOrPremium = userData?.subscription.plan === "pro" || userData?.subscription.plan === "enterprise";

  function handleContactSupport() {
    const subject = encodeURIComponent("No Data in Kanban - Kanban");
    const body = encodeURIComponent(
      `Hello Threadlify Support,

I recently upgraded to ${userData?.subscription.plan ?? "pro"} but I'm still not seeing any data in my Kanban board.

Could you please help me troubleshoot this issue?

Thank you!`,
    );
    window.location.href = `mailto:support@threadlify.io?subject=${subject}&body=${body}`;
  }

  const icon = isProfileGenerated ? <IconArticle /> : <IconHammer />;
  const title = isProfileGenerated ? "No relevant posts yet" : "We're still building your profile";
  const content = isProfileGenerated
    ? isProOrPremium
      ? "We automatically scan the market to gather data and populate your kanban board with relevant posts. New items will appear here as we discover them."
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
          <Button variant="outline" onClick={handleContactSupport}>
            <Mail className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        ) : (
          <Button onClick={handleClick}>View Profile</Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
