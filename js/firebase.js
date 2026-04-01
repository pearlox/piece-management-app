import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const app = initializeApp({
  apiKey: "AIzaSyBKcwupG5qumMzcs_1bdA93IHsJP4pGn08",
  projectId: "piece-management",
});

export const db = getFirestore(app);
export const auth = getAuth(app);