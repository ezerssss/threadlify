"use client";

import { Check, Eye, Lock, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpgradeModalStore } from "@/stores/upgrade";

const features = [
  {
    icon: Zap,
    title: "Market-Driven Product Building",
    description: "Know what to build next, when to engage, and how to prioritize based on market demand",
  },
  {
    icon: Sparkles,
    title: "Auto Recommended Replies",
    description: "Get AI-generated replies to help you engage easily and build relationships with your audience",
  },
  {
    icon: Eye,
    title: "Competitor Tracking",
    description: "Track what your competitors are doing, understand market opportunities, and stay ahead",
  },
];

export function CopilotUpgrade({ children }: { children: React.ReactNode }) {
  const setIsOpen = useUpgradeModalStore((state) => state.setIsOpen);

  const handleUpgrade = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative min-h-full">
      {/* Copilot content with reduced opacity - preserved */}
      <div className="pointer-events-none opacity-70">{children}</div>

      {/* Overlay - positioned to cover the content area */}
      <div className="bg-background/75 absolute inset-0 top-1/2 z-10 flex translate-y-[-50%] items-center justify-center p-4 backdrop-blur-[1px]">
        <Card className="bg-card border-primary/20 max-h-[80vh] w-full max-w-3xl overflow-hidden border-2 shadow-xl">
          <div className="scrollbar-thin overflow-y-auto">
            <CardHeader className="pb-2 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Lock className="text-primary h-8 w-8" />
              </div>
              <CardTitle className="mb-2 text-2xl">Upgrade to Access Threadlify</CardTitle>
              <CardDescription className="mx-auto max-w-xl text-base">
                Upgrade to Pro to build products in a market-driven way. Get strategic guidance, auto recommended
                replies, and all the tools you need to build what your market actually wants.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features Grid */}
              <div className="grid gap-4 md:grid-cols-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="bg-muted/50 rounded-lg border p-4 text-center">
                      <div className="bg-primary/10 mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
                        <Icon className="text-primary h-5 w-5" />
                      </div>
                      <h3 className="text-foreground mb-1 text-sm font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground text-xs">{feature.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Benefits List */}
              <div className="bg-muted/30 rounded-lg border p-5">
                <h3 className="text-foreground mb-3 text-base font-semibold">
                  What you&apos;ll get with Threadlify Pro:
                </h3>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="flex items-start gap-2.5">
                    <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-foreground text-xs">
                      Auto recommended replies to help you engage easily with your audience
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-foreground text-xs">
                      Strategic guidance on what to build next based on market demand
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-foreground text-xs">
                      Build products that your market actually wants, not what you think they want
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-foreground text-xs">
                      Organize and prioritize opportunities with Kanban boards
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-foreground text-xs">
                      Get actionable insights on product objectives and focus areas
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-foreground text-xs">
                      Track competitors and understand market opportunities
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Button
                  onClick={handleUpgrade}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6 text-sm font-semibold"
                >
                  Upgrade to Pro
                </Button>
                <p className="text-muted-foreground mt-3 text-xs">
                  Upgrade now and get access to all premium features including Copilot, Auto Recommended Replies,
                  Kanban, Insights, Competitor Tracking, and more.
                </p>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
