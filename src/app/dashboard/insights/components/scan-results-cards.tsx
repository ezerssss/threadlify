"use client";

import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import * as LucideIcons from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

type SortByValue = "reference_count" | "name";

export function ScanResultsCards() {
  const { user, userData, claims } = useUser();
  const [signals, setSignals] = useState<SignalType[]>([]);
  const [insightSummary, setInsightSummary] = useState<InsightSummaryType | null>(null);
  const [expandedLens, setExpandedLens] = useState<SignalLensKey | null>(null);
  const [expandedSummary, setExpandedSummary] = useState<SignalLensKey | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<SignalType | null>(null);
  const [selectedLens, setSelectedLens] = useState<SignalLensKey | null>(null);
  const [sortBy, setSortBy] = useState<SortByValue>("reference_count");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const TILES_PER_PAGE = 2;

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
    });

    return () => unsub();
  }, [user, userData, isSubscriptionLocked]);

  // Load insight summary (single doc)
  useEffect(() => {
    if (!user || !userData || isSubscriptionLocked) {
      return;
    }

    (async () => {
      const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
      const insightsRef = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.INSIGHTS_COLLECTION);
      const snapshot = await getDocs(insightsRef);

      if (snapshot.empty) {
        setInsightSummary(null);
        setIsLoading(false);
        return;
      }
      const first = snapshot.docs[0];
      setInsightSummary(first.data() as InsightSummaryType);
      setIsLoading(false);
    })();
  }, [user, userData, isSubscriptionLocked]);

  const validSignals = useMemo(() => signals.filter((s) => s.count >= MIN_SIGNAL_COUNT), [signals]);

  const signalsByLens = useMemo(() => {
    const byLens: Record<SignalLensKey, SignalType[]> = {
      market_icp: [],
      feature: [],
      onboarding: [],
      monetization: [],
      trust: [],
    };
    for (const s of validSignals) {
      if (s.lens in byLens) byLens[s.lens].push(s);
    }
    for (const lens of SIGNAL_LENSES) {
      byLens[lens].sort((a, b) => b.count - a.count);
    }
    return byLens;
  }, [validSignals]);

  const lensOrder: SignalLensKey[] = [...SIGNAL_LENSES];

  const totalReferencePostsByLens = useMemo(() => {
    const out: Record<SignalLensKey, number> = {
      market_icp: 0,
      feature: 0,
      onboarding: 0,
      monetization: 0,
      trust: 0,
    };
    for (const lens of lensOrder) {
      out[lens] = (signalsByLens[lens] ?? []).reduce((sum, s) => sum + s.count, 0);
    }
    return out;
  }, [signalsByLens, lensOrder]);

  const lensesWithSummaryOrSignals = useMemo(() => {
    return lensOrder.filter((lens) => {
      const summary = insightSummary?.[lens as keyof InsightSummaryType];
      const hasSummary = summary && typeof summary === "object" && "headline" in summary && summary.headline?.trim();
      return hasSummary;
    });
  }, [lensOrder, insightSummary]);

  const lensesToShow = useMemo(() => {
    const list = [...lensesWithSummaryOrSignals];
    if (sortBy === "reference_count") {
      list.sort((a, b) => totalReferencePostsByLens[b] - totalReferencePostsByLens[a]);
    } else {
      list.sort((a, b) => (LENS_DISPLAY[a]?.label ?? a).localeCompare(LENS_DISPLAY[b]?.label ?? b));
    }
    return list;
  }, [lensesWithSummaryOrSignals, sortBy, totalReferencePostsByLens]);

  const totalPages = Math.max(1, Math.ceil(lensesToShow.length / TILES_PER_PAGE));
  const pageStart = (page - 1) * TILES_PER_PAGE;
  const lensesOnPage = useMemo(
    () => lensesToShow.slice(pageStart, pageStart + TILES_PER_PAGE),
    [lensesToShow, pageStart],
  );

  useEffect(() => {
    setPage(1);
  }, [sortBy]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);
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

  const hasTiles = lensesToShow.length > 0;

  return (
    <>
      {hasTiles && (
        <section className="space-y-1">
          <h1 className="text-primary text-xl font-bold">Market Signals</h1>
          <p className="text-muted-foreground text-sm">
            Recurring themes from real conversations. Click a tile to view signals.
          </p>
        </section>
      )}

      <div className="flex flex-col gap-6">
        {hasTiles && (
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">Sort by</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortByValue)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reference_count">Reference count (posts)</SelectItem>
                <SelectItem value="name">Name (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {!hasTiles && <EmptyObjectives />}

        {hasTiles && (
          <>
            <div className="grid grid-cols-1 gap-4">
              {lensesOnPage.map((lens) => {
                const lensSignals = signalsByLens[lens] ?? [];
                const display = LENS_DISPLAY[lens];
                const summaryData = insightSummary?.[lens as keyof InsightSummaryType];
                const summary =
                  summaryData && typeof summaryData === "object" && "headline" in summaryData ? summaryData : null;
                const isExpanded = expandedLens === lens;
                const isSummaryExpanded = expandedSummary === lens;
                const totalRefs = totalReferencePostsByLens[lens];
                const LensIcon = display?.Icon;
                const signalCount = lensSignals.length;
                const signalWord = signalCount === 1 ? "signal" : "signals";
                const iconName = (display?.icon ?? "Lightbulb") as keyof typeof LucideIcons;

                return (
                  <div key={lens} className="space-y-3">
                    <div
                      className="bg-muted/30 hover:bg-muted/40 flex w-full flex-col rounded-lg border-l-4 p-3 text-left transition-colors"
                      style={{ borderLeftColor: display?.color ?? "var(--muted)" }}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2" style={{ color: display?.color }}>
                          {LensIcon && <LensIcon className="h-4 w-4 shrink-0" />}
                          <span className="truncate text-sm font-semibold">{display?.label ?? lens}</span>
                        </div>
                        {totalRefs > 0 && (
                          <span className="text-muted-foreground/80 shrink-0 text-xs tabular-nums">
                            Seen in {totalRefs} conversatio{totalRefs === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>

                      {summary && (
                        <div className="space-y-2">
                          <div>
                            <h3 className="text-foreground text-sm leading-relaxed font-semibold">
                              {summary.headline}
                            </h3>
                            {summary.subline && (
                              <p className="text-foreground/80 mt-1 text-sm leading-relaxed">{summary.subline}</p>
                            )}
                          </div>

                          {summary.bullets && summary.bullets.length > 0 && (
                            <div className="space-y-1">
                              {isSummaryExpanded ? (
                                <>
                                  <ul className="text-foreground/90 ml-4 list-disc space-y-1 text-sm">
                                    {summary.bullets.map((bullet) => (
                                      <li key={`${lens}-${bullet.slice(0, 20)}`} className="leading-relaxed">
                                        {bullet}
                                      </li>
                                    ))}
                                  </ul>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedSummary(null);
                                    }}
                                    className="text-muted-foreground hover:text-foreground mt-1 w-fit text-xs font-medium underline-offset-2 hover:underline"
                                  >
                                    Read less
                                  </button>
                                </>
                              ) : (
                                <div className="space-y-1">
                                  <ul className="text-foreground/90 ml-4 list-disc text-sm">
                                    <li className="leading-relaxed">{summary.bullets[0]}</li>
                                    {summary.bullets.length > 1 && (
                                      <li className="text-muted-foreground leading-relaxed">...</li>
                                    )}
                                  </ul>
                                  {summary.bullets.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedSummary(lens);
                                      }}
                                      className="text-muted-foreground hover:text-foreground w-fit text-xs font-medium underline-offset-2 hover:underline"
                                    >
                                      Read more
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedLens((prev) => (prev === lens ? null : lens))}
                        className="text-muted-foreground hover:text-foreground mt-3 w-fit text-xs font-medium underline-offset-2 hover:underline"
                      >
                        {isExpanded ? "Hide signals" : `View ${signalCount} ${signalWord}`}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="bg-muted/20 space-y-3 rounded-lg border p-4">
                        {(signalsByLens[lens] ?? []).length > 0 ? (
                          <div className="scrollbar-thin flex flex-col gap-3 overflow-y-auto">
                            {(signalsByLens[lens] ?? []).map((signal) => (
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
                        ) : (
                          <p className="text-muted-foreground text-sm">No signals in this category yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-muted-foreground text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
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
