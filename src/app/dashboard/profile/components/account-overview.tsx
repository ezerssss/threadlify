"use client";

import ky from "ky";
import { EditIcon, InfoIcon, LinkIcon, PlusIcon, SaveIcon, TrashIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { parse } from "tldts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EDIT_PROFILE_URL } from "@/constants/url";
import useRelevantPostsCount from "@/hooks/use-relevant-posts-count";
import useUser from "@/hooks/use-user";
import { toastError } from "@/lib/utils";
import { useKanbanStore } from "@/stores/kanban";
import { EditUserProfileType } from "@/types/user";

import ManageSubredditsDialog from "./manage-subreddits-dialog";
import { AccountOverViewSkeleton } from "./skeleton/account-overview-skeleton";

export function AccountOverview() {
  const { userData, idToken } = useUser();
  const { count: relevantPostsCount, isLoading: isLoadingPostsCount } = useRelevantPostsCount();
  const [isLoading, setIsLoading] = useState(false);
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const validTabValues = new Set(["description", "audience", "strategy", "replyTone", "keywords", "recency"]);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof globalThis.window === "undefined") return "description";
    const hash = globalThis.window.location.hash.slice(1);
    return hash && validTabValues.has(hash) ? hash : "description";
  });
  const [formData, setFormData] = useState<EditUserProfileType>({
    name: "",
    description: "",
    audience: "",
    growthStrategy: "",
    replyTone: "",
    keywords: [],
    maxScrapeRecencyInMonths: 1,
  });
  const [editData, setEditData] = useState<EditUserProfileType>({
    name: "",
    description: "",
    audience: "",
    growthStrategy: "",
    replyTone: "",
    keywords: [],
    maxScrapeRecencyInMonths: 1,
  });
  const originalDataRef = useRef<EditUserProfileType | null>(null);
  const setActivePost = useKanbanStore((state) => state.setActivePost);
  const setActivePostIndex = useKanbanStore((state) => state.setActivePostIndex);
  const setIsOpen = useKanbanStore((state) => state.setIsOpen);

  // Sync active tab from URL hash (e.g. /dashboard/profile#replyTone)
  useEffect(() => {
    const syncFromHash = () => {
      const hash = globalThis.window.location.hash.slice(1);
      if (hash && validTabValues.has(hash)) {
        setActivePost(null);
        setActivePostIndex(null);
        setIsOpen(false);
        setActiveTab(hash);
      }
    };
    syncFromHash();
    globalThis.window.addEventListener("hashchange", syncFromHash);
    return () => globalThis.window.removeEventListener("hashchange", syncFromHash);
  }, []);

  // Sync form data with userData when it changes
  useEffect(() => {
    if (userData?.profile) {
      const { name, profile, strategy, replyTone, maxScrapeRecencyInMonths } = userData;
      const { description, audience, keywords } = profile;
      const initialData: EditUserProfileType = {
        name,
        description,
        audience,
        growthStrategy: strategy,
        replyTone,
        keywords: [...keywords],
        maxScrapeRecencyInMonths,
      };
      setFormData(initialData);
      originalDataRef.current = initialData;
    }
  }, [userData]);

  if (!userData?.profile) {
    return <AccountOverViewSkeleton />;
  }

  const { name, url, subscription } = userData;
  const { plan, periodEnd } = subscription;

  const parsedUrl = parse(url).domain;

  function handleEdit(tab: string) {
    setEditData({ ...formData });
    setEditingTab(tab);
  }

  function handleCancel() {
    setFormData({ ...(originalDataRef.current ?? formData) });
    setEditingTab(null);
  }

  async function handleSave() {
    if (isLoading || !editingTab) {
      return;
    }

    try {
      setIsLoading(true);
      if (!idToken) {
        throw new Error("Your are unauthorized to do this action.");
      }

      await ky.post(EDIT_PROFILE_URL, {
        json: editData,
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      toast.success("Successfully updated profile.");
      // Update form data and original data ref after successful save
      setFormData({ ...editData });
      originalDataRef.current = { ...editData };
      setEditingTab(null);
    } catch (error) {
      toastError(error);
    } finally {
      setIsLoading(false);
    }
  }

  function updateEditField<K extends keyof EditUserProfileType>(field: K, value: EditUserProfileType[K]) {
    setEditData((prev) => ({ ...prev, [field]: value }));
  }

  function addKeyword() {
    updateEditField("keywords", [...editData.keywords, ""]);
  }

  function updateKeyword(index: number, value: string) {
    const updated = [...editData.keywords];
    updated[index] = value;
    updateEditField("keywords", updated);
  }

  function removeKeyword(index: number) {
    updateEditField(
      "keywords",
      editData.keywords.filter((_, i) => i !== index),
    );
  }

  return (
    <Card className="overflow-hidden shadow-xs">
      <CardHeader className="flex flex-col items-start gap-3">
        <div className="flex w-full items-end justify-between">
          <CardTitle>My Profile</CardTitle>
          <ManageSubredditsDialog />
        </div>
        <CardDescription>
          Your auto-generated profile, growth strategy, and other relevant information in one view.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="mb-2 text-xl font-semibold">{name}</h3>
              <Link
                href={url}
                target="_blank"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
              >
                <LinkIcon size={14} />
                {parsedUrl}
              </Link>
            </div>
          </div>

          <Separator />

          {/* Tabs for Editing */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v);
              if (typeof globalThis.window !== "undefined") globalThis.window.location.hash = v;
            }}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger
                value="description"
                disabled={isLoading || editingTab !== null}
                className="data-[state=active]:bg-white"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="audience"
                disabled={isLoading || editingTab !== null}
                className="data-[state=active]:bg-white"
              >
                Audience
              </TabsTrigger>
              <TabsTrigger
                value="strategy"
                disabled={isLoading || editingTab !== null}
                className="data-[state=active]:bg-white"
              >
                Growth Strategy
              </TabsTrigger>
              <TabsTrigger
                value="replyTone"
                disabled={isLoading || editingTab !== null}
                className="data-[state=active]:bg-white"
              >
                Reply Tone
              </TabsTrigger>
              <TabsTrigger
                value="keywords"
                disabled={isLoading || editingTab !== null}
                className="data-[state=active]:bg-white"
              >
                Keywords
              </TabsTrigger>
              <TabsTrigger
                value="recency"
                disabled={isLoading || editingTab !== null}
                className="data-[state=active]:bg-white"
              >
                Max Recency
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Description</Label>
                  {editingTab === "description" ? (
                    <div className="flex gap-2">
                      <Button onClick={handleCancel} variant="outline" size="sm" disabled={isLoading}>
                        <XIcon className="mr-2 size-4" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} size="sm" disabled={isLoading}>
                        <SaveIcon className="mr-2 size-4" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => handleEdit("description")} variant="outline" size="sm">
                      <EditIcon className="mr-2 size-4" />
                      Edit
                    </Button>
                  )}
                </div>
                {editingTab === "description" ? (
                  <Textarea
                    autoFocus
                    value={editData.description}
                    onChange={(e) => updateEditField("description", e.target.value)}
                    rows={6}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{formData.description}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="audience" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Audience</Label>
                  {editingTab === "audience" ? (
                    <div className="flex gap-2">
                      <Button onClick={handleCancel} variant="outline" size="sm" disabled={isLoading}>
                        <XIcon className="mr-2 size-4" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} size="sm" disabled={isLoading}>
                        <SaveIcon className="mr-2 size-4" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => handleEdit("audience")} variant="outline" size="sm">
                      <EditIcon className="mr-2 size-4" />
                      Edit
                    </Button>
                  )}
                </div>
                {editingTab === "audience" ? (
                  <Textarea
                    autoFocus
                    value={editData.audience}
                    onChange={(e) => updateEditField("audience", e.target.value)}
                    rows={6}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{formData.audience}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Growth Strategy</Label>
                  {editingTab === "strategy" ? (
                    <div className="flex gap-2">
                      <Button onClick={handleCancel} variant="outline" size="sm" disabled={isLoading}>
                        <XIcon className="mr-2 size-4" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} size="sm" disabled={isLoading}>
                        <SaveIcon className="mr-2 size-4" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => handleEdit("strategy")} variant="outline" size="sm">
                      <EditIcon className="mr-2 size-4" />
                      Edit
                    </Button>
                  )}
                </div>
                {editingTab === "strategy" ? (
                  <Textarea
                    autoFocus
                    value={editData.growthStrategy}
                    onChange={(e) => updateEditField("growthStrategy", e.target.value)}
                    rows={6}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{formData.growthStrategy}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="replyTone" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Reply Tone</Label>
                  {editingTab === "replyTone" ? (
                    <div className="flex gap-2">
                      <Button onClick={handleCancel} variant="outline" size="sm" disabled={isLoading}>
                        <XIcon className="mr-2 size-4" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} size="sm" disabled={isLoading}>
                        <SaveIcon className="mr-2 size-4" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => handleEdit("replyTone")} variant="outline" size="sm">
                      <EditIcon className="mr-2 size-4" />
                      Edit
                    </Button>
                  )}
                </div>
                {editingTab === "replyTone" ? (
                  <Textarea
                    autoFocus
                    value={editData.replyTone}
                    onChange={(e) => updateEditField("replyTone", e.target.value)}
                    placeholder="e.g. Professional and friendly, with a touch of humor"
                    rows={6}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{formData.replyTone}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Keywords</Label>
                  {editingTab === "keywords" ? (
                    <div className="flex gap-2">
                      <Button onClick={handleCancel} variant="outline" size="sm" disabled={isLoading}>
                        <XIcon className="mr-2 size-4" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} size="sm" disabled={isLoading}>
                        <SaveIcon className="mr-2 size-4" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => handleEdit("keywords")} variant="outline" size="sm">
                      <EditIcon className="mr-2 size-4" />
                      Edit
                    </Button>
                  )}
                </div>
                {editingTab === "keywords" && (
                  <Button onClick={addKeyword} variant="outline" size="sm" disabled={isLoading}>
                    <PlusIcon className="mr-2 size-4" />
                    Add Keyword
                  </Button>
                )}
                {editingTab === "keywords" ? (
                  <div className="space-y-2">
                    {editData.keywords.map((keyword, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={keyword}
                          placeholder="e.g. marketing tips"
                          onChange={(e) => updateKeyword(index, e.target.value)}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeKeyword(index)}
                          className="bg-destructive text-white"
                        >
                          <TrashIcon className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recency" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label>Max Scrape Recency (Months)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon size={14} className="text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Only get posts from the last {formData.maxScrapeRecencyInMonths} month(s). This is the maximum
                          date range to scrape posts from.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {editingTab === "recency" ? (
                    <div className="flex gap-2">
                      <Button onClick={handleCancel} variant="outline" size="sm" disabled={isLoading}>
                        <XIcon className="mr-2 size-4" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} size="sm" disabled={isLoading}>
                        <SaveIcon className="mr-2 size-4" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => handleEdit("recency")} variant="outline" size="sm">
                      <EditIcon className="mr-2 size-4" />
                      Edit
                    </Button>
                  )}
                </div>
                {editingTab === "recency" ? (
                  <div className="space-y-1.5">
                    <Input
                      autoFocus
                      type="number"
                      min={1}
                      max={2}
                      value={editData.maxScrapeRecencyInMonths}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const clampedValue = Math.min(Math.max(value, 1), 2);
                        updateEditField("maxScrapeRecencyInMonths", clampedValue);
                      }}
                    />
                    <p className="text-muted-foreground text-xs">Maximum: 2 months</p>
                  </div>
                ) : (
                  <p className="text-sm">{formData.maxScrapeRecencyInMonths} month(s)</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Current Plan</span>
              <p className="text-lg font-semibold capitalize">
                {plan === "pro" ? "Professional" : plan === "enterprise" ? "Enterprise" : "Free"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Plan End Date</span>
              <p className="text-lg font-semibold tabular-nums">
                {periodEnd
                  ? new Date(periodEnd).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Relevant Posts</span>
              <p className="text-lg font-semibold tabular-nums">
                {isLoadingPostsCount ? "..." : (relevantPostsCount ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
