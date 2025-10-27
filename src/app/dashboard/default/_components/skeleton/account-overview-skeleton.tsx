import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountOverViewSkeleton() {
  return (
    <Card className="shadow-xs">
      <CardHeader className="items-center">
        <CardTitle>
          <Skeleton className="h-5 w-24" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-5 w-64" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Profile Summary */}
          <div className="bg-primary/30 relative w-full space-y-3 overflow-hidden rounded-xl p-4 perspective-distant">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-18 w-full" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-18 w-full" />
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
          </div>

          <Separator />

          {/* Recent Scans */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />

            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-10 w-11 rounded-full" />
                  <div className="flex w-full items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              ))}
            </div>

            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
