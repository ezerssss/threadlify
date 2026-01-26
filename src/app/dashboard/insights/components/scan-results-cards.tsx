"use client";

import { useEffect, useState, useMemo } from "react";

import { collection, doc, onSnapshot } from "firebase/firestore";
import * as LucideIcons from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";
import { UpgradeOverlay } from "@/components/upgrade-overlay";
import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { FIREBASE_COLLECTION_ENUMS } from "@/enums/firebase";
import useUser from "@/hooks/use-user";
import { ActionableObjectivesType } from "@/types/insights";

import { EmptyObjectives } from "./empty-objectives";
import { InsightCard } from "./insight-card";
import { INSIGHT_CATEGORIES } from "./insight-categories";
import InsightModal from "./insight-modal";
import { InsightsSkeleton } from "./insights-skeleton";

// eslint-disable-next-line complexity
export function ScanResultsCards() {
  const { user, userData } = useUser();
  const [insights, setInsights] = useState<ActionableObjectivesType[]>([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"posts" | "az" | "za">("posts");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [currentObjective, setCurrentObjective] = useState<ActionableObjectivesType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const PAGE_SIZE = 9;

  // Lock content if subscription is free or expired
  const isSubscriptionLocked = userData?.subscription.plan === "free";

  // Load from Firestore (only if subscription is not locked)
  useEffect(() => {
    if (!user || !userData) {
      return;
    }

    if (isSubscriptionLocked) {
      setIsLoading(false);
      return;
    }

    const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
    const insightsCollection = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.OBJECTIVES_COLLECTION);

    const unsub = onSnapshot(insightsCollection, (snapshot) => {
      const data: ActionableObjectivesType[] = snapshot.docs.map((doc) => doc.data() as ActionableObjectivesType);
      setInsights(data);
      setIsLoading(false);
    });

    return () => unsub();
  }, [user, userData, isSubscriptionLocked]);

  // Get available categories (categories that have insights)
  const availableCategories = useMemo(() => {
    const categorySet = new Set(insights.map((insight) => insight.category));
    return Array.from(categorySet).filter((cat) => INSIGHT_CATEGORIES[cat]);
  }, [insights]);

  // Filtering and sorting logic
  const filteredAndSortedInsights = useMemo(() => {
    // First filter by category
    const filtered =
      categoryFilter === "all" ? insights : insights.filter((insight) => insight.category === categoryFilter);

    // Then sort
    return [...filtered].sort((a, b) => {
      if (sort === "posts") return b.numPosts - a.numPosts;
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "za") return b.title.localeCompare(a.title);
      return 0;
    });
  }, [insights, sort, categoryFilter]);

  // Reset category filter if selected category no longer has insights
  useEffect(() => {
    if (categoryFilter !== "all" && !availableCategories.includes(categoryFilter)) {
      setCategoryFilter("all");
    }
  }, [categoryFilter, availableCategories]);

  // Pagination logic
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAndSortedInsights.slice(start, start + PAGE_SIZE);
  }, [page, filteredAndSortedInsights]);

  const totalPages = Math.ceil(filteredAndSortedInsights.length / PAGE_SIZE);

  if (isLoading) {
    return <InsightsSkeleton />;
  }

  // Show skeleton if subscription is locked (even if there's data, to hide old data from expired users)
  if (isSubscriptionLocked) {
    return (
      <UpgradeOverlay
        title="Upgrade to Access Insights"
        description="Unlock actionable insights and recommendations generated from real user data. Upgrade your subscription to access this feature and more."
      >
        <InsightsSkeleton />
      </UpgradeOverlay>
    );
  }

  return (
    <>
      {filteredAndSortedInsights.length > 0 && (
        <section className="space-y-1">
          <h1 className="text-primary text-xl font-bold">Actionable Insights</h1>
          <p className="text-sm text-gray-500">
            A curated set of recommendations generated from real user insights, helping you understand what to improve
            and where to focus next.
          </p>
        </section>
      )}

      <div className="flex flex-col gap-4">
        {/* Top Controls */}
        {insights.length > 0 && (
          <div className="flex items-center justify-between gap-4">
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px] border-0 shadow-none">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {INSIGHT_CATEGORIES[category].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v as "posts" | "az" | "za");
                setPage(1);
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

        {filteredAndSortedInsights.length < 1 && insights.length > 0 && (
          <div className="text-muted-foreground py-8 text-center">No insights found for the selected category.</div>
        )}

        {insights.length < 1 && <EmptyObjectives />}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((item) => {
            const category = INSIGHT_CATEGORIES[item.category];
            const Icon = category ? category.icon : "Lightbulb";

            return (
              <InsightCard
                key={item.id}
                categoryLabel={category ? category.label : "Insight"}
                categoryColor={category ? category.color : "orange"}
                iconName={Icon as keyof typeof LucideIcons}
                title={item.title}
                posts={item.numPosts}
                onClick={() => {
                  setCurrentObjective(item);
                  setOpen(true);
                }}
              />
            );
          })}
        </div>

        {/* Pagination */}
        {filteredAndSortedInsights.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>

            <span className="text-sm">
              Page {page} of {totalPages}
            </span>

            <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>

      {currentObjective && (
        <InsightModal
          open={open}
          id={currentObjective.id}
          onOpenChange={setOpen}
          iconName={INSIGHT_CATEGORIES[currentObjective.category].icon as keyof typeof LucideIcons}
          categoryColor={INSIGHT_CATEGORIES[currentObjective.category].color}
          categoryLabel={INSIGHT_CATEGORIES[currentObjective.category].label}
          title={currentObjective.title}
          whatTheMarketTellsUs={currentObjective.whatTheMarketTellsUs}
          whyItMatters={currentObjective.whyItMatters}
          specificTasks={currentObjective.specificTasks}
        />
      )}
    </>
  );
}
