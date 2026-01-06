import { IconEyeOff } from "@tabler/icons-react";

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export function EmptyCompetitors() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconEyeOff />
        </EmptyMedia>
        <EmptyTitle>No Competitor Insights Yet</EmptyTitle>
        <EmptyDescription>
          Competitor tracking insights will appear here once we analyze market conversations about your competitors.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
