import { IconBulbOff } from "@tabler/icons-react";

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export function EmptyObjectives() {
  return (
    <Empty className="mt-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconBulbOff />
        </EmptyMedia>
        <EmptyTitle>No Insights Yet</EmptyTitle>
        <EmptyDescription>
          There are no insights yet. Please wait until data is captured from real user posts.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
