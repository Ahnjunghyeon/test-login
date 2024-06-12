import React, { useState, useEffect } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
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
  const [category, setCategory] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [followedPosts, setFollowedPosts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categoryMenuAnchorEl, setCategoryMenuAnchorEl] = useState(null);

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

  useEffect(() => {
    const fetchFollowedPosts = async () => {
      if (user) {
        const followRef = collection(db, `users/${user.uid}/follow`);
        const followSnapshot = await getDocs(followRef);

        const uids = followSnapshot.docs.map((doc) => doc.id);

        if (uids.length > 0) {
          const followedPostsData = [];

          for (const uid of uids) {
            const postsRef = collection(db, `users/${uid}/posts`);
            const postsSnapshot = await getDocs(postsRef);

            for (const postDoc of postsSnapshot.docs) {
              const postData = postDoc.data();
              const userDoc = await getDoc(doc(db, "users", uid));
              const userDisplayName = userDoc.exists()
                ? userDoc.data().displayName
                : "Unknown User";

              followedPostsData.push({
                id: postDoc.id,
                uid,
                userDisplayName,
                ...postData,
              });
            }
          }

          followedPostsData.sort((a, b) => b.createdAt - a.createdAt);

          setFollowedPosts(followedPostsData);
        }
      }
    };
    fetchFollowedPosts();
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
    setCategory(post.category || "");
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
        category,
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

  const filterPostsByCategory = (posts) => {
    if (categoryFilter === "") {
      return posts;
    }
    return posts.filter((post) => post.category === categoryFilter);
  };

  const combinedPosts = [...posts, ...followedPosts].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  const filteredPosts = filterPostsByCategory(combinedPosts);

  const handleCategoryMenuOpen = (event) => {
    setCategoryMenuAnchorEl(event.currentTarget);
  };

  const handleCategoryMenuClose = () => {
    setCategoryMenuAnchorEl(null);
  };

  const handleCategorySelect = (category) => {
    setCategoryFilter(category);
    handleCategoryMenuClose();
  };

  return (
    <>
      <div className="Posts">
        {user ? (
          <>
            <h2>게시물 목록</h2>
            <Button onClick={handleCategoryMenuOpen}>카테고리 필터</Button>
            <Menu
              anchorEl={categoryMenuAnchorEl}
              open={Boolean(categoryMenuAnchorEl)}
              onClose={handleCategoryMenuClose}
            >
              <MenuItem onClick={() => handleCategorySelect("")}>All</MenuItem>
              <MenuItem onClick={() => handleCategorySelect("Travel")}>
                Travel
              </MenuItem>
              <MenuItem onClick={() => handleCategorySelect("Food")}>
                Food
              </MenuItem>
              <MenuItem onClick={() => handleCategorySelect("Cooking")}>
                Cooking
              </MenuItem>
              <MenuItem onClick={() => handleCategorySelect("Culture")}>
                Culture
              </MenuItem>
              <MenuItem onClick={() => handleCategorySelect("Games")}>
                Games
              </MenuItem>
              <MenuItem onClick={() => handleCategorySelect("Music")}>
                Music
              </MenuItem>
              <MenuItem onClick={() => handleCategorySelect("Study")}>
                Study
              </MenuItem>
            </Menu>
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
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
                          <ProfileImage uid={post.uid} />
                        </Avatar>
                      }
                      action={
                        user &&
                        post.uid === user.uid && (
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
                              <MenuItem
                                onClick={() => handleDeletePost(post.id)}
                              >
                                글 삭제
                              </MenuItem>
                            </Menu>
                          </>
                        )
                      }
                      title={
                        <>
                          <Typography variant="subtitle1">
                            {post.uid === user.uid
                              ? user.displayName
                              : post.userDisplayName}
                          </Typography>
                          <Typography variant="subtitle2">
                            {post.title}
                          </Typography>
                        </>
                      }
                    />
                    <CardMedia>
                      <div style={{ position: "relative" }}>
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
                      <CardContent>
                        <Typography>Category = {post.category}</Typography>
                        <Typography variant="subtitle3">
                          {post.createdAt instanceof Date
                            ? post.createdAt.toLocaleString()
                            : new Date(
                                post.createdAt.seconds * 1000
                              ).toLocaleString()}
                        </Typography>
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
          {/* 이미지를 매핑하여 Dialog에 표시 */}
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
              {/* 이미지 삭제 버튼 */}
              <Button
                onClick={() => handleRemoveImage(index)}
                style={{ position: "absolute", top: 0, right: 0 }}
              >
                이미지 삭제
              </Button>
            </div>
          ))}
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
