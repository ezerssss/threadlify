import { useEffect, useState } from "react";

import { User, onAuthStateChanged } from "firebase/auth";

import { auth } from "@/firebase";

export default function useUser() {
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  return user;
}
