import { collection } from "firebase/firestore";

import { FIREBASE_COLLECTION_ENUMS } from "@/enums/firebase";
import { db } from "@/firebase";

export const USERS_COLLECTION_REF = collection(db, FIREBASE_COLLECTION_ENUMS.USERS_COLLECTION);
