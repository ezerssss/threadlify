"use client";

import ky, { HTTPError } from "ky";
import { BrainIcon, CheckCircle2Icon, Loader2Icon, SparklesIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import PersonaSubredditsDialog from "@/app/dashboard/karma-builder/_components/persona-subreddits-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { UpgradeOverlay } from "@/components/upgrade-overlay";
import {
  USER_PERSONA_CUSTOM_URL,
  USER_PERSONA_EDIT_URL,
  USER_PERSONA_PRESET_URL,
  USER_PERSONA_TASK_MARK_DONE_URL,
  USER_PERSONA_TASK_MARK_SKIP_URL,
} from "@/constants/url";
import usePersonaSubreddits from "@/hooks/use-persona-subreddits";
import usePersonaTasks, { type PersonaTaskWithId } from "@/hooks/use-persona-tasks";
import useUser from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import type { PersonaType } from "@/types/user";

type PersonaPreset = "gamer" | "techEnthusiast" | "bookLover" | "movieFan" | "random";

const PRESET_CONFIG: Record<
  PersonaPreset,
  { label: string; tagline: string; description: string; highlights: string[] }
> = {
  gamer: {
    label: "Gamer",
    tagline: "Indie titles, Steam backlog, and thoughtful game design hot takes.",
    description:
      "Perfect if you naturally hang out in gaming subs and want to look like a long-time, opinionated player.",
    highlights: [
      "Talks about game feel, balance, and story arcs — not just hype.",
      "Comments across r/gaming, r/patientgamers, and niche subreddits.",
      "Feels like a real human with a messy backlog and favorite genres.",
    ],
  },
  techEnthusiast: {
    label: "Tech enthusiast",
    tagline: "Builder energy, dev tools, SaaS, and startup culture.",
    description:
      "Best for people who live in dev, startup, or productivity subreddits and want credibility as a maker.",
    highlights: [
      "Has opinions on DX, tooling, and product trade-offs.",
      "Spends time in r/startups, r/SideProject, r/programming, and similar.",
      "Reads like someone who actually ships things, not a marketer.",
    ],
  },
  bookLover: {
    label: "Book lover",
    tagline: "Fiction, non‑fiction, note‑taking, and reading rituals.",
    description: "Great if you naturally talk about ideas, stories, and how you learn — from novels to business books.",
    highlights: [
      "Shares what they’re reading and why it matters to them.",
      "Comments in r/books, r/selfimprovement, r/productivity, and niche reading subs.",
      "Feels like a thoughtful person, not a quote bot.",
    ],
  },
  movieFan: {
    label: "Movie fan",
    tagline: "Film nerd energy: genres, directors, and long comment threads.",
    description: "Best if you love film, TV, and story breakdowns — and want karma from real, opinionated discussion.",
    highlights: [
      "Talks about pacing, character arcs, and favorite directors.",
      "Shows up in r/movies, r/television, r/TrueFilm, and fan communities.",
      "Reads like someone who’s been on Reddit for years.",
    ],
  },
  random: {
    label: "Random but grounded",
    tagline: "A messy, human mix of interests across multiple subreddits.",
    description:
      "Use this if you don’t want to niche down. Threadlify will generate a persona that feels human but varied.",
    highlights: [
      "Blends a few believable hobbies and internet habits.",
      "Comments across a spread of mainstream and niche subs.",
      "Designed to feel like a real, long‑time Redditor warming up an account.",
    ],
  },
};

function buildArraysFromCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

interface PersonaTasksColumnProps {
  readonly title: string;
  readonly description: string;
  readonly tasks: PersonaTaskWithId[];
  readonly onTaskClick: (task: PersonaTaskWithId) => void;
}

function PersonaTasksColumn({ title, description, tasks, onTaskClick }: PersonaTasksColumnProps) {
  const [showInactive, setShowInactive] = useState(false);

  const hasTasks = tasks.length > 0;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const skippedCount = tasks.filter((t) => t.status === "skipped").length;

  // Pending tasks first, then skipped, then done (optionally shown)
  const visibleTasks = tasks
    .filter((t) => (showInactive ? true : t.status === "pending"))
    .slice()
    .sort((a, b) => {
      const order = { pending: 0, skipped: 1, done: 2 } as const;
      return order[a.status] - order[b.status];
    });

  return (
    <div className="bg-card flex flex-col gap-2 rounded-md border p-3 shadow-xs">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-[11px] tracking-wide uppercase">{title}</p>
          {hasTasks && (
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-[2px] text-[10px] font-medium">
              {pendingCount} pending
              {skippedCount > 0 && ` • ${skippedCount} skipped`}
              {doneCount > 0 && ` • ${doneCount} done`}
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-[13px] leading-snug">{description}</p>
        {hasTasks && (
          <p className="text-muted-foreground text-[11px]">
            <span className="font-medium">{tasks.length}</span> task
            {tasks.length === 1 ? "" : "s"} total
          </p>
        )}
      </div>

      {!hasTasks && (
        <p className="text-muted-foreground mt-1 text-xs">
          No tasks for this type yet. As Threadlify learns more about your persona, we&apos;ll add suggestions here.
        </p>
      )}

      {hasTasks && (
        <>
          <ul className="text-muted-foreground mt-1 space-y-1.5 text-sm">
            {visibleTasks.map((task) => {
              const isDone = task.status === "done";
              const isSkipped = task.status === "skipped";
              const isPending = task.status === "pending";

              let primaryLabel: string;
              let secondaryLabel: string | null = null;
              if (task.type === "post") {
                primaryLabel = `Create a new post in r/${task.subreddit}`;
                secondaryLabel = task.recommendedPost.title;
              } else if (task.type === "comment") {
                primaryLabel = `Comment in r/${task.subreddit}`;
                secondaryLabel = task.post.title;
              } else {
                primaryLabel = `Upvote in r/${task.subreddit}`;
                secondaryLabel = task.post.title;
              }

              return (
                <li key={task.id}>
                  <button
                    type="button"
                    className={cn(
                      "bg-card w-full rounded-md border px-2 py-1.5 text-left shadow-xs transition-colors",
                      "flex flex-col gap-0.5",
                      "hover:border-primary/50 hover:bg-accent/40",
                      isDone &&
                        "border-emerald-300/70 bg-emerald-50/40 text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/20 dark:text-emerald-200",
                      isSkipped && "border-muted-foreground/30 bg-muted/40 text-muted-foreground line-through",
                    )}
                    onClick={() => onTaskClick(task)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onTaskClick(task);
                      }
                    }}
                  >
                    <span className={cn("block text-[13px]", isPending && "font-medium")}>{primaryLabel}</span>
                    {secondaryLabel && (
                      <span className="text-muted-foreground mt-0.5 line-clamp-1 block text-xs">{secondaryLabel}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {(doneCount > 0 || skippedCount > 0) && (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground mt-1 self-end text-[11px] underline-offset-2 hover:underline"
              onClick={() => setShowInactive((prev) => !prev)}
            >
              {showInactive ? "Hide skipped & done" : `Show skipped & done (${skippedCount + doneCount})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function KarmaBuilderPage() {
  const { userData, idToken, claims, isLoading } = useUser();
  const { subreddits: personaSubreddits } = usePersonaSubreddits();
  const { tasks: personaTasks } = usePersonaTasks();

  const [isSubmittingPreset, setIsSubmittingPreset] = useState(false);
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [pendingPreset, setPendingPreset] = useState<PersonaPreset | null>(null);
  const [customDescription, setCustomDescription] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editPersona, setEditPersona] = useState<{
    ageRange: string;
    experienceLevel: string;
    opinionStrength: string;
    humorLevel: string;
    tonePersonality: string;
    writingStyle: string;
    engagementStyle: string;
    likes: string;
    dislikes: string;
    hobbies: string;
    backstory: string;
  } | null>(null);

  const isAdmin = !!claims?.isAdmin;

  const persona: PersonaType | null = userData?.persona ?? null;
  const hasSelectedPreset = !!userData?.selectedPersonaPreset;
  const [activeTask, setActiveTask] = useState<PersonaTaskWithId | null>(null);
  const [taskActionLoading, setTaskActionLoading] = useState<string | null>(null);

  const isKarmaBuilderLocked = useMemo(() => {
    if (!userData) return false;
    if (isAdmin) return false;

    const { subscription } = userData;
    const isProOrEnterprise = subscription.plan === "pro" || subscription.plan === "enterprise";
    const isActive = subscription.status === "active";

    return !(isProOrEnterprise && isActive);
  }, [userData, isAdmin]);

  function ensureCanUseFeature() {
    if (!userData || !idToken) {
      toast.error("You need to be signed in to use Karma Builder.");
      return false;
    }

    if (isKarmaBuilderLocked) {
      toast.error("Karma Builder is available for active Pro and Enterprise plans.");
      return false;
    }

    return true;
  }

  async function handlePresetClick(preset: PersonaPreset) {
    if (!ensureCanUseFeature()) return;
    if (userData?.persona) {
      toast.error("You already have a persona. You can edit it below.");
      return;
    }
    if (hasSelectedPreset) {
      toast.error("You already selected a preset. Wait for the persona to be generated, then edit it below if needed.");
      return;
    }

    try {
      setIsSubmittingPreset(true);
      setPendingPreset(preset);

      await ky
        .post(USER_PERSONA_PRESET_URL, {
          json: { preset },
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
        .json();

      toast.success("Persona generation started from preset.");
    } catch (error: unknown) {
      setPendingPreset(null);
      const httpError = error as HTTPError;
      const status = httpError?.response?.status;
      if (status === 409) {
        toast.error("Persona already exists for this user.");
      } else if (status === 402 || status === 403) {
        toast.error("Your current plan can't use Karma Builder. Upgrade to Pro or Enterprise.");
      } else {
        toast.error("Failed to start persona generation. Please try again.");
      }
    } finally {
      setIsSubmittingPreset(false);
    }
  }

  async function handleCustomSubmit() {
    if (!ensureCanUseFeature()) return;
    if (!customDescription.trim()) {
      toast.error("Tell Threadlify who this persona should be.");
      return;
    }
    if (userData?.persona) {
      toast.error("You already have a persona. You can edit it below.");
      return;
    }
    if (hasSelectedPreset) {
      toast.error("You already selected a preset. Custom generation is disabled for this persona.");
      return;
    }

    try {
      setIsSubmittingCustom(true);

      await ky
        .post(USER_PERSONA_CUSTOM_URL, {
          json: { description: customDescription.trim() },
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
        .json();

      toast.success("Custom persona generation started.");
      setPendingPreset("random"); // just to show the "processing" UI; backend keeps preset null/custom.
    } catch (error: unknown) {
      const httpError = error as HTTPError;
      const status = httpError?.response?.status;
      if (status === 409) {
        toast.error("Persona already exists for this user.");
      } else if (status === 402 || status === 403) {
        toast.error("Your current plan can't use Karma Builder. Upgrade to Pro or Enterprise.");
      } else {
        toast.error("Failed to start persona generation. Please try again.");
      }
    } finally {
      setIsSubmittingCustom(false);
    }
  }

  function startEditing(current: PersonaType) {
    setIsEditing(true);
    setEditPersona({
      ageRange: current.ageRange,
      experienceLevel: current.experienceLevel,
      opinionStrength: current.opinionStrength,
      humorLevel: current.humorLevel,
      tonePersonality: current.tonePersonality.join(", "),
      writingStyle: current.writingStyle.join(", "),
      engagementStyle: current.engagementStyle.join(", "),
      likes: current.likes.join(", "),
      dislikes: current.dislikes.join(", "),
      hobbies: current.hobbies.join(", "),
      backstory: current.backstory,
    });
  }

  async function handleEditSave() {
    if (!ensureCanUseFeature() || !persona || !editPersona) return;

    try {
      setEditLoading(true);

      const payload: PersonaType = {
        ageRange: editPersona.ageRange.trim(),
        experienceLevel: editPersona.experienceLevel.trim(),
        opinionStrength: editPersona.opinionStrength.trim(),
        humorLevel: editPersona.humorLevel.trim(),
        tonePersonality: buildArraysFromCommaSeparated(editPersona.tonePersonality),
        writingStyle: buildArraysFromCommaSeparated(editPersona.writingStyle),
        engagementStyle: buildArraysFromCommaSeparated(editPersona.engagementStyle),
        likes: buildArraysFromCommaSeparated(editPersona.likes),
        dislikes: buildArraysFromCommaSeparated(editPersona.dislikes),
        hobbies: buildArraysFromCommaSeparated(editPersona.hobbies),
        backstory: editPersona.backstory.trim(),
      };

      await ky.post(USER_PERSONA_EDIT_URL, {
        json: { persona: payload },
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      toast.success("Persona updated.");
      setIsEditing(false);
    } catch (error: unknown) {
      const httpError = error as HTTPError;
      const status = httpError?.response?.status;
      if (status === 400) {
        toast.error("Persona is not created yet or payload invalid.");
      } else {
        toast.error("Failed to update persona. Please try again.");
      }
    } finally {
      setEditLoading(false);
    }
  }

  const showSkeleton = isLoading && !userData;

  const showPresetSelector = !persona;

  async function handleTaskAction(taskId: string, action: "done" | "skip") {
    if (!ensureCanUseFeature()) return;

    try {
      setTaskActionLoading(taskId + action);

      const url = action === "done" ? USER_PERSONA_TASK_MARK_DONE_URL : USER_PERSONA_TASK_MARK_SKIP_URL;

      await ky.post(url, {
        json: { taskId },
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (action === "done") {
        toast.success("Task marked as done.");
      } else {
        toast.success("Task skipped.");
      }
      // Close the popup for both done and skip
      setActiveTask((prev) => (prev && prev.id === taskId ? null : prev));
    } catch {
      toast.error("Failed to update task. Please try again.");
    } finally {
      setTaskActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {showSkeleton && (
        <div className="space-y-4">
          <div className="bg-muted h-6 w-40 animate-pulse rounded" />
          <div className="bg-muted h-40 w-full animate-pulse rounded" />
        </div>
      )}

      {!showSkeleton && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <h1 className="flex items-center gap-2 text-2xl font-semibold">
                <SparklesIcon className="text-primary h-6 w-6" />
                Karma builder
              </h1>
              <p className="text-muted-foreground max-w-3xl text-sm">
                Threadlify uses a &quot;warm-up&quot; persona to guide the{" "}
                <span className="font-medium">suggestions it gives you</span> for what to post, comment, and upvote so
                your account looks like a real human who&apos;s been around for a while. You still do all actions
                yourself — this page just helps you design that guide.
              </p>
            </div>
            <Badge variant="outline" className="gap-1 whitespace-nowrap">
              <BrainIcon className="h-4 w-4" />
              Reddit warm-up guide
            </Badge>
          </div>

          {!userData && !isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Missing user data</CardTitle>
                <CardDescription>We couldn&apos;t load your account. Try refreshing the page.</CardDescription>
              </CardHeader>
            </Card>
          )}

          {userData && isKarmaBuilderLocked && (
            <UpgradeOverlay
              title="Upgrade to use Karma Builder"
              description="Karma Builder is available on active Pro and Enterprise plans. Upgrade to generate a warm-up persona and unlock guided Reddit actions."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle>Persona presets</CardTitle>
                    <CardDescription>Pick a starting archetype for your Reddit presence.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {Object.entries(PRESET_CONFIG).map(([key, value]) => (
                        <div key={key} className="bg-muted/60 flex flex-col gap-1 rounded-md border px-3 py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{value.label}</span>
                          </div>
                          <p className="text-muted-foreground text-xs">{value.tagline}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle>Persona details</CardTitle>
                    <CardDescription>Age range, tone, likes, dislikes, and backstory.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Once unlocked, Threadlify will generate a Reddit-native persona that explains how you talk, what
                      you care about, and which subreddits you blend into. You&apos;ll be able to review and edit it
                      anytime.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </UpgradeOverlay>
          )}

          {userData && !isKarmaBuilderLocked && (
            <>
              {showPresetSelector && (
                <section className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Choose how you want to show up on Reddit</CardTitle>
                      <CardDescription>
                        Pick a preset that matches your vibe, or go custom. This doesn&apos;t hard-lock what you can
                        post — it just guides how Threadlify warms up your account so it feels consistent and human.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                      {(Object.keys(PRESET_CONFIG) as PersonaPreset[]).map((key) => {
                        const config = PRESET_CONFIG[key];
                        const isPending = pendingPreset === key || userData.selectedPersonaPreset === key;

                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={isSubmittingPreset || isSubmittingCustom || hasSelectedPreset}
                            onClick={() => handlePresetClick(key)}
                            className={cn(
                              "bg-card hover:bg-accent group flex flex-col items-start gap-2 rounded-md border p-3 text-left transition-colors",
                              isPending && "border-primary/70 ring-primary/40 ring-2",
                            )}
                          >
                            <div className="flex w-full items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{config.label}</span>
                              </div>
                              {isPending ? (
                                <span className="text-primary flex items-center gap-1 text-xs font-medium">
                                  <Loader2Icon className="h-3 w-3 animate-spin" />
                                  Generating...
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-[11px] tracking-wide uppercase">
                                  Warm-up guide
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm">{config.tagline}</p>
                            <p className="text-muted-foreground/90 text-xs leading-snug">{config.description}</p>
                            <ul className="text-muted-foreground mt-1 space-y-0.5 text-[11px]">
                              {config.highlights.map((item) => (
                                <li key={item} className="flex items-start gap-1.5">
                                  <span className="bg-primary/60 mt-[3px] h-1.5 w-1.5 rounded-full" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </button>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Or write your own persona</CardTitle>
                      <CardDescription>
                        Describe the human behind the account: how they talk, what they care about, what subreddits they
                        live in. Threadlify will turn this into a structured warm-up persona.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder="Example: 29-year-old indie dev who ships small SaaS tools, hangs out in r/startups, r/SideProject, r/webdev, and occasionally posts about running and coffee."
                        rows={6}
                        disabled={hasSelectedPreset}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-muted-foreground max-w-xs text-xs">
                          We&apos;ll only use this to generate your Reddit warm-up persona. You can refine the details
                          after the first version is created.
                          {hasSelectedPreset &&
                            " A preset is already selected, so custom generation is disabled for this persona."}
                        </p>
                        <Button
                          size="sm"
                          onClick={handleCustomSubmit}
                          disabled={isSubmittingCustom || isSubmittingPreset || hasSelectedPreset}
                        >
                          {isSubmittingCustom && <Loader2Icon className="mr-2 h-3 w-3 animate-spin" />}
                          Generate from custom description
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {persona && (
                <section className="space-y-5">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                      <div className="space-y-1">
                        <CardTitle>Your Reddit warm-up persona</CardTitle>
                        <CardDescription>
                          This is the internal guide Threadlify uses when it recommends{" "}
                          <span className="font-medium">tasks for you to do</span> (posts, comments, and upvotes) so
                          your account looks like a consistent, long-time Redditor.
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2Icon className="h-3 w-3 text-emerald-500" />
                          Persona active
                        </Badge>
                        {userData?.selectedPersonaPreset && (
                          <span className="text-muted-foreground text-[11px]">
                            Based on preset: <span className="font-medium">{userData.selectedPersonaPreset}</span>
                          </span>
                        )}
                        {personaSubreddits.length > 0 && (
                          <span className="text-muted-foreground text-[11px]">
                            Subreddits:{" "}
                            {personaSubreddits
                              .slice(0, 2)
                              .map((s) => `r/${s}`)
                              .join(", ")}
                            {personaSubreddits.length > 2 && `, +${personaSubreddits.length - 2} more`}
                          </span>
                        )}
                        <PersonaSubredditsDialog />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!isEditing && (
                        <>
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Profile</p>
                              <p className="text-sm font-medium">
                                {persona.ageRange} • {persona.experienceLevel}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                Opinion strength: <span className="font-medium">{persona.opinionStrength}</span> ·
                                Humor: <span className="font-medium">{persona.humorLevel}</span>
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Tone</p>
                              <p className="text-sm">{persona.tonePersonality.join(", ") || "—"}</p>
                              <p className="text-muted-foreground text-xs">
                                Writing: {persona.writingStyle.join(", ") || "—"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Engagement</p>
                              <p className="text-sm">{persona.engagementStyle.join(", ") || "—"}</p>
                            </div>
                          </div>

                          <Separator />

                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Likes</p>
                              <p className="text-sm leading-snug">
                                {persona.likes.length > 0 ? persona.likes.join(", ") : "—"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Dislikes</p>
                              <p className="text-sm leading-snug">
                                {persona.dislikes.length > 0 ? persona.dislikes.join(", ") : "—"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Hobbies</p>
                              <p className="text-sm leading-snug">
                                {persona.hobbies.length > 0 ? persona.hobbies.join(", ") : "—"}
                              </p>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-1">
                            <p className="text-muted-foreground text-[11px] tracking-wide uppercase">Backstory</p>
                            <p className="text-sm leading-snug whitespace-pre-wrap">{persona.backstory}</p>
                          </div>

                          <div className="flex justify-end">
                            <Button size="sm" variant="outline" onClick={() => startEditing(persona)}>
                              Edit persona
                            </Button>
                          </div>
                        </>
                      )}

                      {isEditing && editPersona && (
                        <div className="space-y-4">
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-1">
                              <label className="text-muted-foreground text-[11px] tracking-wide uppercase">
                                Age range
                              </label>
                              <Input
                                value={editPersona.ageRange}
                                onChange={(e) => setEditPersona({ ...editPersona, ageRange: e.target.value })}
                                placeholder="e.g. 26-34"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-muted-foreground text-[11px] tracking-wide uppercase">
                                Experience level
                              </label>
                              <Input
                                value={editPersona.experienceLevel}
                                onChange={(e) => setEditPersona({ ...editPersona, experienceLevel: e.target.value })}
                                placeholder="e.g. Mid-level indie dev"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-muted-foreground text-[11px] tracking-wide uppercase">
                                Opinion strength
                              </label>
                              <Input
                                value={editPersona.opinionStrength}
                                onChange={(e) => setEditPersona({ ...editPersona, opinionStrength: e.target.value })}
                                placeholder="e.g. Calm but opinionated"
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-1">
                              <label className="text-muted-foreground text-[11px] tracking-wide uppercase">
                                Humor level
                              </label>
                              <Input
                                value={editPersona.humorLevel}
                                onChange={(e) => setEditPersona({ ...editPersona, humorLevel: e.target.value })}
                                placeholder="e.g. Dry, occasional memes"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-muted-foreground text-[11px] tracking-wide uppercase">
                                Tone personality (comma separated)
                              </label>
                              <Input
                                value={editPersona.tonePersonality}
                                onChange={(e) => setEditPersona({ ...editPersona, tonePersonality: e.target.value })}
                                placeholder="e.g. curious, thoughtful, casual"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-muted-foreground text-[11px] tracking-wide uppercase">
                                Writing style (comma separated)
                              </label>
                              <Input
                                value={editPersona.writingStyle}
                                onChange={(e) => setEditPersona({ ...editPersona, writingStyle: e.target.value })}
                                placeholder="e.g. short, example-driven, story-focused"
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-1">
                              <label className="text-muted-foreground text-[11px] tracking-wide uppercase">
                                Engagement style (comma separated)
                              </label>
                              <Input
                                value={editPersona.engagementStyle}
                                onChange={(e) => setEditPersona({ ...editPersona, engagementStyle: e.target.value })}
                                placeholder="e.g. asks follow-up questions, shares examples"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-muted-foreground text-[11px] tracking-wide uppercase">
                                Likes (comma separated)
                              </label>
                              <Input
                                value={editPersona.likes}
                                onChange={(e) => setEditPersona({ ...editPersona, likes: e.target.value })}
                                placeholder="e.g. indie games, coffee, side projects"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-muted-foreground text-[11px] tracking-wide uppercase">
                                Dislikes (comma separated)
                              </label>
                              <Input
                                value={editPersona.dislikes}
                                onChange={(e) => setEditPersona({ ...editPersona, dislikes: e.target.value })}
                                placeholder="e.g. clickbait, low-effort posts"
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                              <label className="text-muted-foreground text-[11px] tracking-wide uppercase">
                                Hobbies (comma separated)
                              </label>
                              <Input
                                value={editPersona.hobbies}
                                onChange={(e) => setEditPersona({ ...editPersona, hobbies: e.target.value })}
                                placeholder="e.g. running, reading, tinkering with apps"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-muted-foreground text-[11px] tracking-wide uppercase">
                                Backstory
                              </label>
                              <Textarea
                                value={editPersona.backstory}
                                onChange={(e) => setEditPersona({ ...editPersona, backstory: e.target.value })}
                                rows={4}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={editLoading}
                              onClick={() => {
                                setIsEditing(false);
                                setEditPersona(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleEditSave} disabled={editLoading}>
                              {editLoading && <Loader2Icon className="mr-2 h-3 w-3 animate-spin" />}
                              Save changes
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <section className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Karma tasks for this persona</CardTitle>
                        <CardDescription>
                          These are <span className="font-medium">suggested tasks for you</span> to do on Reddit —
                          posts, comments, and upvotes you complete manually so this persona feels like a real human
                          warming up an account.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-3 md:grid-cols-3">
                        <PersonaTasksColumn
                          title="Post"
                          description="Short prompts for what kind of new posts this persona should create."
                          tasks={personaTasks.filter((task) => task.type === "post")}
                          onTaskClick={setActiveTask}
                        />
                        <PersonaTasksColumn
                          title="Comment"
                          description="Replies this persona should leave on existing threads."
                          tasks={personaTasks.filter((task) => task.type === "comment")}
                          onTaskClick={setActiveTask}
                        />
                        <PersonaTasksColumn
                          title="Upvote"
                          description="Where this persona should quietly upvote to make the history look natural."
                          tasks={personaTasks.filter((task) => task.type === "upvote")}
                          onTaskClick={setActiveTask}
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">How Karma Builder is used</CardTitle>
                      </CardHeader>
                      <CardContent className="text-muted-foreground space-y-2 text-xs">
                        <p>
                          Your persona is <span className="font-medium">never shown publicly</span>. It only guides how
                          Threadlify suggests tasks and how AI phrases draft ideas —{" "}
                          <span className="font-medium">Threadlify never auto-posts or comments for you</span>.
                        </p>
                        <p>
                          The goal is to earn karma and trust{" "}
                          <span className="font-medium">without feeling like a bot</span> so you can later plug in your
                          product naturally.
                        </p>
                      </CardContent>
                    </Card>
                  </section>

                  {activeTask && (
                    <Dialog
                      open={!!activeTask}
                      onOpenChange={(open) => {
                        if (!open) {
                          setActiveTask(null);
                        }
                      }}
                    >
                      <DialogContent className="bg-card max-w-xl">
                        <DialogHeader>
                          <DialogTitle>
                            {activeTask.type === "post" && `Create a post in r/${activeTask.subreddit}`}
                            {activeTask.type === "comment" && `Comment task in r/${activeTask.subreddit}`}
                            {activeTask.type === "upvote" && `Upvote task in r/${activeTask.subreddit}`}
                          </DialogTitle>
                          <DialogDescription>
                            This is a suggestion for what you can do on Reddit. You&apos;ll complete the action
                            yourself; Threadlify is just giving you the brief.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          {activeTask.type === "post" && (
                            <>
                              <div className="space-y-1">
                                <p className="text-muted-foreground text-xs tracking-wide uppercase">Suggested title</p>
                                <p className="text-sm font-medium">{activeTask.recommendedPost.title}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-muted-foreground text-xs tracking-wide uppercase">Suggested body</p>
                                <p className="text-sm whitespace-pre-wrap">{activeTask.recommendedPost.body}</p>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(activeTask.recommendedPost.body);
                                      toast.success("Copied post body to clipboard.");
                                    } catch {
                                      toast.error("Failed to copy post body to clipboard.");
                                    }
                                    window.open(`https://reddit.com/r/${activeTask.subreddit}`, "_blank", "noreferrer");
                                  }}
                                >
                                  Copy & open r/{activeTask.subreddit}
                                </Button>
                              </div>
                            </>
                          )}

                          {activeTask.type === "comment" && (
                            <>
                              <div className="space-y-1">
                                <p className="text-muted-foreground text-xs tracking-wide uppercase">Target post</p>
                                <p className="text-sm font-medium">{activeTask.post.title}</p>
                              </div>
                              {activeTask.targetComment && (
                                <div className="bg-muted/40 space-y-1 rounded-md p-2">
                                  <p className="text-muted-foreground text-[11px] tracking-wide uppercase">
                                    Target comment
                                  </p>
                                  <p className="text-xs whitespace-pre-wrap">{activeTask.targetComment.body}</p>
                                  <p className="text-muted-foreground mt-1 text-[11px]">
                                    — {activeTask.targetComment.author}
                                  </p>
                                </div>
                              )}
                              <div className="space-y-1">
                                <p className="text-muted-foreground text-xs tracking-wide uppercase">Suggested reply</p>
                                <p className="text-sm whitespace-pre-wrap">{activeTask.recommendedReply}</p>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(activeTask.recommendedReply);
                                      toast.success("Copied reply to clipboard.");
                                    } catch {
                                      toast.error("Failed to copy reply to clipboard.");
                                    }
                                    const url = activeTask.targetComment?.url ?? activeTask.post.url;
                                    window.open(url, "_blank", "noreferrer");
                                  }}
                                >
                                  Copy & open on Reddit
                                </Button>
                              </div>
                            </>
                          )}

                          {activeTask.type === "upvote" && (
                            <>
                              <div className="space-y-1">
                                <p className="text-muted-foreground text-xs tracking-wide uppercase">Post</p>
                                <p className="text-sm font-medium">{activeTask.post.title}</p>
                                <p className="text-muted-foreground text-xs">
                                  r/{activeTask.subreddit} • score {activeTask.post.score}
                                </p>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(activeTask.post.url, "_blank", "noreferrer")}
                                >
                                  Open post on Reddit
                                </Button>
                              </div>
                            </>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => setActiveTask(null)}>
                              Close
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={activeTask.status !== "pending" || taskActionLoading === activeTask.id + "skip"}
                              onClick={() => handleTaskAction(activeTask.id, "skip")}
                            >
                              {taskActionLoading === activeTask.id + "skip" && (
                                <Loader2Icon className="mr-2 h-3 w-3 animate-spin" />
                              )}
                              Skip task
                            </Button>
                            <Button
                              size="sm"
                              disabled={activeTask.status !== "pending" || taskActionLoading === activeTask.id + "done"}
                              onClick={() => handleTaskAction(activeTask.id, "done")}
                            >
                              {taskActionLoading === activeTask.id + "done" && (
                                <Loader2Icon className="mr-2 h-3 w-3 animate-spin" />
                              )}
                              Mark as done
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
