"use client";

import { ExternalLink } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes, useState } from "react";
import Markdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { SignalType } from "@/types/signal";

interface SignalModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly signal: SignalType | null;
  readonly iconName: keyof typeof LucideIcons;
  readonly lensColor: string;
  readonly lensLabel: string;
}

const INITIAL_QUOTES_VISIBLE = 5;

export default function SignalModal(props: SignalModalProps) {
  const { open, onOpenChange, signal, iconName, lensColor, lensLabel } = props;

  const Icon =
    (LucideIcons[iconName] as ForwardRefExoticComponent<
      Omit<LucideIcons.LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >) ?? LucideIcons.Lightbulb;

  const [showAllQuotes, setShowAllQuotes] = useState(false);

  if (!signal) return null;

  const quotesToShow = showAllQuotes ? signal.quotes : signal.quotes.slice(0, INITIAL_QUOTES_VISIBLE);
  const hasMoreQuotes = signal.quotes.length > INITIAL_QUOTES_VISIBLE;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-w-2xl min-w-[90%] p-0 sm:min-w-[60%]">
        <DialogHeader className="px-6 pt-5">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color: lensColor }} />
            <p className="text-sm" style={{ color: lensColor }}>
              {lensLabel}
            </p>
          </div>
          <DialogTitle className="text-left text-xl">{signal.title}</DialogTitle>
        </DialogHeader>

        <div className="scrollbar-thin max-h-[70vh] space-y-4 overflow-y-auto px-6 pb-6">
          <div className="text-muted-foreground text-sm">
            <Markdown>{signal.description}</Markdown>
          </div>

          <p className="text-muted-foreground text-xs">
            Supported by <span className="text-foreground font-medium">{signal.count}</span> posts
          </p>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Quotes</h4>
            <ul className="space-y-2">
              {quotesToShow.map((quote, i) => (
                <li key={`${signal.id}-quote-${i}`}>
                  <Card className="bg-muted/50 gap-1 border-l-4 p-3 text-sm" style={{ borderLeftColor: lensColor }}>
                    <div className="my-0 italic [&_p]:my-0 [&_p]:inline">
                      <Markdown>{`\u201C${quote.text}\u201D`}</Markdown>
                    </div>
                    <a
                      href={quote.url}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "text-muted-foreground hover:text-foreground mt-1.5 inline-flex items-center gap-1 text-xs",
                        "transition-colors hover:underline",
                      )}
                    >
                      View source
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                    </a>
                  </Card>
                </li>
              ))}
            </ul>

            {hasMoreQuotes && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground mt-1 h-7 px-0"
                onClick={() => setShowAllQuotes((prev) => !prev)}
              >
                {showAllQuotes
                  ? "Show fewer quotes"
                  : `Show ${signal.quotes.length - INITIAL_QUOTES_VISIBLE} more quotes`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
