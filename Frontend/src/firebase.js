// Import required Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBbDw1jZqkVhSUGV8jwfn46TTo2iCTaBHM",
  authDomain: "cw206-ricebook-7e5b0.firebaseapp.com",
  projectId: "cw206-ricebook-7e5b0",
  storageBucket: "cw206-ricebook-7e5b0.firebasestorage.app",
  messagingSenderId: "735763114004",
  appId: "1:735763114004:web:d4e68f53968ecabfbe9f01",
  measurementId: "G-Z8GJKJWD5R"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized successfully.");

// Initialize Firebase Authentication and Google Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
