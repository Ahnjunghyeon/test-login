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
        <p>&copy; 2024 Your Company. All rights reserved.</p>
        <div className="social-links">
          <a href="#!">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="#!">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#!">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
