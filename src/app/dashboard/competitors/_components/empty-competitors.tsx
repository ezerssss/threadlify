import { Users } from "lucide-react";

import { Card } from "@/components/ui/card";

export function EmptyCompetitors() {
  return (
    <Card className="bg-muted/50 flex flex-col items-center justify-center gap-4 border p-12">
      <div className="bg-primary/10 rounded-full p-4">
        <Users className="text-primary h-8 w-8" />
      </div>
      <div className="text-center">
        <h3 className="text-foreground mb-2 text-lg font-semibold">No competitor insights yet</h3>
        <p className="text-muted-foreground text-sm">
          Competitor tracking insights will appear here once we analyze market conversations about your competitors.
        </p>
      </div>
    </Card>
  );
}
