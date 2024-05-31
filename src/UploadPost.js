import React, { useState, useEffect } from "react";
import { Box, CardMedia, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function UploadPost({ imageUrls }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // 이미지 목록이 변경될 때마다 첫 번째 이미지를 보여주도록 인덱스를 초기화
    setCurrentImageIndex(0);
  }, [imageUrls]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === 0) {
        return imageUrls.length - 1;
      } else {
        return prevIndex - 1;
      }
    });
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex === imageUrls.length - 1) {
        return 0;
      } else {
        return prevIndex + 1;
      }
    });
  };

  if (!imageUrls || imageUrls.length === 0) {
    return null; // 이미지가 없는 경우 렌더링하지 않음
  }

  return (
    <Box>
      <CardMedia
        component="img"
        height="auto"
        image={imageUrls[currentImageIndex]}
        alt={`image-${currentImageIndex}`}
      />
      {imageUrls.length > 1 && (
        <IconButton onClick={handlePrevImage}>
          <ArrowBackIcon />
        </IconButton>
      )}
      {imageUrls.length > 1 && (
        <IconButton onClick={handleNextImage}>
          <ArrowForwardIcon />
        </IconButton>
      )}
    </Box>
  );
}

export default UploadPost;
