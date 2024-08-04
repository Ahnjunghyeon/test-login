import React from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import "./Footer.css";

const Footer = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const profileLink = currentUser ? `/profile/${currentUser.uid}` : "#";

  return (
    <footer className="footer" id="contact">
      <div className="footer-content">
        <p style={{ fontFamily: "BMJUA" }}>&copy; 2024. 08. 04 업데이트</p>
      </div>
    </footer>
  );
};

export default Footer;
