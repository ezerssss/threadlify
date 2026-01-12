"use client";

import { Construction } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkInProgressOverlayProps {
  readonly children: React.ReactNode;
  readonly title?: string;
  readonly description?: string;
}

export function WorkInProgressOverlay({ children, title, description }: WorkInProgressOverlayProps) {
  return (
    <div className="relative w-full">
      {/* Content with reduced opacity */}
      <div className="pointer-events-none opacity-70">{children}</div>

      {/* Overlay - positioned to cover the content area */}
      <div className="bg-background/75 absolute inset-0 z-10 flex items-center justify-center p-4 backdrop-blur-[1px]">
        <Card className="bg-card w-full max-w-lg border-amber-200/50 shadow-xl dark:border-amber-800/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Construction className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="mb-1 text-xl">{title ?? "Work in Progress"}</CardTitle>
            <CardDescription className="mx-auto max-w-md text-sm">
              {description ??
                "This feature is currently under development. We're working hard to bring you an amazing experience. Check back soon!"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center dark:border-amber-800/50 dark:bg-amber-950/30">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Coming Soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
