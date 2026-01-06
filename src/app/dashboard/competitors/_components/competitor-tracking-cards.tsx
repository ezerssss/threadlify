"use client";

import { useState, useMemo } from "react";

import * as LucideIcons from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";

import { CompetitorCard } from "./competitor-card";
import { COMPETITOR_CATEGORIES } from "./competitor-categories";
import CompetitorModal from "./competitor-modal";
import { CompetitorsSkeleton } from "./competitors-skeleton";
import { EmptyCompetitors } from "./empty-competitors";
import { mockCompetitorData } from "./mock-competitor-data";

export function CompetitorTrackingCards() {
  const [competitors] = useState(mockCompetitorData);
  const [sort, setSort] = useState<"posts" | "az" | "za">("posts");
  const [open, setOpen] = useState(false);
  const [currentCompetitor, setCurrentCompetitor] = useState<(typeof mockCompetitorData)[0] | null>(null);
  const [isLoading] = useState(false);

  // Group by competitor name
  const groupedCompetitors = useMemo(() => {
    const grouped = competitors.reduce(
      (acc, item) => {
        if (!acc[item.competitorName]) {
          acc[item.competitorName] = [];
        }
        acc[item.competitorName].push(item);
        return acc;
      },
      {} as Record<string, typeof competitors>,
    );

    // Sort competitors by name or total posts
    const sortedGroups = Object.entries(grouped).sort(([nameA, itemsA], [nameB, itemsB]) => {
      if (sort === "posts") {
        const totalA = itemsA.reduce((sum, item) => sum + item.numPosts, 0);
        const totalB = itemsB.reduce((sum, item) => sum + item.numPosts, 0);
        return totalB - totalA;
      }
      if (sort === "az") return nameA.localeCompare(nameB);
      if (sort === "za") return nameB.localeCompare(nameA);
      return 0;
    });

    // Sort items within each group
    sortedGroups.forEach(([, items]) => {
      items.sort((a, b) => {
        if (sort === "posts") return b.numPosts - a.numPosts;
        return 0;
      });
    });

    return sortedGroups;
  }, [competitors, sort]);

  const totalInsights = competitors.length;

  if (isLoading) {
    return <CompetitorsSkeleton />;
  }

  return (
    <>
      {competitors.length > 0 && (
        <section className="space-y-1">
          <h1 className="text-primary text-xl font-bold">Competitor Tracking</h1>
          <p className="text-sm text-gray-500">
            Insights about your competitors based on market conversations, including what they&apos;re doing, market
            demands, and pain points.
          </p>
        </section>
      )}

      <div className="flex flex-col gap-4">
        {/* Top Controls */}
        {competitors.length > 0 && (
          <div className="flex items-center justify-between">
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v as any);
              }}
            >
              <div className="flex w-full justify-end">
                <SelectTrigger className="border-0 shadow-none">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
              </div>

              <SelectContent>
                <SelectItem value="posts">Most Referenced</SelectItem>
                <SelectItem value="az">A → Z</SelectItem>
                <SelectItem value="za">Z → A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {competitors.length < 1 && <EmptyCompetitors />}

        {/* Grouped Competitors */}
        <div className="space-y-6">
          {groupedCompetitors.map(([competitorName, items]) => {
            const totalPosts = items.reduce((sum, item) => sum + item.numPosts, 0);

            return (
              <div key={competitorName} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-foreground text-lg font-semibold">{competitorName}</h2>
                    <Badge variant="secondary">{items.length} insights</Badge>
                    <Badge variant="outline">{totalPosts} total posts</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => {
                    const category = COMPETITOR_CATEGORIES[item.category];
                    const Icon = category?.icon ?? "Users";

                    return (
                      <CompetitorCard
                        key={item.id}
                        categoryLabel={category?.label || "Competitor Insight"}
                        categoryColor={category?.color || "blue"}
                        iconName={Icon as keyof typeof LucideIcons}
                        competitorName={item.competitorName}
                        title={item.title}
                        posts={item.numPosts}
                        onClick={() => {
                          setCurrentCompetitor(item);
                          setOpen(true);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {currentCompetitor && (
        <CompetitorModal
          open={open}
          competitor={currentCompetitor}
          onOpenChange={setOpen}
          iconName={COMPETITOR_CATEGORIES[currentCompetitor.category].icon as keyof typeof LucideIcons}
          categoryColor={COMPETITOR_CATEGORIES[currentCompetitor.category].color}
          categoryLabel={COMPETITOR_CATEGORIES[currentCompetitor.category].label}
        />
      )}
    </>
  );
}
