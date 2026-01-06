"use client";

import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpgradeModalStore } from "@/stores/upgrade";

interface UpgradeOverlayProps {
  readonly children: React.ReactNode;
  readonly title?: string;
  readonly description?: string;
}

export function UpgradeOverlay({ children, title, description }: UpgradeOverlayProps) {
  const setIsOpen = useUpgradeModalStore((state) => state.setIsOpen);

  const handleUpgrade = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative w-full">
      {/* Skeleton content with reduced opacity - more visible */}
      <div className="pointer-events-none opacity-70">{children}</div>

      {/* Overlay - positioned to cover the content area */}
      <div className="bg-background/75 absolute inset-0 z-10 flex items-center justify-center p-4 backdrop-blur-[1px]">
        <Card className="bg-card border-primary/20 w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <Lock className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="mb-1 text-xl">{title ?? "Upgrade Required"}</CardTitle>
            <CardDescription className="mx-auto max-w-md text-sm">
              {description ??
                "Upgrade to Pro to build products in a market-driven way. Get strategic guidance, auto recommended replies, and all premium features."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={handleUpgrade}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-full px-4 text-sm font-semibold sm:w-auto"
            >
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
