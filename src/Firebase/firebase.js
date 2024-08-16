import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBiq9APwd88zKoqCuQl28m-5DveGdVzZNY",
  authDomain: "login-test-a417d.firebaseapp.com",
  databaseURL: "https://login-test-a417d.firebaseio.com",
  projectId: "login-test-a417d",
  storageBucket: "login-test-a417d.appspot.com",
  messagingSenderId: "1031009350397",
  appId: "1:1031009350397:web:4dd18150426112d2ddc494",
  measurementId: "G-F1M6ZNPB0H",
};

// Firebase 초기화 (이미 초기화된 앱이 있는지 확인)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);
const db = getFirestore(app); // Firestore 초기화
const auth = getAuth(app);
const functions = getFunctions(app);

export { auth, storage, db, functions }; // 필요한 모듈들을 export
