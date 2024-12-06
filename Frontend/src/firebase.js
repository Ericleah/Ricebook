// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebase from "firebase/compat/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbDw1jZqkVhSUGV8jwfn46TTo2iCTaBHM",
  authDomain: "cw206-ricebook-7e5b0.firebaseapp.com",
  projectId: "cw206-ricebook-7e5b0",
  storageBucket: "cw206-ricebook-7e5b0.firebasestorage.app",
  messagingSenderId: "735763114004",
  appId: "1:735763114004:web:d4e68f53968ecabfbe9f01",
  measurementId: "G-Z8GJKJWD5R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized successfully.");

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };