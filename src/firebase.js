import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCAnrXWrGm5bGpa-m-TdnHDn9baWLo_h7I",
  authDomain: "ordini-caldi.firebaseapp.com",
  projectId: "ordini-caldi",
  storageBucket: "ordini-caldi.firebasestorage.app",
  messagingSenderId: "930167832668",
  appId: "1:930167832668:web:51a9928a5ac8047ae9a699"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Aggiornamento per forzare nuovo commit - 19 aprile 2025
export const auth = getAuth(app);

// 🔐 Login automatico
signInWithEmailAndPassword(auth, "info@sushiway.it", "forzafabio")
  .then(user => console.log("✅ Login OK", user.user.email))
  .catch(err => console.error("❌ Login fallito:", err.message));

// ordini caldi test