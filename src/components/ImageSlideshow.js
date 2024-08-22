import React, { useState } from "react";
import "./ImageSlideshow.css"; // 스타일 시트 import

const images = [
  "/사진/로고페이지1.JPG",
  "/사진/로고페이지2.JPG",
  "/사진/로고페이지3.JPG",

  "/사진/포트폴리오1홈.JPG",
  "/사진/포트폴리오2게시물.JPG",
  "/사진/포트폴리오3사이드메뉴.JPG",
  "/사진/포트폴리오4업로드페이지.JPG",
  "/사진/포트폴리오5다이렉트메세지.JPG",
  "/사진/포트폴리오5알림.JPG",
  "/사진/포트폴리오6프로필.JPG",

  "/사진/포트폴리오7반응형팔로워리스트.JPG",
  "/사진/포트폴리오7반응형홈.JPG",
  "/사진/포트폴리오8반응형메세지.JPG",
  "/사진/포트폴리오9반응형프로필.JPG",
  "/사진/포트폴리오10반응형업로드.JPG",
  // 여기에 모든 이미지 경로 추가
];

const ImageSlideshow = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevClick = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNextClick = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="slideshow-container">
      <img
        src={process.env.PUBLIC_URL + images[currentImageIndex]}
        alt={`Slide ${currentImageIndex}`}
        className="slide-image"
      />
      <div className="slide-counter">
        {currentImageIndex + 1} / {images.length}
      </div>
      <button className="prev-button" onClick={handlePrevClick}>
        &#10094;
      </button>
      <button className="next-button" onClick={handleNextClick}>
        &#10095;
      </button>
    </div>
  );
};

export default ImageSlideshow;
