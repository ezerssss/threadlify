"use client";

import * as Diff from "diff";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

interface TextDiffViewProps {
  oldText: string;
  newText: string;
  className?: string;
  /** "words" for word-level (default), "lines" for line-level */
  mode?: "words" | "lines";
}

/**
 * Renders a clean inline diff: removed parts and added parts with subtle styling.
 */
export function TextDiffView({ oldText, newText, className, mode = "words" }: TextDiffViewProps) {
  const changes = useMemo(() => {
    if (mode === "lines") {
      return Diff.diffLines(oldText, newText);
    }
    return Diff.diffWords(oldText, newText);
  }, [oldText, newText, mode]);

  return (
    <figure
      className={cn("border-border bg-muted/30 rounded-md border p-3 font-mono text-sm leading-relaxed", className)}
      aria-label="Text diff"
    >
      {changes.map((part, index) => {
        if (part.added) {
          return (
            <span
              key={index}
              className="rounded bg-emerald-500/20 text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-200"
            >
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span
              key={index}
              className="rounded bg-red-500/20 text-red-800 line-through dark:bg-red-500/25 dark:text-red-200"
            >
              {part.value}
            </span>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </figure>
  );
}

interface SideBySideDiffProps {
  oldText: string;
  newText: string;
  oldLabel?: string;
  newLabel?: string;
  className?: string;
}

/**
 * Side-by-side before/after view. Only the changed parts are highlighted (word-level),
 * so e.g. a one-letter change doesn’t turn the whole line red/green.
 */
export function SideBySideDiff({
  oldText,
  newText,
  oldLabel = "Current",
  newLabel = "Proposed",
  className,
}: SideBySideDiffProps) {
  const changes = useMemo(() => Diff.diffWords(oldText, newText), [oldText, newText]);

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{oldLabel}</p>
        <div className="border-border bg-muted/20 rounded-md border p-3 font-mono text-sm leading-relaxed">
          {changes.map((part, index) =>
            part.removed ? (
              <span key={index} className="rounded bg-red-500/20 text-red-800 dark:bg-red-500/25 dark:text-red-200">
                {part.value}
              </span>
            ) : part.added ? null : (
              <span key={index}>{part.value}</span>
            ),
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{newLabel}</p>
        <div className="border-border bg-muted/20 rounded-md border p-3 font-mono text-sm leading-relaxed">
          {changes.map((part, index) =>
            part.added ? (
              <span
                key={index}
                className="rounded bg-emerald-500/20 text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-200"
              >
                {part.value}
              </span>
            ) : part.removed ? null : (
              <span key={index}>{part.value}</span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
