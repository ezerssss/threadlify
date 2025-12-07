import { useEffect, useState } from "react";

import { User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { REFRESH_JWT_TOKEN_INTERVAL_IN_MS } from "@/constants/time";
import { auth } from "@/firebase";
import { UserDataType } from "@/types/user";

export default function useUser() {
  const [user, setUser] = useState<User | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>();
  const [claims, setClaims] = useState<Record<string, any>>({});
  const [isClaimsLoading, setIsClaimsLoading] = useState(true);
  const [userData, setUserData] = useState<UserDataType | null>();

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    const userDocRef = doc(USERS_COLLECTION_REF, user.uid);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (!doc.exists()) {
        setUserData(null);
        setIsLoading(false);
        return;
      }

      const data = doc.data() as UserDataType;
      setUserData(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    async function getIdToken() {
      if (!user) {
        return;
      }

      const fetchedIdToken = await user.getIdToken();
      setIdToken(fetchedIdToken);
    }

    getIdToken();

    setInterval(getIdToken, REFRESH_JWT_TOKEN_INTERVAL_IN_MS);
  }, [user]);

  useEffect(() => {
    setIsClaimsLoading(true);
    async function getClaims() {
      if (!user) {
        return;
      }

      const tokenResult = await user.getIdTokenResult();

      setClaims(tokenResult.claims);
      setIsClaimsLoading(false);
    }

    getClaims();
  }, [user]);

  return { user, userData, isLoading, idToken, claims, isClaimsLoading };
}
