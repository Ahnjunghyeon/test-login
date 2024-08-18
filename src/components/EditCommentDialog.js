import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const EditCommentDialog = ({ open, onClose, comment, handleUpdateComment }) => {
  const [updatedContent, setUpdatedContent] = useState(comment.content);

  // 다이얼로그가 열릴 때 댓글 내용 설정
  useEffect(() => {
    setUpdatedContent(comment.content);
  }, [comment]);

  const handleSave = () => {
    if (!updatedContent.trim()) {
      console.error("댓글 내용이 비어 있습니다.");
      return;
    }
    // 댓글 수정 핸들러 호출
    handleUpdateComment(comment.commentId, comment.postId, updatedContent);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>댓글 수정</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="comment"
          label="댓글 내용"
          type="text"
          fullWidth
          variant="outlined"
          value={updatedContent}
          onChange={(e) => setUpdatedContent(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          취소
        </Button>
        <Button onClick={handleSave} color="primary">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCommentDialog;
