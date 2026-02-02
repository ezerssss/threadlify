"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PriorityBadgeProps {
  priority: string;
  reasons?: string[];
  className?: string;
}

export function PriorityBadge({ priority, reasons, className }: PriorityBadgeProps) {
  const notHighPriorityBadgeColor = priority === "medium" ? "default" : "secondary";
  const badgeColor = priority === "high" ? "destructive" : notHighPriorityBadgeColor;

  const badge = (
    <Badge variant={badgeColor} className={className}>
      {priority}
    </Badge>
  );

  const hasReasons = reasons && reasons.length > 0;

  if (hasReasons) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px]">
          <p className="mb-1.5 font-medium">Why {priority}?</p>
          <ul className="text-muted-foreground list-inside list-disc space-y-0.5">
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
}
