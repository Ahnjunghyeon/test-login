import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import Profile from "./pages/Profile";
import ProtectedRoute from "./utill/ProtectedRoute";
import Uploadpage from "./pages/Uploadpage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// DM Serif Text 웹 폰트 가져오기
const link = document.createElement("link");
link.href =
  "https://fonts.googleapis.com/css2?family=DM+Serif+Text:ital@0;1&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="*" element={<App />} />
        <Route
          path="/uploadpage/*"
          element={
            <ProtectedRoute>
              <Uploadpage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:uid"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  </React.StrictMode>
);
