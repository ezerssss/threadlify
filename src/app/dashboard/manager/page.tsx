"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { onSnapshot, query, where } from "firebase/firestore";
import { MoreHorizontal, UserCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { UserDataType } from "@/types/user";

function ProcessStatusDisplay({ processStatus }: { processStatus: Record<string, string> }) {
  const statusEntries = Object.entries(processStatus);
  const statusCount = statusEntries.length;
  const firstStatus = statusEntries[0]?.[1] || "";

  if (statusCount === 1) {
    return <span className="truncate">{firstStatus}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="truncate cursor-help">{firstStatus} +{statusCount - 1} more</span>
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

export default function ManagerUsersPage() {
  const [managedUsers, setManagedUsers] = useState<UserDataType[]>([]);

  useEffect(() => {
    const managedQuery = query(USERS_COLLECTION_REF, where("isManaged", "==", true));

    const unsubscribe = onSnapshot(managedQuery, (snapshot) => {
      const fetchedUsers: UserDataType[] = [];
      for (const doc of snapshot.docs) {
        fetchedUsers.push(doc.data() as UserDataType);
      }

      setManagedUsers(fetchedUsers);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-muted-foreground text-sm">Manage user activity and perform actions on their behalf</p>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Scan Quota</TableHead>
                <TableHead>Scanning</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.subscription.monthlyQuota - user.subscription.usedThisPeriod}</TableCell>
                  <TableCell>
                    {user.isScanning ? <Badge>Running</Badge> : <Badge variant="secondary">Idle</Badge>}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {user.processStatus && Object.keys(user.processStatus).length > 0 ? (
                      <ProcessStatusDisplay processStatus={user.processStatus} />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/dashboard/manager/${user.id}`}>
                          <DropdownMenuItem>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Act as user
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
