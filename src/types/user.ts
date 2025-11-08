import * as z from "zod";

import { SubscriptionSchema } from "./subscription";

export const UserDataSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  name: z.string().min(1),
  url: z.url(),
  profile: z.object({
    description: z.string().min(1),
    audience: z.string().min(1),
    tone: z.string().min(1),
    keywords: z.string().array().min(1),
  }),
  strategy: z.string().min(1),
  isOnboarded: z.boolean(),
  isInitialFetchDone: z.boolean(),
  isScanning: z.boolean(),
  processStatus: z.string(),

  totalScrapedPosts: z.number().nonnegative(),
  totalAICalls: z.number().nonnegative(),
  totalScans: z.number().nonnegative(),

  subscription: SubscriptionSchema,

  createdAt: z.iso.datetime(),
});
export type UserDataType = z.infer<typeof UserDataSchema>;

export const RegisterUserSchema = z
  .object({
    email: z.email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string().min(6, {
      message: "Confirm Password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterUserType = z.infer<typeof RegisterUserSchema>;

export const EditUserProfileSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  audience: z.string().min(1),
  tone: z.string().min(1),
  keywords: z.string().min(1).array().min(1),
  growthStrategy: z.string().min(1),
});

export type EditUserProfileType = z.infer<typeof EditUserProfileSchema>;
