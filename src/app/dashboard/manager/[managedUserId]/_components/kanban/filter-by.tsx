// components/FilterButton.tsx
import * as React from "react";

import { Filter, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // ← real shadcn checkbox
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type PriorityFilter = "high" | "medium" | "low";
export type ActionFilter = "engage" | "listen";
export type ReadStatusFilter = "read" | "unread";

export interface FilterState {
  priority: PriorityFilter[];
  action: ActionFilter[];
  seenStatus: ReadStatusFilter[];
}

interface Props {
  value: FilterState;
  disabled?: boolean;
  className?: string;
  onChange: (next: FilterState) => void;
}

export function FilterButton({ value, onChange, disabled, className }: Props) {
  const { priority, action, seenStatus } = value;

  const toggle = <T extends string>(list: T[], setter: (l: T[]) => void, item: T) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const setPriority = (p: PriorityFilter[]) => onChange({ ...value, priority: p });

  const setAction = (a: ActionFilter[]) => onChange({ ...value, action: a });

  const setSeenStatus = (s: ReadStatusFilter[]) => onChange({ ...value, seenStatus: s });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={`flex h-7 items-center gap-1 rounded-xl px-1 py-0.5 text-xs ${className}`}
        >
          <Filter className="m-0 h-3 w-3" />
          <span>Filter</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 rounded-lg py-1">
        {/* PRIORITY SECTION */}
        <DropdownMenuLabel className="text-muted-foreground text-[10px]">Priority</DropdownMenuLabel>

        <div className="flex flex-col gap-1 px-2 py-1">
          {(["high", "medium", "low"] as PriorityFilter[]).map((p) => (
            <label key={p} className="flex cursor-pointer items-center gap-2 text-xs">
              <Checkbox checked={priority.includes(p)} onCheckedChange={() => toggle(priority, setPriority, p)} />
              <span className="capitalize">{p}</span>
            </label>
          ))}
        </div>

        <DropdownMenuSeparator />

        {/* ACTION SECTION */}
        <DropdownMenuLabel className="text-muted-foreground text-[10px]">Action</DropdownMenuLabel>

        <div className="flex flex-col gap-1 px-2 py-1">
          {(["engage", "listen"] as ActionFilter[]).map((a) => (
            <label key={a} className="flex cursor-pointer items-center gap-2 text-xs">
              <Checkbox checked={action.includes(a)} onCheckedChange={() => toggle(action, setAction, a)} />
              <span className="capitalize">{a}</span>
            </label>
          ))}
        </div>

        <DropdownMenuSeparator />

        {/* READ STATUS SECTION */}
        <DropdownMenuLabel className="text-muted-foreground text-[10px]">Read Status</DropdownMenuLabel>

        <div className="flex flex-col gap-1 px-2 py-1">
          {(["read", "unread"] as ReadStatusFilter[]).map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-2 text-xs">
              <Checkbox checked={seenStatus.includes(s)} onCheckedChange={() => toggle(seenStatus, setSeenStatus, s)} />
              <span className="capitalize">{s}</span>
            </label>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
