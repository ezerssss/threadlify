import { useEffect, useState } from "react";

import { doc, onSnapshot } from "firebase/firestore";

import { REDDIT_SCRAPER_SUBSCRIBER_COLLECTION_REF } from "@/constants/firebase";
import useUser from "@/hooks/use-user";

export type SubredditsData = {
  subreddits: string[];
};

export default function useSubreddits() {
  const { user } = useUser();
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const subscriberDocRef = doc(REDDIT_SCRAPER_SUBSCRIBER_COLLECTION_REF, user.uid);

    const unsubscribe = onSnapshot(subscriberDocRef, (doc) => {
      if (!doc.exists()) {
        setSubreddits([]);
        setIsLoading(false);
        return;
      }

      const data = doc.data() as SubredditsData;
      setSubreddits(data.subreddits ?? []);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { subreddits, isLoading };
}
