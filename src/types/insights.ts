import * as z from "zod";

export const ActionableObjectivesSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  specificTasks: z.string().min(1).array().min(1),
  numPosts: z.number().positive(),
});

export type ActionableObjectivesType = z.infer<typeof ActionableObjectivesSchema>;
