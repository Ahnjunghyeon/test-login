import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./Logopage.css"; // 스타일 시트 import

const Logopage = () => {
  const [user, setUser] = useState(null); // 로그인 상태를 담는 상태 변수
  const navigate = useNavigate(); // useNavigate hook을 이용하여 페이지 이동을 처리
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // "바로보기" 버튼 클릭 시 처리 함수
  const handleViewClick = () => {
    // 홈 페이지로 이동
    navigate("/home");
  };

  // "글 업로드" 버튼 클릭 시 처리 함수
  const handleUploadClick = () => {
    if (!user) {
      alert("로그인이 필요합니다."); // 로그인이 필요한 경우 경고창 출력 (실제로는 모달 등의 방식으로 변경 가능)
    } else {
      // 로그인이 되어 있으면 글 업로드 페이지로 이동
      navigate("/uploadpage");
    }
  };

  return (
    <div className="main-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Our Website</h1>
          <p className="hero-text">
            Discover the best services and products for your needs.
          </p>
          <a href="#services" className="btn-primary">
            <Link to="/home" className="button" onClick={handleViewClick}>
              바로보기
            </Link>{" "}
          </a>
          {!user && ( // user가 없으면 (로그인이 되어 있지 않으면)
            <p style={{ textAlign: "center", marginTop: "20px", color: "red" }}>
              로그인이 필요합니다.
            </p>
          )}
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          <div className="feature-box">
            <div className="feature-item">
              <h3 className="feature-item-title">Feature 1</h3>
              <p className="feature-item-text">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
            <div className="feature-item">
              <h3 className="feature-item-title">Feature 2</h3>
              <p className="feature-item-text">
                Sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua.
              </p>
            </div>
            <div className="feature-item">
              <h3 className="feature-item-title">Feature 3</h3>
              <p className="feature-item-text">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="services" id="services">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="service-box">
            <div className="service-item">
              <h3 className="service-item-title">Service 1</h3>
              <p className="service-item-text">
                Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua.
              </p>
            </div>
            <div className="service-item">
              <h3 className="service-item-title">Service 2</h3>
              <p className="service-item-text">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
            <div className="service-item">
              <h3 className="service-item-title">Service 3</h3>
              <p className="service-item-text">
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Logopage;
