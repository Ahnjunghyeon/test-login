import React from "react";
import { createRoot } from "react-dom/client"; // createRoot를 가져옴
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import Profile from "./Profile";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./Dashboard";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// createRoot를 사용하여 루트 요소를 렌더링
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
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
