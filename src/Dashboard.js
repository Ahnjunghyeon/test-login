// src/Dashboard.js

import React from "react";
import "./Dashboard.css";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import CustomNavbar from "./components/CustomNavbar"; // Import the CustomNavbar component

function Dashboard() {
  return (
    <>
      <CustomNavbar />
      <div className="App">
        <div className="Main">
          <div class="wrapper">
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
            <div>5</div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Dashboard;
