import * as z from "zod";

export const PostSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  subreddit: z.string(),
  author: z.string(),
  authorId: z.string().nullable(),
  score: z.number(),
  postCreatedAt: z.string(),
});
export type PostSummaryType = z.infer<typeof PostSummarySchema>;

export const CommentSummarySchema = z.object({
  id: z.string(),
  author: z.string(),
  body: z.string(),
  url: z.string(),
});
export type CommentSummaryType = z.infer<typeof CommentSummarySchema>;

const UpvoteTaskSchema = z.object({
  type: z.literal("upvote"),
  subreddit: z.string(),
  post: PostSummarySchema,
});
export type UpvoteTaskType = z.infer<typeof UpvoteTaskSchema>;

const CommentTaskSchema = z.object({
  type: z.literal("comment"),
  subreddit: z.string(),
  post: PostSummarySchema,
  targetComment: CommentSummarySchema.nullable(),
  recommendedReply: z.string().min(1),
});
export type CommentTaskType = z.infer<typeof CommentTaskSchema>;

const PostTaskSchema = z.object({
  type: z.literal("post"),
  subreddit: z.string(),
  recommendedPost: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
  }),
});
export type PostTaskType = z.infer<typeof PostTaskSchema>;

export const PersonaTaskSchema = z.discriminatedUnion("type", [UpvoteTaskSchema, CommentTaskSchema, PostTaskSchema]);
export type PersonaTaskType = z.infer<typeof PersonaTaskSchema>;
export const PersonaTaskStatusEnum = z.enum(["pending", "done", "skipped"]);

export const PersonaTaskDocumentSchema = z
  .object({
    status: PersonaTaskStatusEnum,
    createdAt: z.string(), // ISO datetime
    updatedAt: z.string(), // ISO datetime
  })
  .and(PersonaTaskSchema);
export type PersonaTaskDocumentType = z.infer<typeof PersonaTaskDocumentSchema>;
