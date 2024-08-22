import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
  deleteObject,
} from "firebase/storage";
import "./EditPostDialog.css"; // CSS 파일 임포트

const EditPostDialog = ({ open, onClose, post, onSave }) => {
  const [content, setContent] = useState(post.content || "");
  const [imageUrls, setImageUrls] = useState(post.imageUrls || []);
  const [category, setCategory] = useState(post.category || "");
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const storage = getStorage();

  useEffect(() => {
    if (post) {
      setContent(post.content || "");
      setImageUrls(post.imageUrls || []);
      setCategory(post.category || "");
    }
  }, [post]);

  const handleSaveEdit = async () => {
    setLoading(true);
    const updatedPost = { content, imageUrls, category };
    try {
      await onSave(post.id, updatedPost);
      onClose();
    } catch (error) {
      console.error("Error saving post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    setLoading(true);

    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageName = `image${imageUrls.length + i + 1}`;
      const fileRef = ref(storage, `posts/${post.id}/${imageName}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      try {
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(downloadURL);
              resolve();
            }
          );
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        setLoading(false);
        return;
      }
    }

    setImageUrls((prev) => [...prev, ...uploadedUrls]);
    setLoading(false);
  };

  const handleRemoveImage = async (index) => {
    const imageUrlToRemove = imageUrls[index];
    const imageRef = ref(storage, `posts/${post.id}/${imageUrlToRemove}`);

    try {
      await deleteObject(imageRef);
      setImageUrls((prev) => prev.filter((_, i) => i !== index));
      // Adjust currentImageIndex if the removed image was the current one
      if (currentImageIndex >= imageUrls.length - 1 && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imageUrls.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>게시물 수정</DialogTitle>
      <div className="dialog-content">
        {imageUrls.length > 0 && (
          <div className="image-gallery">
            <Button
              onClick={handlePrevImage}
              className="nav-button prev-button"
              disabled={imageUrls.length === 0}
            >
              &lt;
            </Button>
            <div className="image-container">
              <img
                src={imageUrls[currentImageIndex]}
                alt={`image-${currentImageIndex}`}
                className="gallery-image"
              />
              <Button
                onClick={() => handleRemoveImage(currentImageIndex)}
                className="delete-button"
              >
                이미지 삭제
              </Button>
            </div>
            <Button
              onClick={handleNextImage}
              className="nav-button next-button"
              disabled={imageUrls.length === 0}
            >
              &gt;
            </Button>
            <div className="image-info">
              {`${currentImageIndex + 1} / ${imageUrls.length}`}
            </div>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="input-file"
        />
        <TextField
          margin="dense"
          id="content"
          label="내용"
          type="text"
          multiline
          fullWidth
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="text-field"
        />
        <FormControl fullWidth variant="outlined" className="form-control">
          <InputLabel id="category-label">주제</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label="주제"
          >
            <MenuItem value="">주제 선택</MenuItem>
            <MenuItem value="그냥">그냥</MenuItem>
            <MenuItem value="여행">여행</MenuItem>
            <MenuItem value="음식">음식</MenuItem>
            <MenuItem value="요리">요리</MenuItem>
            <MenuItem value="일상">일상</MenuItem>
            <MenuItem value="게임">게임</MenuItem>
            <MenuItem value="음악">음악</MenuItem>
            <MenuItem value="자기계발">자기계발</MenuItem>
          </Select>
        </FormControl>
      </div>
      <DialogActions className="dialog-actions">
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSaveEdit} disabled={loading}>
          {loading ? "저장 중..." : "저장"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPostDialog;
