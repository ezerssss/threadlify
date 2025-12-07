// components/SortByButton.tsx
import * as React from "react";

import { ArrowUpDown, Check, ChevronDown, ChevronsUpDownIcon, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortField = "none" | "priority" | "date";
type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

interface Props {
  value: SortState;
  disabled: boolean;
  onChange: (next: SortState) => void;
  className?: string;
}

export function SortByButton({ value, onChange, className, disabled }: Props) {
  const handleField = (field: string) => onChange({ ...value, field: field as SortField });

  const handleDir = (dir: SortDirection) => onChange({ ...value, direction: dir });

  const sorted = value.field !== "none";

  const fieldLabel = value.field === "priority" ? "Priority" : value.field === "date" ? "Date" : "Sort";

  const directionIcon =
    value.direction === "asc" ? <ChevronUp className="m-0 h-2 w-2" /> : <ChevronDown className="m-0 h-2 w-2" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={`flex h-7 items-center gap-1 rounded-xl px-1 py-0.5 text-xs focus:ring-0! focus:outline-none! ${className}`}
        >
          {!sorted ? <ChevronsUpDownIcon className="m-0 h-2 w-2" /> : directionIcon}

          <span>{fieldLabel}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40 rounded-lg py-1">
        <DropdownMenuLabel className="text-muted-foreground text-[10px]">Field</DropdownMenuLabel>

        <DropdownMenuRadioGroup value={value.field} onValueChange={handleField}>
          <DropdownMenuRadioItem value="none" className="py-1 text-xs">
            None
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="priority" className="py-1 text-xs">
            Priority
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="date" className="py-1 text-xs">
            Date
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        {sorted && (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-muted-foreground text-[10px]">Direction</DropdownMenuLabel>

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleDir("asc");
              }}
              className="flex justify-between py-1 text-xs"
            >
              Ascending
              {value.direction === "asc" && <Check className="h-3 w-3" />}
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleDir("desc");
              }}
              className="flex justify-between py-1 text-xs"
            >
              Descending
              {value.direction === "desc" && <Check className="h-3 w-3" />}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
