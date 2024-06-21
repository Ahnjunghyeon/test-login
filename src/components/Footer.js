import React from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import "./Footer.css";

const Footer = () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const profileLink = currentUser ? `/profile/${currentUser.uid}` : "#";

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h2>사이트 정보</h2>
          <p>이 사이트에 대한 간단한 설명이 들어갈 수 있습니다.</p>
        </div>
        <div className="footer-section links">
          <h2>링크</h2>
          <ul>
            <li>
              <Link to="/">홈</Link>
            </li>
            <li>
              <Link to="/home">메인</Link>
            </li>
            <li>
              <Link to={profileLink}>프로필</Link>
            </li>
          </ul>
        </div>
        <div className="footer-section contact-form">
          <h2>문의하기</h2>
          <form action="#">
            <div className="email">이메일 주소 : 1271wndgusdl@naver.com</div>
          </form>
        </div>
      </div>
      <div className="footer-bottom">&copy; 2024 My Website.</div>
    </footer>
  );
};

export default Footer;
