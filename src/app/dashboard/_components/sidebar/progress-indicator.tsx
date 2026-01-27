"use client";

import { SparklesIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useUser from "@/hooks/use-user";

export function ProgressIndicator() {
  const { userData } = useUser();

  if (!userData?.processStatus || Object.keys(userData.processStatus).length === 0) {
    return null;
  }

  const statusEntries = Object.entries(userData.processStatus);
  const statusCount = statusEntries.length;
  const firstStatus = statusEntries[0]?.[1] || "";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex animate-pulse items-center gap-2 text-sm font-medium">
          <div className="animate-gradient from-primary to-primary flex items-center gap-2 bg-gradient-to-r via-red-500 bg-clip-text text-transparent">
            <SparklesIcon className="text-primary h-4 w-4" />
            <span>Running</span>
          </div>
          <p> ·</p>
          <span className="text-muted-foreground">
            {statusCount === 1 ? firstStatus : `${firstStatus} +${statusCount - 1} more`}
          </span>
        </div>
      </TooltipTrigger>
      {statusCount > 1 && (
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            {statusEntries.map(([id, status]) => (
              <div key={id} className="text-xs">
                {status}
              </div>
            ))}
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
