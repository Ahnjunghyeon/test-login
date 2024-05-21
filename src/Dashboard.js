// src/Dashboard.js

import React from "react";
import "./Dashboard.css";
import CustomNavbar from "./components/CustomNavbar"; // Import the CustomNavbar component

function Dashboard() {
  return (
    <div>
      <CustomNavbar />
      <div className="Mains">
        <div id="Mains-left">
          <h3> Left Side </h3>
        </div>

        <div>
          <h2> This is Main layout </h2>
        </div>

        <div id="Mains-right">
          <h3> Right Side </h3>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;
