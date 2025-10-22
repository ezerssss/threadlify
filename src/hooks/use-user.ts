import { useEffect, useState } from "react";

import { User, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { auth } from "@/firebase";
import { UserDataType } from "@/types/user";

export default function useUser() {
  const [user, setUser] = useState<User | null>();
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

    const userDocRef = doc(USERS_COLLECTION_REF, user.uid);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      const data = doc.data() as UserDataType;
      setUserData(data);
    });

    return () => unsubscribe();
  }, [user]);

  return { user, userData };
}
