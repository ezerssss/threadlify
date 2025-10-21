import * as z from "zod";

export const UserDataSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  name: z.string().min(1),
  url: z.url(),
  profile: z.object({
    description: z.string().min(1),
    keywords: z.string().array().min(1),
  }),
  strategy: z.string().min(1),
  isOnboarded: z.boolean(),
  isInitialFetchDone: z.boolean(),
  processStatus: z.string(),
  totalScrapedPosts: z.number().nonnegative(),
  totalAICalls: z.number().nonnegative(),
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
