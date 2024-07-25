import React, { useState } from "react";
import "./ImageSlideshow.css"; // 스타일 시트 import

const images = [
  "/img/사진/포트폴리오1.jpg",
  "/img/사진/포트폴리오2.jpg",
  "/img/사진/포트폴리오3.jpg",
  "/img/사진/포트폴리오4.jpg",
  "/img/사진/포트폴리오5.jpg",
  "/img/사진/포트폴리오-1.jpg",
  "/img/사진/포트폴리오-2.jpg",
  "/img/사진/포트폴리오-3.jpg",
  "/img/사진/포트폴리오-4.jpg",
  "/img/사진/포트폴리오-5.jpg",
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
        src={images[currentImageIndex]}
        alt={`Slide ${currentImageIndex}`}
        className="slide-image"
      />
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
