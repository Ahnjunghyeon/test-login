// src/Dashboard.js

import React from "react";
import CustomNavbar from "./components/CustomNavbar"; // Import the CustomNavbar component

const Dashboard = ({ user }) => {
  return (
    <div>
      <CustomNavbar user={user} />
      <h1>Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
};

export default Dashboard;
