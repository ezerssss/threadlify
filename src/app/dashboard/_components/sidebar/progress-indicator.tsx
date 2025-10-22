"use client";

import { CogIcon } from "lucide-react";

import useUser from "@/hooks/use-user";

export function ProgressIndicator() {
  const { userData } = useUser();

  if (!userData?.processStatus) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <CogIcon className="animate-spin-slow h-4 w-4 text-purple-500" />
      <span className="animate-gradient bg-gradient-to-r from-purple-400 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
        Running
      </span>
      <p> ·</p>
      <span className="text-muted-foreground animate-light-pulse">{userData.processStatus}</span>
    </div>
  );
}
