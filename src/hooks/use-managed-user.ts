import { useEffect, useState } from "react";

import { doc, onSnapshot } from "firebase/firestore";

import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { UserDataType } from "@/types/user";

function useManagedUser(managedUserId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [managedUserData, setManagedUserData] = useState<UserDataType | null>();

  useEffect(() => {
    if (!managedUserId) {
      return;
    }

    setIsLoading(true);
    const userDocRef = doc(USERS_COLLECTION_REF, managedUserId);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (!doc.exists()) {
        setManagedUserData(null);
        setIsLoading(false);
        return;
      }

      const data = doc.data() as UserDataType;
      setManagedUserData(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [managedUserId]);

  return { managedUserData, isLoading };
}

export default useManagedUser;
