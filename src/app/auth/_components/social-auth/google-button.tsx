"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Loader2Icon } from "lucide-react";
import { siGoogle } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { cn, toastError } from "@/lib/utils";

const provider = new GoogleAuthProvider();

export function GoogleButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin() {
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;

      console.log(credential, token, user);
      router.replace("/dashboard");
    } catch (error) {
      toastError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="secondary" disabled={isLoading} className={cn(className)} {...props} onClick={handleGoogleLogin}>
      {isLoading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <>
          <SimpleIcon icon={siGoogle} className="size-4" />
          Continue with Google
        </>
      )}
    </Button>
  );
}
