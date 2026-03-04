import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { USERS_COLLECTION_REF } from "@/constants/firebase";
import useUser from "@/hooks/use-user";
import type { PersonaTaskDocumentType } from "@/types/persona-tasks";

export type PersonaTaskWithId = PersonaTaskDocumentType & { id: string };

export default function usePersonaTasks() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<PersonaTaskWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      setTasks([]);
      return;
    }

    setIsLoading(true);

    // Tasks are stored under /users/[userId]/personaTasks
    const userRef = doc(USERS_COLLECTION_REF, user.uid);
    const tasksCollectionRef = collection(userRef, "personaTasks");

    const unsubscribe = onSnapshot(tasksCollectionRef, (snapshot) => {
      const next: PersonaTaskWithId[] = [];
      snapshot.forEach((taskDoc) => {
        const data = taskDoc.data() as PersonaTaskDocumentType;
        next.push({ ...data, id: taskDoc.id });
      });
      setTasks(next);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { tasks, isLoading };
}
