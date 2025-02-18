import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBdAHL6I8TiFqnhp5ejLi-EVZ7tlRqw4WY",
    authDomain: "telstraacronymlookup.firebaseapp.com",
    projectId: "telstraacronymlookup",
    storageBucket: "telstraacronymlookup.firebasestorage.app",
    messagingSenderId: "662978105150",
    appId: "1:662978105150:web:3e88d8beaf814cecdf666f",
    measurementId: "G-MCLL301JD2"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);

export { db };
