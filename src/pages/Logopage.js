import React from "react";
import { Link } from "react-router-dom";
import "./Logopage.css"; // 스타일 시트 import

const Logopage = () => {
  return (
    <div className="logopage-container">
      <div className="logo-container"></div>
      <div className="intro-text">
        <h1>Welcome to My Website</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
          convallis libero sed justo cursus, eu tempus magna fermentum. Nam
          bibendum, libero eu mattis laoreet, leo nisi tristique justo, nec
          volutpat tellus ipsum eget nisi.
        </p>
      </div>
      <div className="navigation-buttons">
        <Link to="/home" className="button">
          Go to Home
        </Link>{" "}
        {/* 홈으로 이동하는 버튼 */}
        <Link to="/about" className="button">
          Learn More About Us
        </Link>{" "}
        {/* 회사 소개 페이지로 이동하는 버튼 */}
      </div>
    </div>
  );
};

export default Logopage;
