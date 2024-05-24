import React from "react";
import "./App.css";
import CustomNavbar from "./components/CustomNavbar"; // CustomNavbar 컴포넌트를 import합니다.

function App() {
  return (
    <div className="App">
      <CustomNavbar /> {/* CustomNavbar 컴포넌트를 추가합니다. */}
      <div className="Home">
        <div className="HomeHeader">gg</div>
      </div>
    </div>
  );
}

export default App;
