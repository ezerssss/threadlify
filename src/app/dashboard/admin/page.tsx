"use client";

import { useMemo, useEffect, useState } from "react";

import { onSnapshot } from "firebase/firestore";
import {
  CreditCard,
  Mail,
  Calendar,
  Hash,
  Activity,
  TrendingUp,
  User as UserIcon,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { formatISODate } from "@/lib/utils";
import { UserDataType } from "@/types/user";

import UserDetailsDialog from "./_components/user-details-dialog";

type SortField = "name" | "email" | "createdAt" | "subscription.plan" | "subscription.status" | "isScanning";
type SortDirection = "asc" | "desc";

function ProcessStatusDisplay({ processStatus }: { processStatus: Record<string, string> }) {
  const statusEntries = Object.entries(processStatus);
  const statusCount = statusEntries.length;
  const firstStatus = statusEntries[0]?.[1] || "";

  if (statusCount === 1) {
    return <p className="truncate text-xs">{firstStatus}</p>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p className="truncate text-xs cursor-help">{firstStatus} +{statusCount - 1} more</p>
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
export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDataType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDataType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterScanning, setFilterScanning] = useState<string>("all");

  // Sort states
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    const unsubscribe = onSnapshot(USERS_COLLECTION_REF, (snapshot) => {
      const fetchedUsers: UserDataType[] = [];
      for (const doc of snapshot.docs) {
        fetchedUsers.push(doc.data() as UserDataType);
      }
      setUsers(fetchedUsers);
    });

    return () => unsubscribe();
  }, []);

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.id.toLowerCase().includes(query) ||
          user.subscription.plan.toLowerCase().includes(query),
      );
    }

    // Apply plan filter
    if (filterPlan !== "all") {
      filtered = filtered.filter((user) => user.subscription.plan === filterPlan);
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => user.subscription.status === filterStatus);
    }

    // Apply scanning filter
    if (filterScanning !== "all") {
      filtered = filtered.filter((user) => {
        if (filterScanning === "scanning") return user.isScanning;
        if (filterScanning === "idle") return !user.isScanning;
        return true;
      });
    }

    // Apply sorting
    // eslint-disable-next-line complexity
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "subscription.plan":
          aValue = a.subscription.plan;
          bValue = b.subscription.plan;
          break;
        case "subscription.status":
          aValue = a.subscription.status;
          bValue = b.subscription.status;
          break;
        case "isScanning":
          aValue = a.isScanning ? 1 : 0;
          bValue = b.isScanning ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, filterPlan, filterStatus, filterScanning, sortField, sortDirection]);

  function handleCardClick(user: UserDataType) {
    setSelectedUser(user);
    setIsDialogOpen(true);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Manage all users and their subscriptions</p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription Plan</label>
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="All plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Scanning Status</label>
              <Select value={filterScanning} onValueChange={setFilterScanning}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="scanning">Scanning</SelectItem>
                  <SelectItem value="idle">Idle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Button
              variant={sortField === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("name")}
              className="gap-2"
            >
              Name
              {sortField === "name" && <ArrowUpDown className="h-3 w-3" />}
            </Button>
            <Button
              variant={sortField === "email" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("email")}
              className="gap-2"
            >
              Email
              {sortField === "email" && <ArrowUpDown className="h-3 w-3" />}
            </Button>
            <Button
              variant={sortField === "createdAt" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("createdAt")}
              className="gap-2"
            >
              Created Date
              {sortField === "createdAt" && <ArrowUpDown className="h-3 w-3" />}
            </Button>
            <Button
              variant={sortField === "subscription.plan" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("subscription.plan")}
              className="gap-2"
            >
              Plan
              {sortField === "subscription.plan" && <ArrowUpDown className="h-3 w-3" />}
            </Button>
            <Button
              variant={sortField === "subscription.status" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("subscription.status")}
              className="gap-2"
            >
              Status
              {sortField === "subscription.status" && <ArrowUpDown className="h-3 w-3" />}
            </Button>
          </div>

          {/* Results count */}
          <div className="text-muted-foreground text-sm">
            Showing {filteredAndSortedUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedUsers.map((user) => (
          <Card
            key={user.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => handleCardClick(user)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" />
                    <span className="text-xs">ID</span>
                  </div>
                  <p className="truncate font-mono text-xs">{user.id}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs">Created</span>
                  </div>
                  <p className="text-xs">{formatISODate(user.createdAt)}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" />
                    <span className="text-xs">Scanning</span>
                  </div>
                  {user.isScanning ? (
                    <Badge variant="default" className="text-xs">
                      Running
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Idle
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1 border-t pt-2">
                <div className="text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span className="text-xs">Subscription</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    // eslint-disable-next-line max-lines
                    variant={
                      user.subscription.plan === "enterprise"
                        ? "default"
                        : user.subscription.plan === "pro"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs capitalize"
                  >
                    {user.subscription.plan}
                  </Badge>
                  <Badge
                    variant={user.subscription.status === "active" ? "default" : "destructive"}
                    className="text-xs capitalize"
                  >
                    {user.subscription.status}
                  </Badge>
                  {user.subscription.autoRenew && <span className="text-muted-foreground text-xs">Auto-renew</span>}
                </div>
              </div>

              <div className="space-y-1 border-t pt-2">
                <div className="text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-xs">Process Status</span>
                </div>
                {user.processStatus && Object.keys(user.processStatus).length > 0 ? (
                  <ProcessStatusDisplay processStatus={user.processStatus} />
                ) : (
                  <p className="truncate text-xs">Idle</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 border-t pt-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Scans</p>
                  <p className="font-medium">{user.totalScans}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Scanned Posts</p>
                  <p className="font-medium">{user.totalScrapedPosts}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">AI Calls</p>
                  <p className="font-medium">{user.totalAICalls}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedUsers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserIcon className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground">
              {users.length === 0 ? "No users found" : "No users match your filters"}
            </p>
          </CardContent>
        </Card>
      )}

      {selectedUser && (
        <UserDetailsDialog
          user={selectedUser}
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setSelectedUser(null);
            }
          }}
        />
      )}
    </div>
  );
}
