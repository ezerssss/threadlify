"use client";

import { SparklesIcon } from "lucide-react";

import useUser from "@/hooks/use-user";

export function ProgressIndicator() {
  const { userData } = useUser();

  if (!userData?.processStatus) {
    return null;
  }

  return (
    <div className="flex animate-pulse items-center gap-2 text-sm font-medium">
      <div className="animate-gradient from-primary to-primary flex items-center gap-2 bg-gradient-to-r via-red-500 bg-clip-text text-transparent">
        <SparklesIcon className="text-primary h-4 w-4" />
        <span>Running</span>
      </div>
      <p> ·</p>
      <span className="text-muted-foreground">{userData.processStatus}</span>
    </div>
  );
}
