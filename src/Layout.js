// Layout.js
import React from "react";
import CustomNavbar from "./components/CustomNavbar"; // CustomNavbar 컴포넌트를 import합니다.

const Layout = ({ children }) => {
  return (
    <div>
      <CustomNavbar /> {/* 공통 네비게이션 바 */}
      {children} {/* 각 페이지 컴포넌트 */}
    </div>
  );
};

export default Layout;
