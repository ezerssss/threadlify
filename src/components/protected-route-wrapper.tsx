"use client";

import { ReactNode, useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { PuffLoader } from "react-spinners";

import UnauthorizedPage from "@/app/unauthorized/page";
import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { auth } from "@/firebase";

interface PropsInterface {
  children: JSX.Element;
}

function ProtectedRouteWrapper(props: PropsInterface): JSX.Element {
  const { children } = props;

  const router = useRouter();
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);

      if (!user) {
        router.push(`/auth/login?backTo=${pathname}`);
        setIsLoading(false);
        return;
      }

      const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        router.push("/onboarding");
        return;
      }

      const userData = userDoc.data();

      if (!userData.isOnboarded) {
        router.push("/onboarding");
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
