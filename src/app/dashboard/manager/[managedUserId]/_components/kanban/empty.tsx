import { useRouter } from "next/navigation";

import { IconArticle, IconHammer } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import useUser from "@/hooks/use-user";

export default function EmptyKanban() {
  const router = useRouter();
  const { userData } = useUser();

  function handleClick() {
    router.push("/dashboard/profile");
  }

  const isProfileGenerated = !!userData?.profile;

  const icon = isProfileGenerated ? <IconArticle /> : <IconHammer />;
  const title = isProfileGenerated ? "No relevant posts yet" : "We're still building your profile";
  const content = isProfileGenerated
    ? "New items will appear here automatically once we spot something useful."
    : "Your dashboard will start filling in as soon as everything is ready. This should not take too long.";

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{content}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={handleClick}>View Profile</Button>
      </EmptyContent>
    </Empty>
  );
}
