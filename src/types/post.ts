import * as z from "zod";

export const CommentSchema = z.object({
  id: z.string().min(1),
  author: z.string().min(1),
  body: z.string().min(1),
  url: z.string().min(1),
});

export type CommentType = z.infer<typeof CommentSchema>;

export const RecommendedReplySchema = z.object({
  reply: z.string().min(1),
  targetComment: CommentSchema.nullable(),
});
export type RecommendedReplyType = z.infer<typeof RecommendedReplySchema>;

export const PostSchema = z.object({
  id: z.string().min(1),
  isHidden: z.boolean(),
  userId: z.string().min(1),
  author: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  topComments: z.array(CommentSchema),
  score: z.number(),
  url: z.url(),
  platform: z.string().min(1),
  postCreatedAt: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  boardColumnId: z.string().min(1),
  columnRank: z.string().min(1),
  action: z.string().min(1),
  signalType: z.string().min(1),
  explanation: z.string().min(1),
  reasoning: z.string().array(),
  priority: z.string().min(1),
  recommendedReply: RecommendedReplySchema.nullable(),
});

export type PostType = z.infer<typeof PostSchema>;
