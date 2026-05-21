import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_n_J-lZKBrJnQ_QTWI_g-38TVav3Dx1c",
  authDomain: "health-monitoring-b7b09.firebaseapp.com",
  projectId: "health-monitoring-b7b09",
  storageBucket: "health-monitoring-b7b09.firebasestorage.app",
  messagingSenderId: "815465836546",
  appId: "1:815465836546:web:1385b060bace2d0210b71b",
  measurementId: "G-ZPQZNZKHHF"
};

// Prevent re-initialization
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;