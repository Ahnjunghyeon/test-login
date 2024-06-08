import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  Typography,
  IconButton,
  Avatar,
  Collapse,
  Button,
  TextField,
} from "@mui/material";
import {
  CardActions,
  CardContent,
  CardMedia,
  CardHeader,
  Card,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import UploadPost from "../UploadPost";
import ProfileImage from "./Profilelogo";

const PostList = ({
  user,
  posts,
  displayName,
  handleUpdatePost,
  handleDeletePost,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState({});
  const [expanded, setExpanded] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [category, setCategory] = useState(""); // 추가: 카테고리 state
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 추가: 현재 이미지 인덱스

  const db = getFirestore();

  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setLikedPosts(userDoc.data().likedPosts || {});
        }
      }
    };
    fetchLikedPosts();
  }, [user, db]);

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
    setCategory(post.category || ""); // 수정: 기존 카테고리를 선택하도록 설정
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
        category, // 추가: 수정된 카테고리 저장
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

  const handleLikeClick = async (postId) => {
    const updatedLikedPosts = { ...likedPosts, [postId]: !likedPosts[postId] };
    setLikedPosts(updatedLikedPosts);

    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        likedPosts: updatedLikedPosts,
      });
    }
  };

  const handleNextImage = (post) => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % post.imageUrls.length
    );
  };

  const handlePreviousImage = (post) => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? post.imageUrls.length - 1 : prevIndex - 1
    );
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
                      className="cardheader"
                      avatar={
                        <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                          {user && <ProfileImage uid={user.uid} />}
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
                      title={
                        <Typography className="title">
                          <Typography variant="subtitle1">
                            {user.displayName}
                          </Typography>
                          <Typography variant="subtitle2">
                            {" "}
                            {post.title}
                          </Typography>
                        </Typography>
                      }
                      subheader={post.category} // 여기서 카테고리를 표시합니다
                    />
                    <CardMedia>
                      <div style={{ position: "relative" }}>
                        {post.imageUrls && post.imageUrls.length > 1 && (
                          <>
                            <IconButton
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: 0,
                                transform: "translateY(-50%)",
                              }}
                              onClick={() => handlePreviousImage(post)}
                            >
                              <ChevronLeftIcon />
                            </IconButton>
                            <IconButton
                              style={{
                                position: "absolute",
                                top: "50%",
                                right: 0,
                                transform: "translateY(-50%)",
                              }}
                              onClick={() => handleNextImage(post)}
                            >
                              <ChevronRightIcon />
                            </IconButton>
                          </>
                        )}
                        <UploadPost
                          imageUrls={post.imageUrls || []}
                          currentImageIndex={currentImageIndex}
                        />
                      </div>
                    </CardMedia>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {post.content}
                      </Typography>
                    </CardContent>
                    <CardActions disableSpacing>
                      <IconButton
                        aria-label="like"
                        onClick={() => handleLikeClick(post.id)}
                        style={{
                          color: likedPosts[post.id] ? "pink" : "inherit",
                        }}
                      >
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
                      <CardContent>추가정보</CardContent>
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
          {/* 카테고리 선택 */}
          <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">Select Category</MenuItem>
              <MenuItem value="Travel">Travel</MenuItem>
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Cooking">Cooking</MenuItem>
              <MenuItem value="Culture">Culture</MenuItem>
              <MenuItem value="Games">Games</MenuItem>
              <MenuItem value="Music">Music</MenuItem>
              <MenuItem value="Study">Study</MenuItem>
            </Select>
          </FormControl>
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
