import { ForwardRefExoticComponent, RefAttributes } from "react";

import * as LucideIcons from "lucide-react";

import { Card } from "@/components/ui/card";

interface InsightCardProps {
  categoryLabel: string;
  categoryColor: string;
  iconName: keyof typeof LucideIcons;
  title: string;
  posts: number;
  onClick?: () => void;
}

export function InsightCard({ categoryLabel, categoryColor, iconName, title, posts, onClick }: InsightCardProps) {
  const Icon =
    (LucideIcons[iconName] as ForwardRefExoticComponent<
      Omit<LucideIcons.LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >) ?? LucideIcons.Lightbulb;

  return (
    <Card
      className="bg-card hover:border-primary flex w-full cursor-pointer flex-col gap-2 rounded-xl p-4 shadow-sm transition-all"
      onClick={onClick}
    >
      <div className="text-muted-foreground flex items-center gap-1 text-xs">
        <Icon style={{ color: categoryColor }} className="h-3 w-3" />
        <p style={{ color: categoryColor }}>{categoryLabel}</p>
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="leading-tight font-semibold">{title}</h3>

        {/* <div className="text-muted-foreground pointer-events-none text-xs">
          <ReadMoreArea lettersLimit={300} expandLabel="See more">
            {description}
          </ReadMoreArea>
        </div> */}
      </div>

      <p className="text-muted-foreground mt-1 text-xs">
        Referenced by <span className="font-medium">{posts}</span> posts
      </p>
    </Card>
  );
}
