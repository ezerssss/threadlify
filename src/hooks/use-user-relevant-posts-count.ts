"use client";

import { useEffect, useState } from "react";

import { collection, doc, getCountFromServer, query, where } from "firebase/firestore";

import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { FIREBASE_COLLECTION_ENUMS } from "@/enums/firebase";

interface UseUserRelevantPostsCountProps {
  userId: string | null | undefined;
}

export default function useUserRelevantPostsCount({ userId }: UseUserRelevantPostsCountProps) {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userDocRef = doc(USERS_COLLECTION_REF, userId);
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
  }, [userId]);

  return { count, isLoading };
}
