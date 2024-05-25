import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiq9APwd88zKoqCuQl28m-5DveGdVzZNY",
  authDomain: "login-test-a417d.firebaseapp.com",
  projectId: "login-test-a417d",
  storageBucket: "login-test-a417d.appspot.com",
  messagingSenderId: "1031009350397",
  appId: "1:1031009350397:web:4dd18150426112d2ddc494",
  measurementId: "G-F1M6ZNPB0H",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app); // Firestore 초기화

export { storage, db }; // Firestore를 export
