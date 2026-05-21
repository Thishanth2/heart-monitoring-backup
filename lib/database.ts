import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export async function saveQuestionnaire(userId: string, data: any) {
  return addDoc(collection(db, "users", userId, "questionnaires"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function saveMAX30102Reading(userId: string, data: any) {
  return addDoc(collection(db, "users", userId, "max30102_readings"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export function listenLatestMAX30102(userId: string, callback: any) {
  const q = query(
    collection(db, "users", userId, "max30102_readings"),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      callback(snapshot.docs[0].data());
    }
  });
}

export async function saveThermalResult(userId: string, data: any) {
  return addDoc(collection(db, "users", userId, "thermal_results"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getPatientHistory(userId: string) {
  const q = query(
    collection(db, "users", userId, "max30102_readings"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}