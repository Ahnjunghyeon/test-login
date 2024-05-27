// UploadPost.js
import React, { useState } from "react";
import { Box, CardMedia, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function UploadPost({ imageUrls }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
