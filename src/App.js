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
      <Logopage />
      <Routes>
        <Route path="/home" element={<Home />} /> {/* Home 컴포넌트 라우팅 */}
        <Route path="/uploadpage" element={<Uploadpage />} />
        <Route path="/profile" element={<Profile />} />
        {/* Logopage 컴포넌트 라우팅 */}
      </Routes>
    </div>
  );
}

export default App;
