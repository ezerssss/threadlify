"use client";

import ky from "ky";
import { MessageCircleIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { KANBAN_NOT_RELEVANT_FEEDBACK_URL, KANBAN_NOT_RELEVANT_OPTIONS_URL } from "@/constants/url";
import useUser from "@/hooks/use-user";
import { cn, toastError } from "@/lib/utils";
import { useKanbanStore } from "@/stores/kanban";

interface NotRelevantFeedbackSheetProps {
  onSuccess?: (postId: string) => void;
  managedUserId?: string;
}

const OPTIONS_PLACEHOLDER = [
  "Wrong audience for my product",
  "Topic is related but too broad",
  "Interesting, but not for us",
  "Out of scope for our product",
  "They're venting, not seeking solutions",
];

function NotRelevantFeedbackSheet({ onSuccess, managedUserId }: NotRelevantFeedbackSheetProps) {
  const { idToken } = useUser();
  const feedbackSheetPostId = useKanbanStore((s) => s.feedbackSheetPostId);
  const setFeedbackSheetPostId = useKanbanStore((s) => s.setFeedbackSheetPostId);

  const [options, setOptions] = useState<string[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customFeedback, setCustomFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = feedbackSheetPostId !== null;
  const postId = feedbackSheetPostId;

  const closeSheet = useCallback(() => {
    setFeedbackSheetPostId(null);
    setSelectedOption(null);
    setCustomFeedback("");
    setOptions([]);
  }, [setFeedbackSheetPostId]);

  // Fetch AI-generated options when sheet opens with a post
  useEffect(() => {
    if (!postId || !idToken) {
      setOptionsLoading(false);
      return;
    }

    setOptionsLoading(true);
    setSelectedOption(null);
    setCustomFeedback("");

    const controller = new AbortController();

    (async () => {
      try {
        const data = await ky
          .post(KANBAN_NOT_RELEVANT_OPTIONS_URL, {
            signal: controller.signal,
            json: {
              id: postId,
              ...(managedUserId && { managedUserId }),
            },
            headers: { Authorization: `Bearer ${idToken}` },
          })
          .json<{ options?: string[] }>();

        setOptions(data.options ?? OPTIONS_PLACEHOLDER);
      } catch {
        // Fallback to placeholder options when backend is unavailable
        setOptions(OPTIONS_PLACEHOLDER);
      } finally {
        setOptionsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [postId, idToken, managedUserId]);

  const feedbackValue = selectedOption ?? customFeedback.trim();

  const handleSubmit = async () => {
    if (!postId || !idToken || !feedbackValue.trim()) {
      toast.error("Please select a reason or describe why it's not relevant.");
      return;
    }

    setIsSubmitting(true);
    try {
      await ky.post(KANBAN_NOT_RELEVANT_FEEDBACK_URL, {
        json: {
          id: postId,
          feedback: feedbackValue.trim(),
          ...(managedUserId && { managedUserId }),
        },
        headers: { Authorization: `Bearer ${idToken}` },
      });

      toast.success("Thanks for your feedback!");
      const submittedPostId = postId;
      closeSheet();
      onSuccess?.(submittedPostId);
    } catch (err) {
      toastError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeSheet()}>
      <SheetContent
        side="bottom"
        className="bg-card mx-auto max-h-[85vh] max-w-lg rounded-t-lg border-x border-t px-6 pt-5 pb-6"
        aria-describedby="feedback-sheet-description"
      >
        <SheetHeader className="p-0 pr-10 pb-2">
          <SheetTitle className="flex items-center gap-2 text-base">
            <MessageCircleIcon className="size-4 shrink-0 text-amber-500" />
            Why isn&apos;t this relevant?
          </SheetTitle>
          <SheetDescription id="feedback-sheet-description" className="text-xs">
            Pick a reason below or add your own.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-auto">
          {optionsLoading ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-28 rounded-md" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedOption(opt);
                    setCustomFeedback("");
                  }}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-left text-sm",
                    selectedOption === opt
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/50 hover:bg-muted",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="custom-feedback" className="text-muted-foreground text-xs font-medium">
              Or describe in your own words
            </label>
            <Textarea
              id="custom-feedback"
              placeholder="e.g. The post is about X but I'm looking for Y..."
              value={customFeedback}
              onChange={(e) => {
                setCustomFeedback(e.target.value);
                if (e.target.value.trim()) setSelectedOption(null);
              }}
              className="min-h-[72px] resize-none rounded-md text-sm"
              disabled={optionsLoading}
            />
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 border-t pt-4 pl-0!">
          <Button type="button" variant="outline" size="sm" onClick={closeSheet} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={!feedbackValue.trim() || isSubmitting || optionsLoading}
          >
            {isSubmitting ? "Sending..." : "Submit feedback"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default NotRelevantFeedbackSheet;
