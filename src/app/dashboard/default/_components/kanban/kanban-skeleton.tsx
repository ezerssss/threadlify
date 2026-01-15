import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const COLUMN_IDS = ["new", "inProgress", "done"];
const COLUMN_COLOR: Record<string, string> = { new: "bg-green-500", inProgress: "bg-yellow-500", done: "bg-gray-400" };

function KanbanSkeleton() {
  return (
    <div className="grid h-full min-w-[800px] auto-rows-fr grid-cols-3 gap-4">
      {COLUMN_IDS.map((columnId) => (
        <div key={columnId} className="bg-card flex flex-col gap-2.5 rounded-md border p-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-full", COLUMN_COLOR[columnId])} />
              </div>
              <Badge variant="secondary">
                <Skeleton className="h-3 w-4" />
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
          </div>
          <div className="min-h-[400px] flex-1 space-y-2.5">
            {Array.from({ length: 4 }, (_, index) => `skeleton-card-${columnId}-${index}`).map((key) => (
              <div key={key} className="bg-card cursor-grab rounded-md border p-2.5 shadow-xs">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-12" />
                  </div>

                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />

                  <Skeleton className="h-5 w-20 rounded-sm" />

                  <div className="flex items-end gap-1">
                    <Skeleton className="h-5 w-16 rounded-sm" />
                    <Skeleton className="h-5 w-20 rounded-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default KanbanSkeleton;
