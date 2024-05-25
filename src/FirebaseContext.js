// FirebaseContext.js

import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "./firebase";

// Firebase Firestore의 데이터를 관리하는 컨텍스트 생성
const FirebaseContext = createContext();

// Firebase Firestore의 데이터를 관리하는 컨텍스트의 Provider 컴포넌트
export const FirebaseProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsubscribe = db.collection("posts").onSnapshot((snapshot) => {
      const postData = [];
      snapshot.forEach((doc) => {
        postData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ posts }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Firebase Firestore의 데이터를 관리하는 컨텍스트를 사용하는 hook
export const useFirebase = () => useContext(FirebaseContext);
