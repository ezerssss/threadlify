import { ColumnDef } from "@tanstack/react-table";
import z from "zod";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDuration, formatRelativeTime } from "@/lib/utils";
import { ScanLogSchema, ScanLogType } from "@/types/log";

export const scanLogsColumns: ColumnDef<Omit<ScanLogType, "logType">>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "scanType",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => <span className="text-sm capitalize">{row.original.scanType}</span>,
    size: 80,
  },
  {
    accessorKey: "postsAnalyzed",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Analyzed" />,
    cell: ({ row }) => <span className="text-sm">{row.original.postsAnalyzed}</span>,
    size: 80,
  },
  {
    accessorKey: "aiCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="AI" />,
    cell: ({ row }) => <span className="text-sm">{row.original.aiCount}</span>,
    size: 60,
  },
  {
    accessorKey: "relevantPosts",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Relevant" />,
    cell: ({ row }) => <span className="text-sm">{row.original.relevantPosts}</span>,
    size: 80,
  },
  {
    accessorKey: "failedPostCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Failed" />,
    cell: ({ row }) => <span className="text-sm">{row.original.failedPostCount}</span>,
    size: 70,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge variant={row.original.status === "success" ? "secondary" : "destructive"} className="text-xs capitalize">
        {row.original.status}
      </Badge>
    ),
    size: 80,
  },
  {
    accessorKey: "durationMs",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm tabular-nums">{formatDuration(row.original.durationMs)}</span>
    ),
    size: 90,
  },
  {
    accessorKey: "date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm tabular-nums">{formatRelativeTime(row.original.date)}</span>
    ),
    size: 100,
  },
  {
    accessorKey: "errorMessage",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Error" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground block max-w-[120px] truncate text-xs">
        {row.original.errorMessage || "-"}
      </span>
    ),
    enableHiding: true,
    size: 120,
  },
];
