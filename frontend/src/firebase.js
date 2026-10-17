import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDdfK155KfxNG81obExrh25QA9fPdx3oKQ",
  authDomain: "authvault-b2580.firebaseapp.com",
  projectId: "authvault-b2580",
  storageBucket: "authvault-b2580.firebasestorage.app",
  messagingSenderId: "957802220285",
  appId: "1:957802220285:web:4a05fcc4451733522d8c94",
  measurementId: "G-SY0259CZ37"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();