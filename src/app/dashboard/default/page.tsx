"use client";

import { useEffect, useState, type KeyboardEvent } from "react";

import ky from "ky";
import { Mail, Scan } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { WorkInProgressOverlay } from "@/components/work-in-progress-overlay";
import { SCAN_REQUEST_URL } from "@/constants/url";
import useHasData from "@/hooks/use-has-data";
import useUser from "@/hooks/use-user";
import { cn, toastError } from "@/lib/utils";

import { CopilotContent } from "./_components/copilot-content";
import { CopilotUpgrade } from "./_components/copilot-upgrade";

const suggestedPrompts = [
  "Which posts deserve my attention today?",
  "What product objective should I focus on next?",
  "What patterns am I seeing in the market?",
  "What should I do based on recent signals?",
];

function getPostsAnswer(): string {
  return `Based on recent activity, here are the posts that deserve your attention today:

## High Engagement Alert
3 posts from your target audience have received **50+ comments** in the last 24 hours. These conversations are actively developing and may require your response.

## Trending Topic
A discussion about "AI-powered customer insights" is gaining traction with **120+ mentions**. This aligns with your product roadmap and presents an opportunity to contribute valuable insights.

## Competitor Mention
Your brand was mentioned alongside 2 competitors in a comparison thread. This is a prime opportunity to engage and highlight your unique value proposition.

## Customer Question
5 users have asked similar questions about integration capabilities. Consider creating a comprehensive response or documentation update.`;
}

function getProductObjectiveAnswer(): string {
  return `Based on market signals and user feedback, here's the product objective you should focus on next:

## Priority: Enhanced Analytics Dashboard

### Why this matters
- **47%** of user conversations mention needing "better visibility into performance metrics"
- Your competitors are launching similar features, creating urgency
- Internal data shows users with analytics access have **3x higher retention**

### Recommended approach
1. Start with real-time engagement metrics (most requested)
2. Add customizable reporting views (differentiation opportunity)
3. Integrate predictive insights (competitive advantage)

### Expected impact
- Increase user engagement by **25-30%**
- Reduce churn in the 30-60 day window
- Create upsell opportunity for premium analytics tier`;
}

function getPatternsAnswer(): string {
  return `Here are the key patterns emerging in your market:

## 1. Shift Toward Real-Time Insights
- **68%** of discussions emphasize the need for "live" or "instant" data
- Users are moving away from weekly reports to daily/hourly updates
- This trend has accelerated **40%** in the last quarter

## 2. Integration Fatigue
- Users are expressing frustration with "too many tools"
- There's growing demand for all-in-one platforms
- **Opportunity**: Position as a unified solution rather than point tool

## 3. AI-Assisted Decision Making
- **52%** of conversations mention AI/ML capabilities as a deciding factor
- Users want "smart recommendations" not just raw data
- Pattern suggests premium tier should emphasize AI features

## 4. Mobile-First Usage
- **73%** of engagement happens on mobile devices
- Desktop features are underutilized
- Consider mobile-optimized workflows as priority`;
}

function getActionPlanAnswer(): string {
  return `Based on recent signals, here's your recommended action plan:

## Immediate Actions (This Week)
1. **Engage with trending conversations**
   - 3 high-value threads need your input
   - Your expertise could position you as a thought leader
2. **Address the integration question**
   - Multiple users are asking
   - Create a quick guide or video to reduce support burden
3. **Monitor competitor mentions**
   - Set up alerts for when you're compared to competitors
   - Engage proactively
## Short-Term Focus (Next 2 Weeks)
1. **Launch analytics beta**
   - Market signals strongly indicate demand
   - Start with a small user group
2. **Content strategy pivot**
   - Shift messaging to emphasize real-time capabilities and AI features
3. **Mobile optimization**
   - Prioritize mobile experience improvements based on usage patterns
## Strategic Moves (Next Month)
1. **Partnership exploration**
   - Market shows interest in integrated solutions
   - Identify potential integration partners
2. **Pricing review**
   - Signals suggest users value AI features
   - Consider premium tier restructure
3. **Community building**
   - Create a space for power users to share insights and best practices`;
}

const QUESTION_MATCHERS = [
  {
    keywords: ["posts deserve", "attention today"],
    getAnswer: getPostsAnswer,
  },
  {
    keywords: ["product objective", "focus on next", "what should i build"],
    getAnswer: getProductObjectiveAnswer,
  },
  {
    keywords: ["patterns", "seeing in the market", "market trends"],
    getAnswer: getPatternsAnswer,
  },
  {
    keywords: ["should i do", "recent signals", "based on"],
    getAnswer: getActionPlanAnswer,
  },
] as const;

