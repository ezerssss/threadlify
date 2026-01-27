/* eslint-disable max-lines */
"use client";

import { useState, useEffect } from "react";

import { doc, onSnapshot } from "firebase/firestore";
import ky from "ky";
import {
  CreditCard,
  Mail,
  Calendar,
  Hash,
  Activity,
  TrendingUp,
  Globe,
  FileText,
  Target,
  Zap,
  Clock,
  Play,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { ADMIN_TRIGGER_SCAN_URL } from "@/constants/url";
import useUser from "@/hooks/use-user";
import useUserRelevantPostsCount from "@/hooks/use-user-relevant-posts-count";
import { formatISODate, toastError } from "@/lib/utils";
import { UserDataType } from "@/types/user";

import ChangeSubscriptionDialog from "./change-subscription-dialog";
import ExtendSubscriptionDialog from "./extend-subscription-dialog";

interface UserDetailsDialogProps {
  user: UserDataType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ProcessStatusDisplay({
  processStatus,
  size = "xs",
}: {
  processStatus: Record<string, string>;
  size?: "xs" | "sm";
}) {
  const statusEntries = Object.entries(processStatus);
  const statusCount = statusEntries.length;
  const firstStatus = statusEntries[0]?.[1] || "";
  const textSize = size === "sm" ? "text-sm" : "text-xs";

  if (statusCount === 1) {
    return <p className={`truncate ${textSize}`}>{firstStatus}</p>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p className={`truncate ${textSize} cursor-help`}>
          {firstStatus} +{statusCount - 1} more
        </p>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1">
          {statusEntries.map(([id, status]) => (
            <div key={id} className="text-xs">
              {status}
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// eslint-disable-next-line complexity
export default function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDataType>(user);
  const [isTriggeringScan, setIsTriggeringScan] = useState(false);
  const { idToken } = useUser();
  const { count: relevantPostsCount, isLoading: isLoadingRelevantPosts } = useUserRelevantPostsCount({
    userId: currentUser.id,
  });

  // Listen to real-time updates for this specific user
  useEffect(() => {
    if (!open) return;

    const userDocRef = doc(USERS_COLLECTION_REF, user.id);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setCurrentUser(doc.data() as UserDataType);
      }
    });

    return () => unsubscribe();
  }, [user.id, open]);

  // Reset to initial user when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentUser(user);
    }
  }, [user, open]);

  const isProOrEnterprise = currentUser.subscription.plan === "pro" || currentUser.subscription.plan === "enterprise";
  const isActive = currentUser.subscription.status === "active";
  const canTriggerScan = isProOrEnterprise && isActive && !currentUser.isScanning && !isTriggeringScan;

  function getTooltipMessage(): string {
    if (isTriggeringScan) {
      return "Scan is being triggered...";
    }
    if (currentUser.isScanning) {
      return "A scan is already running for this user.";
    }
    if (!isProOrEnterprise) {
      return "Scans can only be triggered for Pro or Enterprise users.";
    }
    if (!isActive) {
      return "User subscription is not active. Activate the subscription to trigger scans.";
    }
    return "Trigger a manual scan for this user";
  }

  async function handleTriggerScan() {
    if (!idToken) {
      toast.error("You are not authorized to perform this action.");
      return;
    }

    try {
      setIsTriggeringScan(true);

      await ky.post(ADMIN_TRIGGER_SCAN_URL, {
        json: {
          userId: currentUser.id,
        },
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        timeout: 10000,
      });

      toast.success("Scan triggered successfully.");
    } catch (error) {
      toastError(error);
    } finally {
      setIsTriggeringScan(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="scrollbar-thin bg-card max-h-[90vh] min-w-[65vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{currentUser.name}</DialogTitle>
            <DialogDescription>Complete user information and account details</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <p className="text-sm font-medium">{currentUser.email}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Hash className="h-4 w-4" />
                    <span>User ID</span>
                  </div>
                  <p className="font-mono text-sm">{currentUser.id}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Created At</span>
                  </div>
                  <p className="text-sm">{formatISODate(currentUser.createdAt)}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    <span>URL</span>
                  </div>
                  <p className="truncate text-sm">{currentUser.url}</p>
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Subscription</h3>
                <Button variant="outline" size="sm" onClick={() => setIsSubscriptionDialogOpen(true)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Change Subscription
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4" />
                    <span>Plan</span>
                  </div>
                  <Badge
                    variant={
                      currentUser.subscription.plan === "enterprise"
                        ? "default"
                        : currentUser.subscription.plan === "pro"
                          ? "secondary"
                          : "outline"
                    }
                    className="capitalize"
                  >
                    {currentUser.subscription.plan}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>Status</span>
                  </div>
                  <Badge
                    variant={currentUser.subscription.status === "active" ? "default" : "destructive"}
                    className="capitalize"
                  >
                    {currentUser.subscription.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>Auto Renew</span>
                  </div>
                  <p className="text-sm">{currentUser.subscription.autoRenew ? "Yes" : "No"}</p>
                </div>

                {currentUser.subscription.subscriptionId && (
                  <div className="space-y-1">
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <span>Subscription ID</span>
                    </div>
                    <p className="font-mono text-sm">{currentUser.subscription.subscriptionId}</p>
                  </div>
                )}

                {currentUser.subscription.periodStart && (
                  <div className="space-y-1">
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <span>Period Start</span>
                    </div>
                    <p className="text-sm">{formatISODate(currentUser.subscription.periodStart)}</p>
                  </div>
                )}

                {currentUser.subscription.periodEnd && (
                  <div className="space-y-1">
                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span>Period End</span>
                      </div>
                      {isProOrEnterprise && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsExtendDialogOpen(true)}
                          className="h-6.5 px-1"
                        >
                          <Clock className="mr-1.5 h-3 w-3" />
                          Extend
                        </Button>
                      )}
                    </div>
                    <p className="text-sm">{formatISODate(currentUser.subscription.periodEnd)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Information */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Status</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button variant="outline" size="sm" onClick={handleTriggerScan} disabled={!canTriggerScan}>
                        {isTriggeringScan ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Triggering...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Trigger Scan
                          </>
                        )}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getTooltipMessage()}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4" />
                    <span>Scanning</span>
                  </div>
                  {currentUser.isScanning ? (
                    <Badge variant="default">Running</Badge>
                  ) : (
                    <Badge variant="secondary">Idle</Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>Process Status</span>
                  </div>
                  {currentUser.processStatus && Object.keys(currentUser.processStatus).length > 0 ? (
                    <ProcessStatusDisplay processStatus={currentUser.processStatus} size="sm" />
                  ) : (
                    <p className="text-sm">Idle</p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-lg font-semibold">Profile</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>Description</span>
                  </div>
                  <p className="text-sm">{currentUser.profile.description}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4" />
                    <span>Audience</span>
                  </div>
                  <p className="text-sm">{currentUser.profile.audience}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>Main Value Proposition</span>
                  </div>
                  <p className="text-sm">{currentUser.profile.mainValueProposition}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>Value Mechanism</span>
                  </div>
                  <p className="text-sm">{currentUser.profile.valueMechanism}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>Strengths</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.profile.strengths.map((strength, index) => (
                      <Badge key={index} variant="outline">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>Keywords</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.profile.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy & Settings */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-lg font-semibold">Strategy & Settings</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4" />
                    <span>Strategy</span>
                  </div>
                  <p className="text-sm">{currentUser.strategy}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>Reply Tone</span>
                  </div>
                  <p className="text-sm">{currentUser.replyTone}</p>
                </div>

                {currentUser.irrelevanceContext && (
                  <div className="space-y-1">
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <span>Irrelevance Context</span>
                    </div>
                    <p className="text-sm">{currentUser.irrelevanceContext}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>Max Scrape Recency (Months)</span>
                  </div>
                  <p className="text-sm">{currentUser.maxScrapeRecencyInMonths}</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-lg font-semibold">Statistics</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Total Scans</p>
                  <p className="text-lg font-semibold">{currentUser.totalScans}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Total Scanned Posts</p>
                  <p className="text-lg font-semibold">{currentUser.totalScrapedPosts}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Relevant Posts</p>
                  <p className="text-lg font-semibold">{isLoadingRelevantPosts ? "..." : (relevantPostsCount ?? 0)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Total AI Calls</p>
                  <p className="text-lg font-semibold">{currentUser.totalAICalls}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isSubscriptionDialogOpen && (
        <ChangeSubscriptionDialog
          user={currentUser}
          open={isSubscriptionDialogOpen}
          onOpenChange={setIsSubscriptionDialogOpen}
          onSuccess={() => {
            setIsSubscriptionDialogOpen(false);
          }}
        />
      )}

      {isExtendDialogOpen && (
        <ExtendSubscriptionDialog
          user={currentUser}
          open={isExtendDialogOpen}
          onOpenChange={setIsExtendDialogOpen}
          onSuccess={() => {
            setIsExtendDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
