"use client";

import { type KeyboardEvent } from "react";

import { ArrowRight, BotMessageSquareIcon, RotateCcw, Send } from "lucide-react";
import Markdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CopilotContentProps {
  question: string;
  setQuestion: (question: string) => void;
  result: { question: string; answer: string } | null;
  isLoading: boolean;
  isDisabled: boolean;
  hasNoData: boolean;
  suggestedPrompts: string[];
  handleAsk: () => void;
  handleReset: () => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export function CopilotContent({
  question,
  setQuestion,
  result,
  isLoading,
  isDisabled,
  hasNoData,
  suggestedPrompts,
  handleAsk,
  handleReset,
  handleKeyDown,
}: CopilotContentProps) {
  return (
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
                  {hasNoData ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex-1">
                          <Input
                            id="question-input"
                            placeholder="Ask about relevant posts, what they mean, how to respond, or what to build next."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading || hasNoData}
                            className="h-11 flex-1"
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          We automatically scan the market to gather data. Please wait for data to be collected before
                          using the Copilot
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Input
                      id="question-input"
                      placeholder="Ask about relevant posts, what they mean, how to respond, or what to build next."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isLoading || hasNoData}
                      className="h-11 flex-1"
                    />
                  )}
                  {hasNoData ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button onClick={handleAsk} disabled={isDisabled} size="lg" className="h-11">
                            {isLoading ? <Spinner /> : <Send className="h-4 w-4" />}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          We automatically scan the market to gather data. Please wait for data to be collected before
                          using the Copilot
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      onClick={handleAsk}
                      disabled={isDisabled || question.trim().length < 1}
                      size="lg"
                      className="h-11"
                    >
                      {isLoading ? <Spinner /> : <Send className="h-4 w-4" />}
                    </Button>
                  )}
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
                      disabled={isDisabled}
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
}
