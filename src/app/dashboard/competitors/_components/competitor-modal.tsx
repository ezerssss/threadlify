"use client";

import { ForwardRefExoticComponent, RefAttributes } from "react";

import * as LucideIcons from "lucide-react";
import { X, AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react";
import Markdown from "react-markdown";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CompetitorModalProps {
  open: boolean;
  competitor: {
    id: string;
    competitorName: string;
    title: string;
    whatTheMarketTellsUs: string;
    whyItMatters: string;
    marketDemands: string[];
    painPoints: string[];
    numPosts: number;
  };
  onOpenChange: (open: boolean) => void;
  iconName: keyof typeof LucideIcons;
  categoryColor: string;
  categoryLabel: string;
}

export default function CompetitorModal(props: CompetitorModalProps) {
  const { open, competitor, onOpenChange, iconName, categoryColor, categoryLabel } = props;

  const Icon =
    (LucideIcons[iconName] as ForwardRefExoticComponent<
      Omit<LucideIcons.LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >) ?? LucideIcons.Users;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card min-w-[60%] p-0">
        <DialogHeader hidden>
          <DialogTitle hidden>{competitor.title}</DialogTitle>
        </DialogHeader>

        <div className="flex h-[90vh] flex-col px-6 py-5">
          <section className="mb-3 flex items-center gap-2">
            <Icon className="h-4 w-4" style={{ color: categoryColor }} />
            <p className="text-sm" style={{ color: categoryColor }}>
              {categoryLabel}
            </p>
          </section>

          <div className="mb-2">
            <Badge variant="secondary" className="mb-2">
              {competitor.competitorName}
            </Badge>
            <h1 className="mb-3 text-2xl leading-tight font-bold">{competitor.title}</h1>
          </div>

          <hr />

          <div className="scrollbar-thin flex h-full flex-1 flex-col overflow-y-auto pr-4">
            <Accordion type="multiple" defaultValue={["what", "demands", "pain"]} className="space-y-2">
              {/* WHAT THE MARKET TELLS US */}
              <AccordionItem value="what">
                <AccordionTrigger className="ring-0!">What the market is telling us</AccordionTrigger>
                <AccordionContent>
                  <Card className="p-3">
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_li]:my-1 [&_ol]:my-2 [&_p]:my-2 [&_ul]:my-2">
                      <Markdown>{competitor.whatTheMarketTellsUs}</Markdown>
                    </div>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* WHY IT MATTERS */}
              <AccordionItem value="why">
                <AccordionTrigger className="ring-0!">Why this matters</AccordionTrigger>
                <AccordionContent>
                  <Card className="p-3">
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_li]:my-1 [&_ol]:my-2 [&_p]:my-2 [&_ul]:my-2">
                      <Markdown>{competitor.whyItMatters}</Markdown>
                    </div>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* MARKET DEMANDS */}
              <AccordionItem value="demands">
                <AccordionTrigger className="ring-0!">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Market Demands
                    <Badge variant="secondary">{competitor.marketDemands.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {competitor.marketDemands.map((demand, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-lg p-2 hover:bg-gray-200/30">
                        <TrendingUp className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                        <span className="text-sm leading-relaxed">{demand}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* PAIN POINTS */}
              <AccordionItem value="pain">
                <AccordionTrigger className="ring-0!">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Pain Points
                    <Badge variant="secondary">{competitor.painPoints.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {competitor.painPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-lg p-2 hover:bg-gray-200/30">
                        <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                        <span className="text-sm leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* REFERENCED POSTS */}
              <AccordionItem value="posts">
                <AccordionTrigger className="ring-0!">
                  <div className="flex items-center gap-2">
                    Referenced posts
                    <Badge variant="secondary">{competitor.numPosts}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="bg-muted/50 p-4">
                    <p className="text-muted-foreground text-sm">
                      This insight is based on {competitor.numPosts} posts from the market that mention{" "}
                      <span className="font-semibold">{competitor.competitorName}</span> in relation to this topic.
                    </p>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
