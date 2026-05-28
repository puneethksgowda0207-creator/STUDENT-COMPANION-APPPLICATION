import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3kVmqaBr4CLhBClNvSaeSdb_BKwWAqvY",
  authDomain: "student-companion-app-11a15.firebaseapp.com",
  projectId: "student-companion-app-11a15",
  storageBucket: "student-companion-app-11a15.firebasestorage.app",
  messagingSenderId: "155619924808",
  appId: "1:155619924808:web:e8d2019d4b834caf68b17d",
  measurementId: "G-6EFF00HFQQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
