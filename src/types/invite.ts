import * as z from "zod";

export const ClaimStatusEnum = z.enum(["available", "claimed", "processing"]);

export const InviteSchema = z.object({
  id: z.string().min(1),
  docId: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().min(1),
  status: ClaimStatusEnum,
  claimedAt: z.iso.datetime().nullable(),
  claimedBy: z.string().min(1).nullable(),
  createdAt: z.iso.datetime(),
});
export type InviteType = z.infer<typeof InviteSchema>;

export const AcceptInviteSchema = z.object({
  inviteId: z.string().min(1),
});
export type AcceptInviteType = z.infer<typeof AcceptInviteSchema>;
