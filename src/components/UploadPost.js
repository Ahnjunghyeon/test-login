import React, { useState, useEffect } from "react";
import { Box, CardMedia, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function UploadPost({ imageUrls }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0); // 이미지 목록이 변경될 때마다 첫 번째 이미지를 보여주도록 인덱스를 초기화
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
    <Box className="img" style={{ width: "100%", position: "relative" }}>
      <CardMedia
        component="img"
        image={imageUrls[currentImageIndex]}
        alt={`image-${currentImageIndex}`}
        style={{
          width: "100%", // 카드의 너비에 맞게 이미지 크기 조정
          height: "auto", // 원본 비율 유지
          objectFit: "cover", // 이미지를 요소에 맞게 잘라서 보여줌
          maxWidth: "100%", // 최대 너비 100%로 설정
          maxHeight: "100%", // 최대 높이 100%로 설정
        }}
      />
      {imageUrls.length > 1 && (
        <>
          <IconButton
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              transform: "translateY(-50%)",
              color: "white",
            }}
            onClick={handlePrevImage}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            style={{
              position: "absolute",
              top: "50%",
              right: 0,
              transform: "translateY(-50%)",
              color: "white",
            }}
            onClick={handleNextImage}
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
}

export default UploadPost;