function getAnswerForQuestion(question: string): string {
  const lowerQuestion = question.toLowerCase();

  for (const matcher of QUESTION_MATCHERS) {
    const matches = matcher.keywords.some((keyword) => lowerQuestion.includes(keyword));
    if (matches) {
      return matcher.getAnswer();
    }
  }

  return "I can help you understand which posts need attention, what product objectives to prioritize, market patterns, and actionable recommendations based on recent signals. Try one of the suggested questions above!";
}

function Page() {
  const { userData, idToken } = useUser();
  const { hasData, isLoading: isCheckingData } = useHasData();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<{ question: string; answer: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setIsScanning(userData?.isScanning ?? false);
  }, [userData?.isScanning]);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const answer = getAnswerForQuestion(question);

    setResult({
      question,
      answer,
    });

    setQuestion("");
    setIsLoading(false);
  };

  const handleReset = () => {
    setResult(null);
    setQuestion("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  async function handleScanMarket() {
    if (!userData) {
      return;
    }

    const { subscription } = userData;
    const remainingScans = subscription.monthlyQuota - subscription.usedThisPeriod;

    if (remainingScans < 1) {
      toastError("You have no scans remaining on your current plan. Please upgrade or purchase additional scans.");
      return;
    }

    if (isScanning) {
      toastError("A scan is currently in progress. Please wait for it to finish before scanning.");
      return;
    }

    try {
      setIsScanning(true);
      if (!idToken) {
        throw new Error("You are unauthorized to do this action.");
      }

      await ky.post(SCAN_REQUEST_URL, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
    } catch (error) {
      toastError(error);
      setIsScanning(false);
    }
  }

  // Lock content if subscription is free or expired
  const isSubscriptionLocked = userData?.subscription.plan === "free";
  const hasNoData = !hasData && !isCheckingData;
  const isDisabled = !userData || isLoading || isSubscriptionLocked || hasNoData;

  const copilotContent = (
    <CopilotContent
      question={question}
      setQuestion={setQuestion}
      result={result}
      isLoading={isLoading}
      isDisabled={isDisabled}
      hasNoData={hasNoData}
      suggestedPrompts={suggestedPrompts}
      handleAsk={handleAsk}
      handleReset={handleReset}
      handleKeyDown={handleKeyDown}
    />
  );

  return (
    <>
      {hasNoData && !isSubscriptionLocked && (
        <Alert className="border-amber-200 bg-amber-50/50">
          <Scan className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-foreground">Get started with Threadlify</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            <div className="space-y-3">
              <p>
                Perform a scan to gather data from market conversations, then return here to ask questions about your
                posts, identify patterns, and get actionable recommendations.
              </p>
              <div className="flex items-center gap-2">
                {(() => {
                  if (!userData) return null;
                  const { subscription } = userData;
                  const remainingScans = subscription.monthlyQuota - subscription.usedThisPeriod;
                  const isFreeTier = subscription.plan === "free";
                  const isButtonDisabled = isScanning || !userData || isFreeTier || remainingScans < 1;

                  function getTooltipMessage(): string {
                    if (isScanning) {
                      return "Scan in progress...";
                    }

                    if (isButtonDisabled) {
                      if (isFreeTier) {
                        if (remainingScans > 0) {
                          return "Upgrade to Pro to perform scans";
                        } else {
                          return "Upgrade to Pro to get more scans";
                        }
                      }

                      // Pro/Enterprise but zero scans
                      if (remainingScans < 1) {
                        return "Your scans will reset at the start of your next billing cycle";
                      }
                    }

                    // Button is enabled - show action message
                    return "Click to perform a scan and gather market data";
                  }

                  const tooltipMessage = getTooltipMessage();

                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            onClick={handleScanMarket}
                            disabled={isButtonDisabled}
                            size="sm"
                            className={cn(isScanning && "animate-pulse")}
                          >
                            <Scan className="mr-2 h-4 w-4" />
                            {isScanning ? "Scanning..." : "Perform scan"}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tooltipMessage}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const subject = encodeURIComponent("No Data After Scan - Copilot");
                    const body = encodeURIComponent(
                      `Hello Threadlify Support,

I recently upgraded to ${userData?.subscription.plan ?? "pro"} and performed a scan, but I'm still not seeing any data in my Copilot.

Could you please help me troubleshoot this issue?

Thank you!`,
                    );
                    globalThis.location.href = `mailto:support@threadlify.io?subject=${subject}&body=${body}`;
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <WorkInProgressOverlay
        title="Threadlify Copilot - Work in Progress"
        description="Our AI-powered assistant is currently under development. We're working hard to bring you intelligent insights about your market conversations, posts, and actionable recommendations. Check back soon!"
      >
        {isSubscriptionLocked ? <CopilotUpgrade>{copilotContent}</CopilotUpgrade> : copilotContent}
      </WorkInProgressOverlay>
    </>
  );
}

export default Page;
