import { ColumnDef } from "@tanstack/react-table";
import z from "zod";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatISODate, formatRelativeTime } from "@/lib/utils";
import { PaymentLogSchema } from "@/types/log";

const paymentLogColumnSchema = PaymentLogSchema.omit({
  logType: true,
});

export const paymentLogsColumns: ColumnDef<z.infer<typeof paymentLogColumnSchema>>[] = [
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
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.original.amount, { currency: row.original.currency })}</span>
    ),
  },
  {
    accessorKey: "method",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Method" />,
    cell: ({ row }) => <span className="capitalize">{row.original.method}</span>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status;
      const variant =
        status === "completed"
          ? "default"
          : status === "pending"
            ? "secondary"
            : status === "failed"
              ? "destructive"
              : "outline";
      return (
        <Badge variant={variant} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "subscriptionPlan",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Plan" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.subscriptionPlan}
      </Badge>
    ),
  },
  {
    accessorKey: "subscriptionId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Subscription ID" />,
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.subscriptionId}</span>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">{formatRelativeTime(row.original.createdAt)}</span>
    ),
  },
  {
    accessorKey: "notes",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Notes" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground block max-w-xs truncate text-sm">{row.original.notes || "-"}</span>
    ),
  },
];
