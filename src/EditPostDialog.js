// EditPostDialog.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

function EditPostDialog({
  open,
  onClose,
  title,
  content,
  imageUrls,
  uploading,
  onTitleChange,
  onContentChange,
  onImageChange,
  onRemoveImage,
  onSave, // onSave 함수 추가
}) {
  const handleSave = () => {
    // 수정된 정보를 onSave 함수로 전달하여 Firebase에 업데이트합니다.
    onSave(title, content, imageUrls);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>글 수정</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          type="text"
          fullWidth
          value={title}
          onChange={onTitleChange}
        />
        <TextField
          margin="dense"
          label="Content"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={onContentChange}
        />
        {imageUrls.length > 0 && (
          <div>
            {imageUrls.map((url, index) => (
              <div key={index} style={{ marginTop: "10px" }}>
                <img
                  src={url}
                  alt="Current"
                  height="100"
                  style={{ marginRight: "10px" }}
                />
                <Button onClick={() => onRemoveImage(index)} color="secondary">
                  Remove Image
                </Button>
              </div>
            ))}
          </div>
        )}
        <input
          accept="image/*"
          id="image-input"
          type="file"
          onChange={onImageChange}
          multiple
          style={{ display: "none" }}
        />
        <label htmlFor="image-input">
          <Button component="span">Upload Image</Button>
        </label>
        {uploading && (
          <CircularProgress size={24} style={{ marginTop: "10px" }} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={uploading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditPostDialog;
