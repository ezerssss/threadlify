import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical } from "lucide-react";
import z from "zod";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDuration, formatRelativeTime } from "@/lib/utils";
import { ScanLogSchema } from "@/types/log";

const scanResultColumnSchema = ScanLogSchema.omit({
  logType: true,
  userId: true,
  errorMessage: true,
});

export const scanResultsColumns: ColumnDef<z.infer<typeof scanResultColumnSchema>>[] = [
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
    accessorKey: "platform",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Platform" />,
    cell: ({ row }) => <span>{row.original.platform}</span>,
  },
  {
    accessorKey: "scanType",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Scan Type" />,
    cell: ({ row }) => <span className="capitalize">{row.original.scanType}</span>,
  },
  {
    accessorKey: "postsAnalyzed",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Posts Analyzed" />,
    cell: ({ row }) => <span>{row.original.postsAnalyzed}</span>,
  },
  {
    accessorKey: "relevantPosts",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Relevant Posts" />,
    cell: ({ row }) => <span>{row.original.relevantPosts}</span>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge variant={row.original.status === "success" ? "secondary" : "destructive"} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "durationMs",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">{formatDuration(row.original.durationMs)}</span>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">{formatRelativeTime(row.original.date)}</span>
    ),
  },
  // {
  //   id: "actions",
  //   cell: () => (
  //     <Button variant="ghost" className="text-muted-foreground flex size-8" size="icon">
  //       <EllipsisVertical />
  //       <span className="sr-only">Open menu</span>
  //     </Button>
  //   ),
  //   enableSorting: false,
  // },
];
