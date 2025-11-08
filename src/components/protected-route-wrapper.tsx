"use client";

import { ReactNode, useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { PuffLoader } from "react-spinners";

import UnauthorizedPage from "@/app/unauthorized/page";
import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { auth } from "@/firebase";
import useUser from "@/hooks/use-user";

interface PropsInterface {
  children: JSX.Element;
}

function ProtectedRouteWrapper(props: PropsInterface): JSX.Element {
  const { children } = props;

  const router = useRouter();
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user, userData, isLoading: isUserDataLoading } = useUser();

  useEffect(() => {
    if (!user || isUserDataLoading) {
      return;
    }

    if (!userData) {
      router.push("/onboarding");
      setIsLoading(false);
      return;
    }

    if (!userData.isOnboarded) {
      router.push("/onboarding");
      return;
    }

    if (pathname === "/onboarding") {
      router.push("/dashboard");
    }

    setIsLoading(false);
  }, [user, userData, isUserDataLoading, router]);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);

      if (!user) {
        router.push(`/auth/login?backTo=${pathname}`);
      }
      setIsLoading(false);
    });
  }, []);

  const authCheck = isAuthenticated ? children : UnauthorizedPage();

  return isLoading ? (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <PuffLoader color="#df5e3a" />
    </div>
  ) : (
    authCheck
  );
}

export default ProtectedRouteWrapper;
