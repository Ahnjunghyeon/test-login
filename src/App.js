import React from "react";
import { Routes, Route } from "react-router-dom";

import "./App.css";
import Home from "./pages/Home";
import Header from "./components/Header"; // Header 컴포넌트 import 추가
import Uploadpage from "./pages/Uploadpage";
import Logopage from "./pages/Logopage"; // Logopage 컴포넌트 import 추가
import Profile from "./pages/Profile";

function App() {
  return (
    <div>
      <Header /> {/* 헤더 추가 */}
      <Routes>
        <Route path="/" element={<Logopage />} />{" "}
        {/* 기본 경로로 Logopage 설정 */}
        <Route path="/home" element={<Home />} /> {/* Home 컴포넌트 라우팅 */}
        <Route path="/uploadpage" element={<Uploadpage />} />
        <Route path="/profile/:uid" element={<Profile />} />{" "}
        {/* uid 파라미터 추가 */}
      </Routes>
    </div>
  );
}

export default App;
