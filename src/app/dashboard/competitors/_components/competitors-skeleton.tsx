import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function CompetitorsSkeleton() {
  return (
    <>
      <section className="space-y-1">
        <h1 className="text-primary text-xl font-bold">Competitor Tracking</h1>
        <p className="text-sm text-gray-500">
          Insights about your competitors based on market conversations, including what they&apos;re doing, market
          demands, and pain points.
        </p>
      </section>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Select disabled>
            <div className="flex w-full justify-end">
              <SelectTrigger className="border-0 shadow-none">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
            </div>
            <SelectContent />
          </Select>
        </div>

        <div className="space-y-6">
          {Array.from({ length: 3 }, (_, groupIndex) => `skeleton-group-${groupIndex}`).map((groupKey) => (
            <div key={groupKey} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-32" />
                  <Badge variant="secondary">
                    <Skeleton className="h-3 w-8" />
                  </Badge>
                  <Badge variant="outline">
                    <Skeleton className="h-3 w-12" />
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, cardIndex) => `skeleton-competitor-${groupKey}-${cardIndex}`).map(
                  (cardKey) => (
                    <Card key={cardKey} className="bg-card flex w-full flex-col gap-2 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3 rounded" />
                        <Skeleton className="h-3 w-24" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                      </div>

                      <Skeleton className="mt-1 h-3 w-32" />
                    </Card>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
