// PostList.js

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UploadPost from "../UploadPost";

const PostList = ({ user, posts, handleUpdatePost, handleDeletePost }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState({});
  const [expanded, setExpanded] = useState({});

  const handleMenuOpen = (event, post) => {
    setMenuAnchorEl((prev) => ({ ...prev, [post.id]: event.currentTarget }));
  };

  const handleMenuClose = (post) => {
    setMenuAnchorEl((prev) => ({ ...prev, [post.id]: null }));
  };

  const handleExpandClick = (postId) => {
    setExpanded((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleOpenEditDialog = (post) => {
    setSelectedPost(post);
    setTitle(post.title);
    setContent(post.content);
    setImageUrls(post.imageUrls || []);
    setEditDialogOpen(true);
    handleMenuClose(post);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedPost(null);
  };

  const handleSaveEdit = async () => {
    if (selectedPost) {
      const updatedPost = {
        title,
        content,
        imageUrls,
      };

      try {
        await handleUpdatePost(selectedPost.id, updatedPost);
        handleCloseEditDialog();
      } catch (error) {
        console.error("Error updating post:", error);
      }
    }
  };

  const handleRemoveImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="Posts">
        {user ? (
          <>
            <h2>{user.displayName} 님의 게시물</h2>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="Post"
                  style={{ marginBottom: "20px" }}
                >
                  <Card sx={{ maxWidth: 345 }}>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                          {user && (
                            <img
                              src={user.photoURL}
                              alt="User profile"
                              style={{ width: "100%", height: "100%" }}
                            />
                          )}
                        </Avatar>
                      }
                      action={
                        <>
                          <IconButton
                            aria-label="settings"
                            onClick={(event) => handleMenuOpen(event, post)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={menuAnchorEl[post.id]}
                            open={Boolean(menuAnchorEl[post.id])}
                            onClose={() => handleMenuClose(post)}
                          >
                            <MenuItem
                              onClick={() => handleOpenEditDialog(post)}
                            >
                              글 수정
                            </MenuItem>
                            <MenuItem onClick={() => handleDeletePost(post.id)}>
                              글 삭제
                            </MenuItem>
                          </Menu>
                        </>
                      }
                      title={post.title}
                      subheader={`게시물 번호: ${post.id}`}
                    />
                    <CardMedia>
                      <UploadPost imageUrls={post.imageUrls || []} />
                    </CardMedia>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {post.content}
                      </Typography>
                    </CardContent>
                    <CardActions disableSpacing>
                      <IconButton aria-label="like">
                        <FavoriteIcon />
                      </IconButton>
                      <IconButton aria-label="share">
                        <ShareIcon />
                      </IconButton>
                      <IconButton
                        aria-expanded={expanded[post.id]}
                        aria-label="show more"
                        onClick={() => handleExpandClick(post.id)}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </CardActions>

                    <Collapse
                      in={expanded[post.id]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <CardContent>
                        <Typography paragraph>Additional content</Typography>
                      </CardContent>
                    </Collapse>
                  </Card>
                </div>
              ))
            ) : (
              <p>게시물이 없습니다.</p>
            )}
          </>
        ) : (
          <p>로그인 해주세요.</p>
        )}
      </div>

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>게시물 수정</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="제목"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
          {imageUrls.map((url, index) => (
            <div key={index} style={{ position: "relative" }}>
              <img
                src={url}
                alt=""
                style={{ width: "100%", marginTop: "10px" }}
              />
              <Button
                onClick={() => handleRemoveImage(index)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "0px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  width: "50px",
                  height: "50px",
                  minWidth: "30px",
                  fontSize: "12px",
                  padding: "0",
                }}
              >
                X
              </Button>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>취소</Button>
          <Button onClick={handleSaveEdit}>저장</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostList;
