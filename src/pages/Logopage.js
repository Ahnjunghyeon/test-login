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

  const handleViewClick = () => {
    navigate("/home");
  };

  return (
    <div className="main-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title" style={{ fontFamily: "BMJUA" }}>
            SNSWEB 에 오신 것을 환영합니다!
          </h1>
          <p className="hero-text" style={{ fontFamily: "BMJUA" }}>
            당신의 이야기를 공유해보세요
          </p>
          <button className="view-button" onClick={handleViewClick}>
            바로가기
          </button>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <h2 className="section-title">기능 소개</h2>
          <div className="feature-box">
            <div className="feature-item">
              <h3 className="feature-item-title">팔로우</h3>
              <p className="feature-item-text">
                기능 설명 : 서로 계정간의 팔로우가 추가,
                <br /> 각자 팔로우한 사람이 업로드한 게시물은 홈페이지에서 출력
              </p>
            </div>
            <div className="feature-item">
              <h3 className="feature-item-title">게시물 업로드</h3>
              <p className="feature-item-text">
                주제를 선택 , 내용 , 사진을 업로드
                <br /> 수정 및 제거
              </p>
            </div>
            <div className="feature-item">
              <h3 className="feature-item-title">댓글</h3>
              <p className="feature-item-text">게시물에 댓글 입력</p>
            </div>
            <div className="feature-item">
              <h3 className="feature-item-title">프로필 및 검색</h3>
              <p className="feature-item-text">
                프로필 이름 변경 및 이름으로 검색 하여 프로필 방문
              </p>
            </div>
            <div className="feature-item">
              <h3 className="feature-item-title">
                카테고리별 <br />
                출력
              </h3>
              <p className="feature-item-text">
                원하는 카테고리를 선택하여 보기
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
