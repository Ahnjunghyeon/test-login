import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Header from "./components/Header";
import Uploadpage from "./pages/Uploadpage";
import Logopage from "./pages/Logopage";
import Profile from "./pages/Profile";
import FollowersPage from "./pages/FollowersPage";
import Footer from "./components/Footer";
import PostPage from "./pages/PostPage";
import LoginModal from "./components/LoginModal"; // LoginModal import 수정

function App() {
  return (
    <div className="App">
      <Header />
      <div className="content">
        <Routes>
          <Route path="/" element={<Logopage />} />
          <Route path="/home/*" element={<Home />} />
          <Route path="/uploadpage" element={<Uploadpage />} />
          <Route path="/profile/:uid" element={<Profile />} />
          <Route path="/followers" element={<FollowersPage />} />
          <Route path="/posts/:uid/:postId" element={<PostPage />} />
          <Route path="/login" element={<LoginModal />} />{" "}
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
