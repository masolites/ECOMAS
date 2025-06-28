
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAo1BHpTKsFSsqBgZLARkyNWslGBEt7aE4",
  authDomain: "paze-b529b.firebaseapp.com",
  projectId: "paze-b529b",
  storageBucket: "paze-b529b.appspot.com",
  messagingSenderId: "838658270171",
  appId: "1:838658270171:web:60138628a6edbbf7cb7dfe"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
