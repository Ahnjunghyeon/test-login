// EditPostDialog.js
import React, { useState } from "react";
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

const EditPostDialog = ({ open, onClose, post, onSave }) => {
  const [content, setContent] = useState(post.content || "");
  const [imageUrls, setImageUrls] = useState(post.imageUrls || []);
  const [category, setCategory] = useState(post.category || "");
  const [loading, setLoading] = useState(false);

  const storage = getStorage();

  const handleSaveEdit = async () => {
    const updatedPost = { content, imageUrls, category };
    await onSave(post.id, updatedPost);
    onClose();
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
    const imageRef = ref(storage, imageUrlToRemove);

    try {
      await deleteObject(imageRef);
      setImageUrls((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>게시물 수정</DialogTitle>
      <DialogContent>
        {imageUrls.map((imageUrl, index) => (
          <div
            key={index}
            style={{ position: "relative", marginBottom: "10px" }}
          >
            <img
              src={imageUrl}
              alt={`image-${index}`}
              style={{ maxWidth: "100%" }}
            />
            <Button
              onClick={() => handleRemoveImage(index)}
              style={{ position: "absolute", top: 0, right: 0 }}
            >
              이미지 삭제
            </Button>
          </div>
        ))}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          style={{ marginTop: "10px" }}
        />
        <TextField
          margin="dense"
          id="content"
          label="내용"
          type="text"
          multiline
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
          <InputLabel id="category-label">주제</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label="Category"
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSaveEdit}>저장</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPostDialog;
