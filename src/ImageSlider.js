import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Typography from "@mui/material/Typography";

function ImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const showImageCount = 1; // 한 번에 보여줄 이미지 수

  const nextImage = () => {
    if (currentIndex < images.length - showImageCount) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div>
      <IconButton onClick={prevImage} disabled={currentIndex === 0}>
        <NavigateBeforeIcon />
      </IconButton>
      {images
        .slice(currentIndex, currentIndex + showImageCount)
        .map((image, index) => (
          <div key={index}>
            <img src={image} alt={`Image ${currentIndex + index + 1}`} />
          </div>
        ))}
      <IconButton
        onClick={nextImage}
        disabled={currentIndex >= images.length - showImageCount}
      >
        <NavigateNextIcon />
      </IconButton>
      <Typography variant="caption" align="center">
        Showing {currentIndex + 1} -{" "}
        {Math.min(currentIndex + showImageCount, images.length)} of{" "}
        {images.length} images
      </Typography>
    </div>
  );
}

export default ImageSlider;
