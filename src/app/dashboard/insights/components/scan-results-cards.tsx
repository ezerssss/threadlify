"use client";

import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import * as LucideIcons from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UpgradeOverlay } from "@/components/upgrade-overlay";
import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { FIREBASE_COLLECTION_ENUMS } from "@/enums/firebase";
import useUser from "@/hooks/use-user";
import type { InsightSummaryType } from "@/types/insights";
import { MIN_SIGNAL_COUNT, SIGNAL_LENSES, type SignalType } from "@/types/signal";

import { EmptyObjectives } from "./empty-objectives";
import { InsightCard } from "./insight-card";
import { InsightsSkeleton } from "./insights-skeleton";
import { LENS_DISPLAY, type SignalLensKey } from "./lens-display";
import SignalModal from "./signal-modal";

const INITIAL_SIGNALS_PER_LENS = 3;

type CategoryFilterValue = SignalLensKey | "all";

export function ScanResultsCards() {
  const { user, userData, claims } = useUser();
  const [signals, setSignals] = useState<SignalType[]>([]);
  const [insightSummary, setInsightSummary] = useState<InsightSummaryType | null>(null);
  const [expandedLens, setExpandedLens] = useState<SignalLensKey | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<SignalType | null>(null);
  const [selectedLens, setSelectedLens] = useState<SignalLensKey | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>("all");
  const [isLoading, setIsLoading] = useState(true);

  const isSubscriptionLocked = userData?.subscription.plan === "free" && !claims?.isAdmin;

  // Subscribe to signals
  useEffect(() => {
    if (!user || !userData) return;

    if (isSubscriptionLocked) {
      setIsLoading(false);
      return;
    }

    const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
    const signalsRef = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.SIGNALS_COLLECTION);

    const unsub = onSnapshot(signalsRef, (snapshot) => {
      const data: SignalType[] = snapshot.docs.map((d) => d.data() as SignalType);
      setSignals(data);
      setIsLoading(false);
    });

    return () => unsub();
  }, [user, userData, isSubscriptionLocked]);

  // Load insight summary (single doc)
  useEffect(() => {
    if (!user || !userData || isSubscriptionLocked) return;

    (async () => {
      const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
      const insightsRef = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.INSIGHTS_COLLECTION);
      const snapshot = await getDocs(insightsRef);
      setIsLoading(false);

      if (snapshot.empty) {
        setInsightSummary(null);
        return;
      }
      const first = snapshot.docs[0];
      setInsightSummary(first.data() as InsightSummaryType);
    })();
  }, [user, userData, isSubscriptionLocked]);

  const validSignals = useMemo(() => signals.filter((s) => s.count >= MIN_SIGNAL_COUNT), [signals]);

  const signalsByLens = useMemo(() => {
    const byLens: Record<SignalLensKey, SignalType[]> = {
      market_icp: [],
      pain: [],
      feature: [],
      onboarding: [],
      monetization: [],
      trust: [],
    };
    for (const s of validSignals) {
      byLens[s.lens].push(s);
    }
    for (const lens of SIGNAL_LENSES) {
      byLens[lens].sort((a, b) => b.count - a.count);
    }
    return byLens;
  }, [validSignals]);

  const lensOrder = SIGNAL_LENSES as SignalLensKey[];
  const hasAnySignals = validSignals.length > 0;

  const lensesWithSignals = useMemo(
    () => lensOrder.filter((lens) => (signalsByLens[lens]?.length ?? 0) > 0),
    [lensOrder, signalsByLens],
  );

  const sortedLensesWithSignals = useMemo(
    () =>
      [...lensesWithSignals].sort((a, b) => (LENS_DISPLAY[a]?.label ?? a).localeCompare(LENS_DISPLAY[b]?.label ?? b)),
    [lensesWithSignals],
  );

  let lensesToShow: SignalLensKey[];
  if (categoryFilter === "all") {
    lensesToShow = sortedLensesWithSignals;
  } else if (lensesWithSignals.includes(categoryFilter)) {
    lensesToShow = [categoryFilter];
  } else {
    lensesToShow = sortedLensesWithSignals;
  }

  if (isLoading) {
    return <InsightsSkeleton />;
  }

  if (isSubscriptionLocked) {
    return (
      <UpgradeOverlay
        title="Upgrade to Access Market Signals"
        description="Unlock recurring themes from real conversations. Upgrade your subscription to access this feature."
      >
        <InsightsSkeleton />
      </UpgradeOverlay>
    );
  }

  return (
    <>
      {hasAnySignals && (
        <section className="space-y-1">
          <h1 className="text-primary text-xl font-bold">Market Signals</h1>
          <p className="text-muted-foreground text-sm">
            Recurring themes from real conversations. Pick a category to focus on what matters.
          </p>
        </section>
      )}

      <div className="flex flex-col gap-6">
        {hasAnySignals && lensesWithSignals.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">Category</span>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as CategoryFilterValue)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {sortedLensesWithSignals.map((lens) => (
                  <SelectItem key={lens} value={lens}>
                    {LENS_DISPLAY[lens]?.label ?? lens}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!hasAnySignals && <EmptyObjectives />}

        {lensesToShow.map((lens) => {
          const lensSignals = signalsByLens[lens];
          if (lensSignals.length === 0) return null;

          const display = LENS_DISPLAY[lens];
          const summary = (insightSummary?.[lens as keyof InsightSummaryType] ?? "")?.trim() ?? "";
          const isExpanded = expandedLens === lens;
          const visibleSignals = isExpanded ? lensSignals : lensSignals.slice(0, INITIAL_SIGNALS_PER_LENS);
          const hasMore = lensSignals.length > INITIAL_SIGNALS_PER_LENS;
          const iconName = (display?.icon ?? "Lightbulb") as keyof typeof LucideIcons;
          const LensIcon = display?.Icon;

          return (
            <div key={lens} className="space-y-3">
              <div className="flex items-center gap-2">
                {LensIcon && <LensIcon className="h-4 w-4" style={{ color: display?.color }} />}
                <h2 className="text-lg font-semibold" style={{ color: display?.color }}>
                  {display?.label ?? lens}
                </h2>
              </div>

              {summary && (
                <div
                  className="bg-muted/40 rounded-lg border-l-4 p-4"
                  style={{ borderLeftColor: display?.color ?? "var(--muted)" }}
                >
                  <div className="mb-2 flex items-center gap-2" style={{ color: display?.color }}>
                    {LensIcon && <LensIcon className="h-4 w-4" />}
                    <span className="text-sm font-semibold">Insight summary</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{summary}</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="scrollbar-thin flex flex-col gap-3 overflow-y-auto">
                  {visibleSignals.map((signal) => (
                    <InsightCard
                      key={signal.id}
                      signal={signal}
                      lensLabel={display?.label ?? lens}
                      lensColor={display?.color ?? "inherit"}
                      iconName={iconName}
                      onClick={() => {
                        setSelectedSignal(signal);
                        setSelectedLens(lens);
                        setModalOpen(true);
                      }}
                    />
                  ))}
                </div>

                {hasMore && (
                  <Button
                    variant="ghost"
                    className="text-muted-foreground w-fit gap-1"
                    onClick={() => setExpandedLens((prev) => (prev === lens ? null : lens))}
                  >
                    {isExpanded ? "Show less" : `Show ${lensSignals.length - INITIAL_SIGNALS_PER_LENS} more`}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedSignal && selectedLens && (
        <SignalModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          signal={selectedSignal}
          iconName={(LENS_DISPLAY[selectedLens]?.icon ?? "Lightbulb") as keyof typeof LucideIcons}
          lensColor={LENS_DISPLAY[selectedLens]?.color ?? "inherit"}
          lensLabel={LENS_DISPLAY[selectedLens]?.label ?? selectedLens}
        />
      )}
    </>
  );
}
