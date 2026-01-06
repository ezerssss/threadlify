"use client";

import { useEffect, useState } from "react";

import { collection, doc, onSnapshot, query, limit } from "firebase/firestore";

import { USERS_COLLECTION_REF } from "@/constants/firebase";
import { FIREBASE_COLLECTION_ENUMS } from "@/enums/firebase";
import useUser from "@/hooks/use-user";

export default function useHasData() {
  const { user, userData } = useUser();
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !userData?.id) {
      setIsLoading(false);
      setHasData(false);
      return;
    }

    setIsLoading(true);
    const userDocRef = doc(USERS_COLLECTION_REF, user.uid);
    const postsCollectionRef = collection(userDocRef, FIREBASE_COLLECTION_ENUMS.POSTS_COLLECTION);

    // Check if there's at least one post using real-time listener
    const countQuery = query(postsCollectionRef, limit(1));
    const unsubscribe = onSnapshot(
      countQuery,
      (snapshot) => {
        setHasData(!snapshot.empty);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error checking for data:", error);
        setHasData(false);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, userData?.id]);

  return { hasData, isLoading };
}
