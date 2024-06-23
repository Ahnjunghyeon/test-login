import React, { useState, useEffect } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
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
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import {
  CardActions,
  CardContent,
  CardMedia,
  CardHeader,
  Card,
} from "@mui/material";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CommentIcon from "@mui/icons-material/Comment";
import FollowersPage from "../pages/FollowersPage";
import UploadPost from "./UploadPost";
import ProfileImage from "./ProfileLogo";
import "./PostList.css";

const PostList = ({
  user,
  posts,
  displayName,
  handleUpdatePost,
  handleDeletePost,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState({});
  const [expanded, setExpanded] = useState({});
  const [contentExpanded, setContentExpanded] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [category, setCategory] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [followedPosts, setFollowedPosts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categoryMenuAnchorEl, setCategoryMenuAnchorEl] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");

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

  const handleContentExpandClick = (postId) => {
    setContentExpanded((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleOpenEditDialog = (post) => {
    setSelectedPost(post);
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
        content,
        imageUrls,
        category,
      };

      try {
        // 게시물 업데이트 시, category 필드를 포함하여 업데이트
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
    // 좋아요 상태를 업데이트하고 UI에 반영
    const updatedLikedPosts = { ...likedPosts, [postId]: !likedPosts[postId] };
    setLikedPosts(updatedLikedPosts);

    // Firebase에 사용자가 좋아요 누른 정보 업데이트
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        likedPosts: updatedLikedPosts,
      });

      // 게시물의 좋아요 정보를 저장할 경로 설정 (like 컬렉션)
      const likeRef = collection(
        db,
        `users/${user.uid}/posts/${postId}/${postId}like`
      );

      // 사용자가 해당 게시물에 좋아요를 누른지 확인
      const userLikeDoc = doc(likeRef, user.uid);

      if (likedPosts[postId]) {
        // 좋아요를 누른 경우, 좋아요 문서 삭제
        await deleteDoc(userLikeDoc);
      } else {
        // 좋아요를 누르지 않은 경우, 좋아요 문서 추가
        await setDoc(userLikeDoc, {
          liked: true,
          timestamp: new Date(),
        });
      }

      // 좋아요 개수 가져오기 및 UI에 반영 (옵셔널)
      const likeQuerySnapshot = await getDocs(likeRef);
      const likeCount = likeQuerySnapshot.size;

      console.log(`게시물 ${postId}의 좋아요 개수:`, likeCount);

      // 게시물 작성자에게 알림
      const postRef = doc(db, "posts", postId);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postAuthorId = postDoc.data().uid;

        // 알림 컬렉션
        const notificationsRef = collection(
          db,
          `users/${postAuthorId}/notifications`
        );
        await addDoc(notificationsRef, {
          type: "like",
          postId: postId,
          userId: user.uid,
          createdAt: new Date(),
        });
      }
    }
  };

  const fetchComments = async (postId) => {
    try {
      const commentsRef = collection(
        db,
        `users/${user.uid}/posts/${postId}/${postId}_comments`
      );
      const commentsSnapshot = await getDocs(commentsRef);
      const commentsData = commentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: commentsData,
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleCommentChange = (postId, content) => {
    setNewComment(content);
  };

  const handleAddComment = async (postId) => {
    if (newComment.trim() === "") return;

    try {
      const commentRef = collection(
        db,
        `users/${user.uid}/posts/${postId}/comments`
      );
      await addDoc(commentRef, {
        content: newComment,
        createdAt: new Date(),
        userId: user.uid,
        displayName: user.displayName,
      });
      setNewComment("");
      fetchComments(postId); // 댓글 추가 후 새로고침
    } catch (error) {
      console.error("Error adding comment:", error);
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
      <div className="PostList">
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
                <MenuItem onClick={() => handleCategorySelect("")}>
                  All
                </MenuItem>
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
                  <Card key={post.id} sx={{ maxWidth: 345, marginBottom: 2 }}>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: red[500] }}>
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
                        <Typography variant="subtitle1">
                          {post.uid === user.uid
                            ? user.displayName
                            : post.userDisplayName}
                        </Typography>
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
                    <CardContent className="content">
                      <Typography variant="body2" color="text.secondary">
                        {post.content.length > 20
                          ? contentExpanded[post.id]
                            ? post.content
                            : `${post.content.slice(0, 20)}...`
                          : post.content}
                      </Typography>
                      {post.content.length > 20 && (
                        <IconButton
                          aria-expanded={contentExpanded[post.id]}
                          aria-label="show more"
                          onClick={() => handleContentExpandClick(post.id)}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      )}
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
                      <Typography variant="body2" color="text.secondary">
                        {
                          Object.keys(likedPosts).filter(
                            (key) => likedPosts[key]
                          ).length
                        }{" "}
                        Likes
                      </Typography>
                      <IconButton aria-label="share">
                        <ShareIcon />
                      </IconButton>
                      <IconButton
                        aria-expanded={expanded[post.id]}
                        aria-label="show more"
                        onClick={() => handleExpandClick(post.id)}
                      >
                        <Tooltip title="댓글">
                          <CommentIcon />
                        </Tooltip>
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
                        <div>
                          <Typography variant="h6">댓글</Typography>
                          <List>
                            {comments[post.id]?.map((comment) => (
                              <ListItem key={comment.id}>
                                <ListItemText
                                  primary={comment.displayName}
                                  secondary={comment.content}
                                />
                              </ListItem>
                            ))}
                          </List>
                          {user && (
                            <div>
                              <TextField
                                id={`comment-${post.id}`}
                                label="댓글 추가"
                                variant="outlined"
                                value={newComment}
                                onChange={(e) =>
                                  handleCommentChange(post.id, e.target.value)
                                }
                                fullWidth
                              />
                              <Button
                                variant="contained"
                                onClick={() => handleAddComment(post.id)}
                                sx={{ mt: 1 }}
                              >
                                댓글 추가
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Collapse>
                  </Card>
                ))
              ) : (
                <Typography variant="body1">게시물이 없습니다.</Typography>
              )}
            </>
          ) : (
            <Typography variant="body1">로그인 해주세요.</Typography>
          )}
        </div>
        {/* Conditionally render FollowersPage component based on screen width */}
        {window.innerWidth >= 869 && (
          <div className="Followers">
            <FollowersPage />
          </div>
        )}
      </div>
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
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
