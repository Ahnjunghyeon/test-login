// src/Dashboard.js

import React from "react";
import "./Dashboard.css";
import CustomNavbar from "./components/CustomNavbar";

function Dashboard() {
  return (
    <>
      <CustomNavbar />
      <div className="Dashboard">
        <div className="D-main"></div>
      </div>
    </>
  );
}
export default Dashboard;
