import { ForwardRefExoticComponent, RefAttributes } from "react";

import * as LucideIcons from "lucide-react";

import { Card } from "@/components/ui/card";

interface CompetitorCardProps {
  categoryLabel: string;
  categoryColor: string;
  iconName: keyof typeof LucideIcons;
  competitorName: string;
  title: string;
  posts: number;
  onClick?: () => void;
}

export function CompetitorCard({
  categoryLabel,
  categoryColor,
  iconName,
  competitorName,
  title,
  posts,
  onClick,
}: CompetitorCardProps) {
  const Icon =
    (LucideIcons[iconName] as ForwardRefExoticComponent<
      Omit<LucideIcons.LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >) ?? LucideIcons.Users;

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
        {/* <div className="text-muted-foreground text-xs font-medium uppercase">{competitorName}</div> */}
        <h3 className="leading-tight font-semibold">{title}</h3>
      </div>

      <p className="text-muted-foreground mt-1 text-xs">
        Referenced by <span className="font-medium">{posts}</span> posts
      </p>
    </Card>
  );
}
