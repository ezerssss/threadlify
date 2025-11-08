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

  return { user, userData, isLoading, idToken };
}
