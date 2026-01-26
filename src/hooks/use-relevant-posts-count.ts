"use client";

import { useEffect, useState } from "react";

import { collection, doc, getCountFromServer, query, where } from "firebase/firestore";

import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { FIREBASE_COLLECTION_ENUMS } from "@/enums/firebase";
import useUser from "@/hooks/use-user";

export default function useRelevantPostsCount() {
  const { user, userData } = useUser();
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !userData?.id) {
      setCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
    const postsCollectionRef = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.POSTS_COLLECTION);

    // Count posts where isHidden is false
    const countQuery = query(postsCollectionRef, where("isHidden", "==", false));

    getCountFromServer(countQuery)
      .then((snapshot) => {
        setCount(snapshot.data().count);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error counting relevant posts:", error);
        setCount(0);
        setIsLoading(false);
      });
  }, [user, userData?.id]);

  return { count, isLoading };
}
