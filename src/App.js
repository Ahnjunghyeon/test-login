import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Header from "./components/Header";
import Uploadpage from "./pages/Uploadpage";
import Logopage from "./pages/Logopage";
import Profile from "./pages/Profile";
import FollowersPage from "./pages/FollowersPage"; // 추가
import Footer from "./components/Footer";

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Logopage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/uploadpage" element={<Uploadpage />} />
        <Route path="/profile/:uid" element={<Profile />} />
        <Route path="/followers" element={<FollowersPage />} /> {/* 추가 */}
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
