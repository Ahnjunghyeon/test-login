import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const ProtectedRoute = ({ children }) => {
  const auth = getAuth();

  useEffect(() => {
    const checkAuth = () => {
      const user = auth.currentUser;
      if (!user) {
        // 사용자가 인증되지 않은 경우 로그인 페이지로 리디렉션
        // 예: Navigate 컴포넌트가 렌더링되어 있는 Routes 내에서 작동
        return <Navigate to="/login" replace />;
      }
    };

    checkAuth();
  }, [auth]);

  return children;
};

export default ProtectedRoute;
