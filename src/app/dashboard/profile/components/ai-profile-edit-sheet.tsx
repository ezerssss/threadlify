"use client";

import ky from "ky";
import { CheckIcon, LockIcon, Loader2Icon, SparklesIcon, XIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EDIT_PROFILE_URL, PROPOSE_PROFILE_EDIT_URL } from "@/constants/url";
import { toastError } from "@/lib/utils";
import { useAiProfileEditStore } from "@/stores/ai-profile-edit-store";
import { SubscriptionPlanEnum } from "@/types/subscription";
import { EDITABLE_PROFILE_FIELDS, EditableProfileFieldKey, EditUserProfileType } from "@/types/user";

import { SideBySideDiff } from "./text-diff-view";

type Plan = z.infer<typeof SubscriptionPlanEnum>;

const FIELD_LABELS: Record<EditableProfileFieldKey, string> = {
  description: "Description",
  audience: "Audience",
  growthStrategy: "Growth Strategy",
  replyTone: "Reply Tone",
  keywords: "Keywords",
  maxScrapeRecencyInMonths: "Max Recency",
  notes: "Notes",
};

function getChangedFields(current: EditUserProfileType, proposed: EditUserProfileType): EditableProfileFieldKey[] {
  const changed: EditableProfileFieldKey[] = [];
  for (const key of EDITABLE_PROFILE_FIELDS) {
    const a = current[key];
    const b = proposed[key];
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length || a.some((v, i) => v !== b[i])) changed.push(key);
    } else if (String(a) !== String(b)) {
      changed.push(key);
    }
  }
  return changed;
}

interface AiProfileEditSheetProps {
  readonly currentProfile: EditUserProfileType;
  readonly idToken: string | null;
  readonly onSuccess: (updated: EditUserProfileType) => void;
  readonly plan: Plan;
  readonly trigger?: React.ReactNode;
}

