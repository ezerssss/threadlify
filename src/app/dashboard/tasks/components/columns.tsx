import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { ActionableObjectivesType } from "@/types/insights";

export const objectivesColumnSchema: ColumnDef<ActionableObjectivesType>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader className="pl-1" column={column} title="Title" />,
    cell: ({ row }) => <span>{row.original.title}</span>,
    enableHiding: false,
  },
  // {
  //   accessorKey: "description",
  //   header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
  //   cell: ({ row }) => <span className="max-w-xl text-xs text-gray-500">{row.original.description}</span>,
  //   enableHiding: false,
  // },
  {
    accessorKey: "numPosts",
    header: ({ column }) => (
      <div className="w-12 bg-red-500">
        <DataTableColumnHeader column={column} title="Referenced by" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-12 bg-red-500">
        <Badge>{row.original.numPosts} posts</Badge>
      </div>
    ),
    enableHiding: false,
  },
];
