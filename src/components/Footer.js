import React from "react";
import "./Footer.css"; // 스타일 시트 import

const Footer = () => {
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
              <a href="#">홈</a>
            </li>
            <li>
              <a href="#">소개</a>
            </li>
            <li>
              <a href="#">서비스</a>
            </li>
            <li>
              <a href="#">문의</a>
            </li>
          </ul>
        </div>
        <div className="footer-section contact-form">
          <h2>문의하기</h2>
          <form action="#">
            <input
              type="email"
              name="email"
              className="text-input contact-input"
              placeholder="이메일 주소"
            />
            <textarea
              rows="4"
              name="message"
              className="text-input contact-input"
              placeholder="메시지"
            ></textarea>
            <button type="submit" className="btn btn-primary">
              전송
            </button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">&copy; 2024 My Website.</div>
    </footer>
  );
};

export default Footer;
