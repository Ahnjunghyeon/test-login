import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  deleteObject,
  getStorage,
} from "firebase/storage";

const PostDialog = ({ open, onClose, post, handleUpdatePost }) => {
  const [content, setContent] = useState(post?.content || "");
  const [imageUrls, setImageUrls] = useState(post?.imageUrls || []);
  const [category, setCategory] = useState(post?.category || "");
  const [loading, setLoading] = useState(false);
  const storage = getStorage(); // Initialize Firebase Storage

  const handleSaveEdit = async () => {
    if (post) {
      const updatedPost = {
        content,
        imageUrls,
        category,
      };

      try {
        await handleUpdatePost(post.id, updatedPost);
        onClose();
      } catch (error) {
        console.error("Error updating post:", error);
      }
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    setLoading(true);

    const uploadedUrls = [];
    for (const file of files) {
      const imageName = `image${imageUrls.length + 1}`;
      const fileRef = ref(storage, `posts/${post.id}/${imageName}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      try {
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload is ${progress}% done`);
            },
            (error) => {
              console.error("Error uploading image:", error);
              reject(error);
            },
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
    const fileName = imageUrlToRemove.split("/").pop().split("?")[0];
    const imageRef = ref(storage, `posts/${post.id}/${fileName}`);

    try {
      await deleteObject(imageRef);
      setImageUrls((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting image from Firebase Storage:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>게시물 수정</DialogTitle>
      <DialogContent>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {imageUrls.map((imageUrl, index) => (
            <div
              key={index}
              style={{
                position: "relative",
                marginBottom: "10px",
                flex: "1 0 21%",
                height: "200px",
                overflow: "hidden",
              }}
            >
              <img
                src={imageUrl}
                alt={`image-${index}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <Button
                onClick={() => handleRemoveImage(index)}
                style={{ position: "absolute", top: 0, right: 0 }}
              >
                이미지 삭제
              </Button>
            </div>
          ))}
        </div>
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
            <MenuItem value="..">그냥</MenuItem>
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
        <Button onClick={handleSaveEdit} disabled={loading}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostDialog;
