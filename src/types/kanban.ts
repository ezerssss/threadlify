import * as z from "zod";

export const KanbanChangeRequestSchema = z.object({
  id: z.string().min(1),
  boardColumnId: z.string().min(1),
  columnRank: z.string().min(1),
});

export type KanbanChangeRequestType = z.infer<typeof KanbanChangeRequestSchema>;
