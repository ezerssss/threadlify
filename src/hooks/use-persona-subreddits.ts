import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { REDDIT_SCRAPER_PERSONA_COLLECTION_REF } from "@/constants/firebase";
import useUser from "@/hooks/use-user";

export type PersonaSubredditsData = {
  subreddits: string[];
};

export default function usePersonaSubreddits() {
  const { user } = useUser();
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const personaDocRef = doc(REDDIT_SCRAPER_PERSONA_COLLECTION_REF, user.uid);

    const unsubscribe = onSnapshot(personaDocRef, (snapshot) => {
      if (!snapshot.exists()) {
        setSubreddits([]);
        setIsLoading(false);
        return;
      }

      const data = snapshot.data() as PersonaSubredditsData;
      setSubreddits(data.subreddits ?? []);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { subreddits, isLoading };
}
