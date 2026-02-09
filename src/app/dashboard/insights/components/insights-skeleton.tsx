import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function InsightsSkeleton() {
  return (
    <>
      <section className="space-y-0.5">
        <h1 className="text-primary text-xl font-bold">Market Signals</h1>
        <p className="text-muted-foreground text-sm">
          Recurring themes from real conversations. We&apos;ll surface the most important patterns for you here.
        </p>
      </section>

      <div className="flex flex-col gap-4">
        {/* Sort row skeleton (matches real controls when data is ready) */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-[200px] rounded-md" />
          </div>
        </div>

        {/* Lens tiles grid (matches 2 tiles per page) */}
        <div className="grid grid-cols-1 gap-3">
          {[1, 2].map((lensIdx) => (
            <div key={lensIdx} className="space-y-1">
              <Card className="bg-muted/30 flex w-full flex-col gap-5 rounded-lg border-l-4 p-2.5">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Skeleton className="h-3.5 w-3.5 rounded-full" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                  <Skeleton className="h-3 w-28" />
                </div>

                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-3/4" />
                </div>

                <div className="mt-1 space-y-1">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="ml-4 h-3.5 w-11/12" />
                    <Skeleton className="ml-4 h-3.5 w-11/12" />
                    <Skeleton className="ml-4 h-3.5 w-2/3" />
                  </div>
                </div>

                <div className="mt-1">
                  <Skeleton className="h-3 w-32" />
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
