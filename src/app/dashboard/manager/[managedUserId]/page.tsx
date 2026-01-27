"use client";

import React from "react";

import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useManagedUser from "@/hooks/use-managed-user";

import Kanban from "./_components/kanban";
import ManagedUserSkeleton from "./skeleton";

function ProcessStatusDisplay({ processStatus }: { processStatus: Record<string, string> }) {
  const statusEntries = Object.entries(processStatus);
  const statusCount = statusEntries.length;
  const firstStatus = statusEntries[0]?.[1] || "";

  if (statusCount === 1) {
    return (
      <p className={`truncate text-sm ${firstStatus ? "text-foreground" : "text-muted-foreground"}`}>
        {firstStatus}
      </p>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p className="truncate text-sm text-foreground cursor-help">
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

function ManagedUserView() {
  const { managedUserId } = useParams<{ managedUserId: string }>();
  const { isLoading, managedUserData } = useManagedUser(managedUserId);

  if (isLoading || !managedUserData) {
    return <ManagedUserSkeleton />;
  }

  const subscription = managedUserData.subscription;
  const remainingScans = subscription.monthlyQuota - subscription.usedThisPeriod;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Manage User</h1>
        <p className="text-muted-foreground text-sm">Perform actions on behalf of this user</p>
      </div>

      <Card className="mb-6 max-w-lg gap-2 py-4">
        <CardHeader className="px-3" hidden>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-5">
          <div>
            <p className="text-muted-foreground text-xs">Name</p>
            <p className="font-medium">{managedUserData.name}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">Email</p>
            <p className="font-medium">{managedUserData.email}</p>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">Status</p>
            {managedUserData.processStatus && Object.keys(managedUserData.processStatus).length > 0 ? (
              <ProcessStatusDisplay processStatus={managedUserData.processStatus} />
            ) : (
              <p className="text-muted-foreground truncate text-sm">Idle</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Scan Quota</p>
              <Badge variant={remainingScans > 0 ? "default" : "destructive"}>{remainingScans}</Badge>
              <p className="text-muted-foreground mt-1 text-xs">Automatic scans included</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Kanban managedUserId={managedUserId} />
    </div>
  );
}

export default ManagedUserView;
