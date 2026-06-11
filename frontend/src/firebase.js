import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCISSWG2eYJdiSgw5MjtDewfVS8UEhH-Os",
  authDomain: "pals-c0dc6.firebaseapp.com",
  projectId: "pals-c0dc6",
  storageBucket: "pals-c0dc6.firebasestorage.app",
  messagingSenderId: "759581958460",
  appId: "1:759581958460:web:1b7e9c4f37b4222c2d3e39"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);