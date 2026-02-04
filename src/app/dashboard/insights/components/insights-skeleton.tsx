import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function InsightsSkeleton() {
  return (
    <>
      <section className="space-y-1">
        <h1 className="text-primary text-xl font-bold">Market Signals</h1>
        <p className="text-muted-foreground text-sm">
          Recurring themes from real conversations—each backed by 5+ posts. Pick a category to focus on what matters.
        </p>
      </section>

      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((lensIdx) => (
          <div key={lensIdx} className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((cardIdx) => (
                <Card key={cardIdx} className="bg-card flex w-full flex-col gap-2 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3 rounded" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="mt-1 h-3 w-28" />
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
