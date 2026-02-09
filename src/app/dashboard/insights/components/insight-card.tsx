"use client";

import * as LucideIcons from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import Markdown from "react-markdown";

import { Card } from "@/components/ui/card";
import type { SignalType } from "@/types/signal";

interface InsightCardProps {
  readonly signal: SignalType;
  readonly lensLabel: string;
  readonly lensColor: string;
  readonly iconName: keyof typeof LucideIcons;
  readonly onClick?: () => void;
}

export function InsightCard({ signal, lensLabel, lensColor, iconName, onClick }: InsightCardProps) {
  const Icon =
    (LucideIcons[iconName] as ForwardRefExoticComponent<
      Omit<LucideIcons.LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >) ?? LucideIcons.Lightbulb;

  return (
    <Card
      className="bg-card hover:border-primary flex w-full cursor-pointer flex-col gap-2 rounded-xl p-4 shadow-sm transition-all"
      onClick={onClick}
    >
      <div className="text-muted-foreground flex items-center gap-1 text-xs">
        <Icon style={{ color: lensColor }} className="h-3 w-3" />
        <p style={{ color: lensColor }}>{lensLabel}</p>
      </div>

      <div className="flex-1 space-y-2">
        <div className="leading-tight font-semibold">
          <Markdown>{signal.title}</Markdown>
        </div>
        {signal.quotes.length > 0 && (
          <div className="text-muted-foreground line-clamp-2 text-xs italic">
            <Markdown>{`"${signal.quotes[0].text}${signal.quotes.length > 1 ? "…" : ""}"`}</Markdown>
          </div>
        )}
      </div>

      <p className="text-muted-foreground mt-1 text-xs">
        Supported by <span className="font-medium">{signal.count}</span> posts
      </p>
    </Card>
  );
}
