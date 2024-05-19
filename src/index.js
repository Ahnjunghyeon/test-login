// src/index.js

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";
import Profile from "./Profile";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./Dashboard";
import { initializeApp } from "firebase/app";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const firebaseConfig = {
  apiKey: "AIzaSyBiq9APwd88zKoqCuQl28m-5DveGdVzZNY",
  authDomain: "login-test-a417d.firebaseapp.com",
  projectId: "login-test-a417d",
  storageBucket: "login-test-a417d.appspot.com",
  messagingSenderId: "1031009350397",
  appId: "1:1031009350397:web:4dd18150426112d2ddc494",
  measurementId: "G-F1M6ZNPB0H",
};

// Firebase 초기화
initializeApp(firebaseConfig);

ReactDOM.render(
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
  </React.StrictMode>,
  document.getElementById("root")
);
