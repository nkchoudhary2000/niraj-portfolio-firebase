import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your real Web App Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdoq2Yy7cj5dwhUJBxEJx2vv3eSOAZn8k",
  authDomain: "niraj-portfolio-a7011.firebaseapp.com",
  projectId: "niraj-portfolio-a7011",
  storageBucket: "niraj-portfolio-a7011.firebasestorage.app",
  messagingSenderId: "875063736113",
  appId: "1:875063736113:web:fed37b897ec2e71a4e6210",
  measurementId: "G-6RM3HBL0W0"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Export Auth, Firestore, and Google Provider for app components
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;