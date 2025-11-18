import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface PropsInterface {
  reasoning: string[];
}

export function ShowReasoning(props: PropsInterface) {
  const { reasoning } = props;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button tabIndex={-1} variant="link" className="w-fit p-0 text-xs">
          Show agent reasoning
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <ul className="list-inside list-disc space-y-2 text-[13px]">
          {reasoning.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}
