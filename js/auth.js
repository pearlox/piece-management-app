// auth.js
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import { auth } from "./firebase.js";

// login
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// logout
export function logout() {
  return signOut(auth);
}

// session
export function onUserChange(callback) {
  onAuthStateChanged(auth, callback);
}