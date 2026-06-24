import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const userFirebaseConfig = {
  apiKey: "AIzaSyBUXjRRXnMDNg0HEARgdPFJwjIiXJjFyH4",
  authDomain: "jizpistartup.firebaseapp.com",
  projectId: "jizpistartup",
  storageBucket: "jizpistartup.firebasestorage.app",
  messagingSenderId: "385867797256",
  appId: "1:385867797256:web:fb22e2085b54adf40752bd",
  measurementId: "G-5B9ST8F778"
};

const sandboxFirebaseConfig = {
  apiKey: "AIzaSyBjG3lELZZmQ5BFtTNkb4mCgT8iCSByW7w",
  authDomain: "gen-lang-client-0357300587.firebaseapp.com",
  projectId: "gen-lang-client-0357300587",
  storageBucket: "gen-lang-client-0357300587.firebasestorage.app",
  messagingSenderId: "562295275842",
  appId: "1:562295275842:web:dc2bd784f144e5514088db"
};

// Initialize the selected App and DB dynamically at module load
const useSandbox = localStorage.getItem("use_sandbox_db") !== "false";

let app;
let database: Firestore;

if (useSandbox) {
  app = initializeApp(sandboxFirebaseConfig, "sandboxApp");
  database = getFirestore(app, "ai-studio-a3b55051-e791-4b8d-bcff-9153537267c7");
} else {
  app = initializeApp(userFirebaseConfig);
  database = getFirestore(app);
}

export const db = database;

