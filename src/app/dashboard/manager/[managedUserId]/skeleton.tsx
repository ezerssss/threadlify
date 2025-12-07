import React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ManagedUserSkeleton() {
  return (
    <div className="max-w-xl space-y-6 p-6">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="mb-1 h-4 w-16" />
            <Skeleton className="h-5 w-40" />
          </div>

          <div>
            <Skeleton className="mb-1 h-4 w-20" />
            <Skeleton className="h-5 w-56" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="mb-1 h-4 w-28" />
              <Skeleton className="h-6 w-10" />
            </div>

            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ManagedUserSkeleton;
