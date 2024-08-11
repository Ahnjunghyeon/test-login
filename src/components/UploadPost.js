import React, { useState, useEffect } from "react";
import { Box, CardMedia, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { styled } from "@mui/system";

// 스타일링을 위한 스타일드 컴포넌트
const ImageContainer = styled(Box)({
  width: "100%",
  position: "relative",
  maxWidth: "800px",
  maxHeight: "600px",
});

const StyledCardMedia = styled(CardMedia)({
  width: "100%",
  height: "auto",
  maxHeight: "500px",
  objectFit: "contain", // 수정된 부분: 비율을 유지하며 이미지가 영역 내에 맞추어지도록 설정
  alignItems: "center",
  justifyContent: "center",
});

const NavigationButton = styled(IconButton)({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  color: "white",
});

function UploadPost({ imageUrls }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // imageUrls가 변경될 때마다 새로운 이미지 목록으로 currentImageIndex를 초기화
  useEffect(() => {
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [imageUrls]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!imageUrls || imageUrls.length === 0) {
    return null; // 이미지가 없는 경우 렌더링하지 않음
  }

  return (
    <ImageContainer>
      <StyledCardMedia
        component="img"
        image={imageUrls[currentImageIndex]}
        alt={`image-${currentImageIndex}`}
      />
      {imageUrls.length > 1 && (
        <>
          <NavigationButton style={{ left: 0 }} onClick={handlePrevImage}>
            <ChevronLeftIcon />
          </NavigationButton>
          <NavigationButton style={{ right: 0 }} onClick={handleNextImage}>
            <ChevronRightIcon />
          </NavigationButton>
        </>
      )}
    </ImageContainer>
  );
}

export default UploadPost;
