import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./Logopage.css"; // 스타일 시트 import
import ImageSlideshow from "../components/ImageSlideshow"; // 슬라이드쇼 컴포넌트 import
import FeatureItem from "../components/FeatureItem"; // 기능 항목 컴포넌트 import

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
            <FeatureItem
              title="팔로우"
              text="서로 유저간에 팔로우,<br /> 각자 업로드한 게시물은 홈 페이지에서 출력"
            />
            <FeatureItem
              title="게시물 업로드"
              text="주제를 선택, 내용, 사진을 업로드<br /> 수정 및 제거"
            />
            <FeatureItem
              title="댓글"
              text="게시물에 대한 댓글 기능<br /> 댓글의 수정 및 삭제"
            />
            <FeatureItem
              title="프로필 및 검색"
              text="프로필 이름 변경 및 이름으로 검색 하여 프로필 방문"
            />
            <FeatureItem
              title="다이렉트 메세지"
              text="팔로우한 유저간에 메세지를 주고 받음<br /> 메세지의 삭제 기능"
            />
            <FeatureItem
              title="알림"
              text="게시물, 팔로우, 좋아요 등 이벤트가 있을 때<br /> 알림이 오게 설정<br /> 알림의 모두 읽음 처리, 모두 삭제, 삭제 가능"
            />
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
