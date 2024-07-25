import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./Logopage.css"; // 스타일 시트 import
import ImageSlideshow from "../components/ImageSlideshow"; // 슬라이드쇼 컴포넌트 import

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
          <h1 className="hero-title">GREAP에 오신 것을 환영합니다!</h1>
          <p className="hero-text">
            친한 사람들과 본인의 이야기를 공유해보세요
          </p>
          <button className="view-button" onClick={handleViewClick}>
            바로보기
          </button>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <h2 className="section-title">기능 소개</h2>
          <div className="feature-box">
            <div className="feature-item">
              <h3 className="feature-item-title">사람과의 연결</h3>
              <p className="feature-item-text">
                친구 또는 지인 혹은 모르는 사람과 Follow라는 인연을 맺어보세요.
              </p>
            </div>
            <div className="feature-item">
              <h3 className="feature-item-title">순간의 저장</h3>
              <p className="feature-item-text">
                당신이 무엇을 하는지를 공유하여 보세요!
              </p>
            </div>
            <div className="feature-item">
              <h3 className="feature-item-title">새로운 탐색</h3>
              <p className="feature-item-text">
                당신의 소중한 순간을 보낼 동안, 다른 사람은 어떤 소중한 순간을
                보냈는지 구경해보세요!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="slideshow-section">
        <h2 className="section-title">미리보기</h2>
        <ImageSlideshow />
      </section>
    </div>
  );
};

export default Logopage;
