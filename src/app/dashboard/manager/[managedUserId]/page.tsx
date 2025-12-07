"use client";

import React from "react";

import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useManagedUser from "@/hooks/use-managed-user";

import Kanban from "./_components/kanban";
import ScanActionButtons from "./_components/scan-action-buttons";
import ManagedUserSkeleton from "./skeleton";

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
            <p
              className={`truncate text-sm ${
                managedUserData.processStatus ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {managedUserData.processStatus || "Idle"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Remaining Scans</p>
              <Badge variant={remainingScans > 0 ? "default" : "destructive"}>{remainingScans}</Badge>
            </div>

            <ScanActionButtons managedUserId={managedUserId} />
          </div>
        </CardContent>
      </Card>

      <Kanban managedUserId={managedUserId} />
    </div>
  );
}

export default ManagedUserView;
