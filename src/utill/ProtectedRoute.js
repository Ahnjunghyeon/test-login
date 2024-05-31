// src/ProtectedRoute.js
// React 라우터의 보호된 경로를 설정
// 사용자가 인증되지 않은 경우 특정 페이지에 접근하는 것을 막음,
// 인증되지 않은 사용자 = 로그인 페이지로

import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const ProtectedRoute = ({ children }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
