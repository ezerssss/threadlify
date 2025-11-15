"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { auth } from "@/firebase";
import { toastError } from "@/lib/utils";
import { UserDataType } from "@/types/user";

const FormSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(formValues: z.infer<typeof FormSchema>) {
    const { email, password } = formValues;

    try {
      setIsLoading(true);

      const { user } = await signInWithEmailAndPassword(auth, email, password);

      const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        router.push("/onboarding");
        return;
      }

      const userData = userDoc.data() as UserDataType;

      if (userData.onboardingStatus === "notAnswered") {
        router.push("/onboarding");
        return;
      }

      router.push(searchParams.get("backTo") ?? "/dashboard");
    } catch (error) {
      toastError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? <Spinner /> : "Login"}
        </Button>
      </form>
    </Form>
  );
}
