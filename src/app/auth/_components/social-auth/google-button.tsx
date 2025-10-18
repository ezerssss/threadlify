"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { siGoogle } from "simple-icons";
import { toast } from "sonner";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/firebase";
import { cn, toastError } from "@/lib/utils";

const provider = new GoogleAuthProvider();

export function GoogleButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      await signInWithPopup(auth, provider);

      toast.info("Successfully logged-in.");

      router.push(searchParams.get("backTo") ?? "/dashboard");
    } catch (error) {
      toastError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="secondary" disabled={isLoading} className={cn(className)} {...props} onClick={handleGoogleLogin}>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <SimpleIcon icon={siGoogle} className="size-4" />
          Continue with Google
        </>
      )}
    </Button>
  );
}
