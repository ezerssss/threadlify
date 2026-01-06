// components/StatusSelectButton.tsx
import * as React from "react";

import { ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  value: string;
  onChange: (status: string) => void;
  className?: string;
}

const statusLabels: Record<string, string> = {
  new: "New",
  inProgress: "In Progress",
  done: "Done",
};

const COLUMN_COLOR: Record<string, string> = { new: "bg-green-500", inProgress: "bg-yellow-500", done: "bg-gray-400" };

export function StatusSelectButton({ value, onChange, className }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={`h-6.5 items-center gap-1.5 rounded-sm border px-1.5! text-xs focus:ring-0! focus:outline-none! ${className} `}
        >
          <div className={twMerge("h-2 w-2 rounded-full", COLUMN_COLOR[value])} />
          <span>{statusLabels[value]}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40 rounded-lg py-1">
        {/* New */}
        <DropdownMenuItem onSelect={() => onChange("new")} className="flex items-center gap-2 py-1 text-xs">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          New
        </DropdownMenuItem>

        {/* In Progress */}
        <DropdownMenuItem onSelect={() => onChange("inProgress")} className="flex items-center gap-2 py-1 text-xs">
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          In Progress
        </DropdownMenuItem>

        {/* Done */}
        <DropdownMenuItem onSelect={() => onChange("done")} className="flex items-center gap-2 py-1 text-xs">
          <div className="h-2 w-2 rounded-full bg-gray-400" />
          Done
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
