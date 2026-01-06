import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function InsightsSkeleton() {
  return (
    <>
      <section className="space-y-1">
        <h1 className="text-primary text-xl font-bold">Actionable Insights</h1>
        <p className="text-sm text-gray-500">
          A curated set of recommendations generated from real user insights, helping you understand what to improve and
          where to focus next.
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => `skeleton-insight-${index}`).map((key) => (
            <Card key={key} className="bg-card flex w-full flex-col gap-2 rounded-xl p-4 shadow-sm">
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
          ))}
        </div>
      </div>
    </>
  );
}
