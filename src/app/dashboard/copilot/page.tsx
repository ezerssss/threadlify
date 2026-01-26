"use client";

import { useState, type KeyboardEvent } from "react";

import { Mail } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WorkInProgressOverlay } from "@/components/work-in-progress-overlay";
import useHasData from "@/hooks/use-has-data";
import useUser from "@/hooks/use-user";

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
  const { userData } = useUser();
  const { hasData, isLoading: isCheckingData } = useHasData();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<{ question: string; answer: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
          <AlertTitle className="text-foreground">Get started with Threadlify</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            <div className="space-y-3">
              <p>
                We automatically scan the market to gather data from conversations. Once we have data, you can ask
                questions about your posts, identify patterns, and get actionable recommendations.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const subject = encodeURIComponent("No Data in Copilot - Copilot");
                    const body = encodeURIComponent(
                      `Hello Threadlify Support,

I recently upgraded to ${userData?.subscription.plan ?? "pro"} but I'm still not seeing any data in my Copilot.

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
        {copilotContent}
        {/* {isSubscriptionLocked ? <CopilotUpgrade>{copilotContent}</CopilotUpgrade> : copilotContent} */}
      </WorkInProgressOverlay>
    </>
  );
}

export default Page;
