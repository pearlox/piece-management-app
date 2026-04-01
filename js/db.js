import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

import { db } from "./firebase.js";

export async function getEntries() {
  const snap = await getDocs(collection(db, "entries"));

  let entries = [];

  snap.forEach((doc) => {
    entries.push({
      ...doc.data(),
      id: doc.id,   // ✅ THIS LINE FIXES EVERYTHING
    });
  });

  return entries;
}

export const addEntry = (data) => addDoc(collection(db, "entries"), data);
export const updateEntry = (id, data) => updateDoc(doc(db, "entries", id), data);
export const deleteEntry = async (id) => {
  console.log("🔥 Deleting from Firebase:", id);
  await deleteDoc(doc(db, "entries", id));
};