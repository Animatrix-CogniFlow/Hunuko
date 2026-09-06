import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// This pulls your secret keys from the .env file we made earlier
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== "your_firebase_web_api_key"
    ? import.meta.env.VITE_FIREBASE_API_KEY
    : "AIzaSyDummyKeyForLocalDevelopmentAndPreview00",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hunuko-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hunuko-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hunuko-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

// Initialize the Firebase app
const app = initializeApp(firebaseConfig);

// Initialize and export the specific tools we need
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