export function AiProfileEditSheet({ currentProfile, idToken, onSuccess, plan, trigger }: AiProfileEditSheetProps) {
  const canUseAiEdit = plan === "pro" || plan === "enterprise";
  const [open, setOpen] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const instruction = useAiProfileEditStore((s) => s.instruction);
  const step = useAiProfileEditStore((s) => s.step);
  const proposed = useAiProfileEditStore((s) => s.proposed);
  const changedFields = useAiProfileEditStore((s) => s.changedFields);
  const decisions = useAiProfileEditStore((s) => s.decisions);
  const setInstruction = useAiProfileEditStore((s) => s.setInstruction);
  const setProposedAndReview = useAiProfileEditStore((s) => s.setProposedAndReview);
  const setDecision = useAiProfileEditStore((s) => s.setDecision);
  const clearDecision = useAiProfileEditStore((s) => s.clearDecision);
  const resetStore = useAiProfileEditStore((s) => s.reset);

  const resetAndClose = useCallback(() => {
    resetStore();
    setOpen(false);
  }, [resetStore]);

  const buildMergedProfile = useCallback((): EditUserProfileType => {
    if (!proposed) return currentProfile;
    const merged = { ...currentProfile };
    for (const key of changedFields) {
      if (decisions[key] === "accepted") {
        (merged as Record<EditableProfileFieldKey, unknown>)[key] = proposed[key];
      }
    }
    return merged;
  }, [currentProfile, proposed, changedFields, decisions]);

  const acceptedCount = changedFields.filter((k) => decisions[k] === "accepted").length;
  const hasAccepted = acceptedCount > 0;

  const handlePropose = useCallback(async () => {
    const trimmed = instruction.trim();
    if (!trimmed || !idToken) {
      toast.error("Enter what you’d like to change and make sure you’re signed in.");
      return;
    }

    try {
      setIsProposing(true);
      const { proposed: nextProposed } = await ky
        .post(PROPOSE_PROFILE_EDIT_URL, {
          json: { currentProfile, instructions: trimmed },
          headers: { Authorization: `Bearer ${idToken}` },
          timeout: 120_000, // 2 min – AI can take a while
        })
        .json<{ proposed: EditUserProfileType }>();

      const changed = getChangedFields(currentProfile, nextProposed);
      if (changed.length === 0) {
        toast.info("No changes were suggested. Try being more specific.");
        return;
      }

      setProposedAndReview(nextProposed, changed);
      toast.success("Review the suggested changes below.");
    } catch (error) {
      toastError(error);
    } finally {
      setIsProposing(false);
    }
  }, [currentProfile, instruction, idToken]);

  const handleApply = useCallback(async () => {
    if (!idToken || !hasAccepted) return;
    const merged = buildMergedProfile();

    try {
      setIsSaving(true);
      await ky.post(EDIT_PROFILE_URL, {
        json: merged,
        headers: { Authorization: `Bearer ${idToken}` },
      });
      toast.success("Profile updated.");
      onSuccess(merged);
      resetAndClose();
    } catch (error) {
      toastError(error);
    } finally {
      setIsSaving(false);
    }
  }, [idToken, hasAccepted, buildMergedProfile, onSuccess, resetAndClose]);

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <SparklesIcon className="size-4" />
      Suggest edits with AI
    </Button>
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (v) setOpen(true);
        else setOpen(false);
      }}
    >
      <SheetTrigger asChild>{trigger ?? defaultTrigger}</SheetTrigger>
      <SheetContent side="right" className="bg-background flex w-full flex-col gap-0 border-l sm:max-w-xl">
        <SheetHeader className="shrink-0 px-6 pt-6 pr-12 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <SparklesIcon className="size-4" />
            {step === "input" ? "Suggest edits with AI" : "Review suggested changes"}
          </SheetTitle>
          <SheetDescription className="mt-1.5">
            {step === "input"
              ? "Describe what you’d like to change (e.g. “Make the description more formal” or “Add marketing as a keyword”). We’ll suggest edits for you to approve or discard."
              : "Review the changes below. You can approve to save or discard."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {step === "input" && (
            <div className="space-y-4">
              {!canUseAiEdit && (
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <LockIcon className="size-4" />
                  <AlertTitle>Pro or Enterprise only</AlertTitle>
                  <AlertDescription>
                    Suggest edits with AI is available on Pro and Enterprise plans. Upgrade to get AI-powered profile
                    suggestions—describe what you’d like to change and we’ll propose edits for you to review and
                    approve.
                  </AlertDescription>
                </Alert>
              )}
              <div className={canUseAiEdit ? "space-y-3" : "space-y-3 opacity-60"}>
                <div className="space-y-2">
                  <Label htmlFor="ai-edit-instruction">What would you like to change?</Label>
                  <Textarea
                    id="ai-edit-instruction"
                    placeholder="e.g. Make the tone more professional, add 'SaaS' to keywords, shorten the audience section..."
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    onFocus={(e) => {
                      const el = e.target;
                      el.setSelectionRange(el.value.length, el.value.length);
                    }}
                    rows={5}
                    className="resize-none"
                    disabled={isProposing || !canUseAiEdit}
                  />
                </div>
                <Button
                  onClick={handlePropose}
                  disabled={isProposing || !instruction.trim() || !canUseAiEdit}
                  className="w-full gap-2"
                >
                  {isProposing ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin" />
                      Generating suggestions…
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="size-4" />
                      Suggest edits
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "review" && proposed && (
            <div className="space-y-4">
              <Tabs defaultValue={changedFields[0]} className="w-full">
                <TabsList className="bg-muted/50 mb-4 w-full flex-wrap justify-start gap-1.5 p-1">
                  {changedFields.map((key) => (
                    <TabsTrigger key={key} value={key} className="data-[state=active]:bg-background">
                      {FIELD_LABELS[key]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {changedFields.map((key) => (
                  <TabsContent key={key} value={key} className="mt-4 space-y-3">
                    <div className="space-y-3">
                      <Label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                        {FIELD_LABELS[key]}
                      </Label>
                      <FieldDiffView field={key} current={currentProfile} proposed={proposed} />
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {decisions[key] === undefined ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setDecision(key, "accepted")}
                              className="gap-1.5"
                            >
                              <CheckIcon className="size-4" />
                              Accept
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setDecision(key, "discarded")}
                              className="gap-1.5"
                            >
                              <XIcon className="size-4" />
                              Discard
                            </Button>
                          </>
                        ) : (
                          <>
                            <span
                              className={
                                decisions[key] === "accepted"
                                  ? "inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                                  : "bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium"
                              }
                            >
                              {decisions[key] === "accepted" ? (
                                <CheckIcon className="size-4" />
                              ) : (
                                <XIcon className="size-4" />
                              )}
                              {decisions[key] === "accepted" ? "Accepted" : "Discarded"}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => clearDecision(key)}
                              className="h-7 text-xs"
                            >
                              Undo
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </div>

        {step === "review" && (
          <SheetFooter className="flex shrink-0 gap-2 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={isSaving} className="gap-2">
              <XIcon className="size-4" />
              Discard all
            </Button>
            <Button type="button" onClick={handleApply} disabled={isSaving || !hasAccepted} className="gap-2">
              {isSaving ? <Loader2Icon className="size-4 animate-spin" /> : <CheckIcon className="size-4" />}
              {hasAccepted ? `Apply ${acceptedCount} change${acceptedCount === 1 ? "" : "s"}` : "Apply changes"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

function FieldDiffView({
  field,
  current,
  proposed,
}: Readonly<{
  field: EditableProfileFieldKey;
  current: EditUserProfileType;
  proposed: EditUserProfileType;
}>) {
  const oldVal = current[field];
  const newVal = proposed[field];

  if (field === "keywords") {
    const oldArr = Array.isArray(oldVal) ? oldVal : [];
    const newArr = Array.isArray(newVal) ? newVal : [];
    const oldSet = new Set(oldArr);
    const newSet = new Set(newArr);
    return (
      <div className="grid w-full min-w-0 grid-cols-2 gap-3 overflow-x-hidden">
        <div className="min-w-0 space-y-1.5">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Current keywords</p>
          <div className="border-border bg-muted/20 flex w-full min-w-0 flex-wrap gap-1.5 rounded-md border p-3">
            {oldArr.length === 0 ? (
              <span className="text-muted-foreground text-sm">(none)</span>
            ) : (
              oldArr.map((kw, i) => (
                <Badge
                  key={`${i}-${kw}`}
                  variant="secondary"
                  className={
                    !newSet.has(kw)
                      ? "bg-red-500/20 whitespace-normal text-red-800 dark:bg-red-500/25 dark:text-red-200"
                      : "text-xs whitespace-normal"
                  }
                >
                  {kw}
                </Badge>
              ))
            )}
          </div>
        </div>
        <div className="min-w-0 space-y-1.5">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Proposed keywords</p>
          <div className="border-border bg-muted/20 flex w-full min-w-0 flex-wrap gap-1.5 rounded-md border p-3">
            {newArr.length === 0 ? (
              <span className="text-muted-foreground text-sm">(none)</span>
            ) : (
              newArr.map((kw, i) => (
                <Badge
                  key={`${i}-${kw}`}
                  variant="secondary"
                  className={
                    !oldSet.has(kw)
                      ? "bg-emerald-500/20 text-xs whitespace-normal text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-200"
                      : "text-xs whitespace-normal"
                  }
                >
                  {kw}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (field === "maxScrapeRecencyInMonths") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="border-border bg-muted/20 rounded-md border p-3">
          <p className="text-muted-foreground text-xs">Current</p>
          <p className="mt-1 font-medium">{String(oldVal)} month(s)</p>
        </div>
        <div className="border-border bg-muted/20 rounded-md border p-3">
          <p className="text-muted-foreground text-xs">Proposed</p>
          <p className="mt-1 font-medium text-emerald-700 dark:text-emerald-300">{String(newVal)} month(s)</p>
        </div>
      </div>
    );
  }

  const oldStr = typeof oldVal === "string" ? oldVal : String(oldVal ?? "");
  const newStr = typeof newVal === "string" ? newVal : String(newVal ?? "");

  return (
    <SideBySideDiff
      oldText={oldStr || "(empty)"}
      newText={newStr || "(empty)"}
      oldLabel="Current"
      newLabel="Proposed"
    />
  );
}
