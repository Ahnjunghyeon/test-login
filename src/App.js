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
import NotificationsPage from "./pages/NotificationsPage";
import DirectMessagesPage from "./pages/DirectMessagesPage";

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
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route
            path="/direct-messages/:userId"
            element={<DirectMessagesPage />}
          />
          <Route path="/messages" element={<DirectMessagesPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
