import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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
