"use client";

import { useState, type KeyboardEvent } from "react";

import { ArrowRight, BotMessageSquareIcon, RotateCcw, Send } from "lucide-react";
import Markdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import useUser from "@/hooks/use-user";

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
  const isSubscriptionLocked = userData?.subscription.plan === "free" || userData?.subscription.status !== "active";

  const copilotContent = (
    <div className="flex justify-center p-4 pt-12">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="bg-primary rounded-lg p-3">
              <BotMessageSquareIcon className="text-primary-foreground h-6 w-6" />
            </div>
            <h1 className="text-foreground text-4xl font-bold">Threadlify Copilot</h1>
          </div>
          <p className="text-muted-foreground text-lg">Your market intelligence assistant</p>
        </div>

        {result ? (
          <div className="space-y-6">
            <Card className="bg-muted/50 border p-6 shadow-md">
              <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">Question</p>
              <p className="text-foreground flex items-start gap-2 text-2xl font-bold">
                <ArrowRight className="text-primary mt-1 h-6 w-6 shrink-0" />
                <span>{result.question}</span>
              </p>
            </Card>

            <Card className="border p-6 shadow-md">
              <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">Answer</p>

              <div className="max-h-96 overflow-y-auto">
                <div className="prose prose-sm dark:prose-invert max-w-none [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_li]:my-1 [&_ol]:my-2 [&_p]:my-2 [&_ul]:my-2">
                  <Markdown>{result.answer}</Markdown>
                </div>
              </div>
            </Card>

            <Button
              onClick={handleReset}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 w-full font-semibold"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Ask Another Question
            </Button>
          </div>
        ) : (
          <Card className="border p-8 shadow-md">
            <div className="space-y-6">
              <div>
                <label htmlFor="question-input" className="text-foreground mb-3 block text-sm font-semibold">
                  Ask me anything
                </label>
                <div className="flex gap-2">
                  <Input
                    id="question-input"
                    placeholder="Ask about relevant posts, what they mean, how to respond, or what to build next."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="h-11 flex-1"
                  />
                  <Button onClick={handleAsk} disabled={isLoading || !question.trim()} size="lg" className="h-11">
                    {isLoading ? <Spinner /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
                  Try asking about:
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setQuestion(prompt)}
                      className="bg-muted text-foreground hover:bg-muted/80 border-border rounded-lg border p-3 text-left text-sm font-medium transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );

  if (isSubscriptionLocked) {
    return <CopilotUpgrade>{copilotContent}</CopilotUpgrade>;
  }

  return copilotContent;
}

export default Page;
