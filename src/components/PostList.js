import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  getFirestore,
  runTransaction,
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
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
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";
import ReadMoreRoundedIcon from "@mui/icons-material/ReadMoreRounded";
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
  const [category, setCategory] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [followedPosts, setFollowedPosts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categoryMenuAnchorEl, setCategoryMenuAnchorEl] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [likedPosts, setLikedPosts] = useState({});
  const [likesCount, setLikesCount] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate

  const db = getFirestore();

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

  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (user) {
        const allPosts = [...posts, ...followedPosts];
        const likedPostsData = {};

        for (const post of allPosts) {
          const likesRef = collection(
            db,
            `users/${post.uid}/posts/${post.id}/likes`
          );
          const likeDoc = await getDoc(doc(likesRef, user.uid));

          if (likeDoc.exists()) {
            likedPostsData[post.id] = true;
          } else {
            likedPostsData[post.id] = false;
          }
        }

        setLikedPosts(likedPostsData);
      }
    };

    fetchLikedPosts();
  }, [user, posts, followedPosts, db]);

  useEffect(() => {
    const fetchLikesCount = async () => {
      const likesCounts = {};
      const allPosts = [...posts, ...followedPosts];
      for (const post of allPosts) {
        try {
          const likesRef = collection(
            db,
            `users/${post.uid}/posts/${post.id}/likes`
          );
          const likesSnapshot = await getDocs(likesRef);
          const likesCount = likesSnapshot.docs.length;
          likesCounts[post.id] = likesCount;
        } catch (error) {
          console.error(
            `Error fetching likes count for post ${post.id}:`,
            error
          );
          likesCounts[post.id] = 0;
        }
      }
      setLikesCount(likesCounts);
    };

    fetchLikesCount();
  }, [posts, followedPosts, db]);

  useEffect(() => {
    const unsubscribeLikes = {};
    const allPosts = [...posts, ...followedPosts];
    allPosts.forEach((post) => {
      const likesRef = collection(
        db,
        `users/${post.uid}/posts/${post.id}/likes`
      );
      unsubscribeLikes[post.id] = onSnapshot(likesRef, (snapshot) => {
        const likesCount = snapshot.docs.length;
        setLikesCount((prevLikesCount) => ({
          ...prevLikesCount,
          [post.id]: likesCount,
        }));
      });
    });

    return () => {
      Object.values(unsubscribeLikes).forEach((unsubscribe) => unsubscribe());
    };
  }, [posts, followedPosts, db]);

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
      fetchComments(postId);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLikePost = async (post) => {
    try {
      const likesRef = collection(
        db,
        `users/${post.uid}/posts/${post.id}/likes`
      );
      const likeDocRef = doc(likesRef, user.uid);

      await runTransaction(db, async (transaction) => {
        const likeDoc = await transaction.get(likeDocRef);

        if (likeDoc.exists()) {
          transaction.delete(likeDocRef);
          setLikedPosts((prevLikedPosts) => ({
            ...prevLikedPosts,
            [post.id]: false,
          }));
        } else {
          transaction.set(likeDocRef, { userId: user.uid });
          setLikedPosts((prevLikedPosts) => ({
            ...prevLikedPosts,
            [post.id]: true,
          }));
        }
      });
    } catch (error) {
      console.error("Error liking/unliking post:", error);
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

  const handleMoreClick = async (postId, postUid) => {
    try {
      const postDoc = await getDoc(doc(db, `users/${postUid}/posts/${postId}`));
      if (postDoc.exists()) {
        navigate(`/posts/${postUid}/${postId}`);
      } else {
        console.error("Post not found!");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  const handleShare = async (post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.content,
          text: post.content,
          url: `${window.location.origin}/posts/${post.uid}/${post.id}`,
        });
      } else {
        throw new Error("Web Share API is not supported in this browser.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback sharing option if navigator.share is not supported
      // You can implement a custom sharing solution here
    }
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
                        onClick={() => handleLikePost(post)}
                        color={likedPosts[post.id] ? "secondary" : "default"}
                      >
                        <FavoriteIcon />
                      </IconButton>
                      <Typography>{likesCount[post.id]} Likes</Typography>

                      <IconButton
                        aria-label="share"
                        onClick={() => handleShare(post)}
                      >
                        <ShareIcon />
                      </IconButton>
                      <IconButton
                        aria-expanded={expanded[post.id]}
                        aria-label="show more"
                        onClick={() => handleExpandClick(post.id)}
                      >
                        <Tooltip title="댓글">
                          <MapsUgcRoundedIcon />
                        </Tooltip>
                      </IconButton>
                      <IconButton
                        onClick={() => handleMoreClick(post.id, post.uid)}
                      >
                        <MoreHorizRoundedIcon />
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
          {" "}
          <Button onClick={handleCloseEditDialog}>취소</Button>
          <Button onClick={handleSaveEdit}>저장</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostList;
