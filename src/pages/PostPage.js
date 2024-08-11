import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../Firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  TextField,
  Button,
  Avatar,
  Tooltip,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadPost from "../components/UploadPost";
import Profilelogo from "../components/ProfileLogo";
import "./PostPage.css";

const PostPage = () => {
  const { uid, postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        console.error("No user is signed in");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, `users/${uid}/posts`, postId));
        if (postDoc.exists()) {
          setPost(postDoc.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [uid, postId]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const likesRef = collection(db, `users/${uid}/posts/${postId}/likes`);
        const likesSnapshot = await getDocs(likesRef);
        setLikesCount(likesSnapshot.docs.length);

        if (currentUserId) {
          const userLikeDoc = await getDoc(doc(likesRef, currentUserId));
          setLiked(userLikeDoc.exists());
        }
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

    fetchLikes();
  }, [uid, postId, currentUserId]);

  const fetchComments = async () => {
    try {
      const commentsRef = collection(
        db,
        `users/${uid}/posts/${postId}/comments`
      );
      const commentsSnapshot = await getDocs(commentsRef);
      const commentsList = await Promise.all(
        commentsSnapshot.docs.map(async (commentDoc) => {
          const commentData = commentDoc.data();
          let userProfile = {};

          try {
            const userDoc = await getDoc(
              doc(db, `users/${commentData.userId}`)
            );
            userProfile = userDoc.exists() ? userDoc.data() : {};
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }

          return {
            id: commentDoc.id,
            ...commentData,
            userProfile,
          };
        })
      );
      setComments(commentsList);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [uid, postId]);

  const handleLikePost = async () => {
    try {
      const likeDocRef = doc(
        db,
        `users/${uid}/posts/${postId}/likes`,
        currentUserId
      );

      if (liked) {
        await deleteDoc(likeDocRef);
        setLiked(false);
        setLikesCount((prevCount) => prevCount - 1);
      } else {
        await setDoc(likeDocRef, { userId: currentUserId });
        setLiked(true);
        setLikesCount((prevCount) => prevCount + 1);
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!post) {
    return <Typography variant="h5">게시물을 찾을 수 없습니다.</Typography>;
  }

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;

    try {
      const commentsRef = collection(
        db,
        `users/${uid}/posts/${postId}/comments`
      );
      const user = auth.currentUser;

      if (user) {
        await addDoc(commentsRef, {
          content: newComment,
          userId: currentUserId,
          displayName: user.displayName || "Unknown User", // displayName 추가
          timestamp: new Date(),
        });
        setNewComment("");
        fetchComments();
      } else {
        console.error("No user is signed in");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleEditCommentChange = (event) => {
    setEditCommentContent(event.target.value);
  };

  const handleEditComment = async (commentId) => {
    if (editCommentContent.trim() === "") return;

    try {
      const commentDocRef = doc(
        db,
        `users/${uid}/posts/${postId}/comments`,
        commentId
      );
      await updateDoc(commentDocRef, { content: editCommentContent });
      setEditingCommentId(null);
      setEditCommentContent("");
      fetchComments();
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const commentDocRef = doc(
        db,
        `users/${uid}/posts/${postId}/comments`,
        commentId
      );
      await deleteDoc(commentDocRef);
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <Container className="container" style={{ width: "750px" }}>
      <Typography variant="h3" className="text">
        {post.category}
      </Typography>

      <Box className="upload-post-container">
        <UploadPost imageUrls={post.imageUrls} />
      </Box>

      <Typography variant="h5" className="content">
        {post.content}
      </Typography>

      <Box className="actions">
        <IconButton
          onClick={handleLikePost}
          style={{ color: liked ? "#e57373" : "#858585" }}
        >
          <FavoriteIcon />
        </IconButton>

        <Typography className="text">{likesCount} 좋아요</Typography>
      </Box>
      <Box className="comments-section">
        <Typography variant="h6" className="comments-title">
          댓글
        </Typography>
        <Box className="comments-list">
          {comments.map((comment) => (
            <Box key={comment.id} className="comment">
              <Box
                className="comment-header"
                style={{ display: "flex", alignItems: "center" }}
              >
                <Profilelogo uid={comment.userId} />
                <Typography
                  variant="body2"
                  className="comment-author"
                  style={{ marginLeft: "10px" }}
                >
                  {comment.userProfile.displayName || "Unknown User"}
                </Typography>
                {comment.userId === currentUserId && (
                  <Box
                    className="comment-actions"
                    style={{ marginLeft: "auto", display: "flex" }}
                  >
                    <Tooltip title="수정">
                      <IconButton
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditCommentContent(comment.content);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="삭제">
                      <IconButton
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {editingCommentId === comment.id ? (
                <Box className="edit-comment">
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={editCommentContent}
                    onChange={handleEditCommentChange}
                    placeholder="댓글을 수정하세요"
                  />
                  <Button
                    onClick={() => handleEditComment(comment.id)}
                    variant="contained"
                    color="primary"
                  >
                    저장
                  </Button>
                  <Button
                    onClick={() => setEditingCommentId(null)}
                    variant="outlined"
                    color="secondary"
                  >
                    취소
                  </Button>
                </Box>
              ) : (
                <>
                  <div className="post-comment-edit">
                    <Typography
                      variant="body1"
                      className="comment-content"
                      style={{
                        marginLeft: "50px",
                        width: "100%",
                        hegiht: "auto",
                      }}
                    >
                      {comment.content}
                    </Typography>
                  </div>
                </>
              )}
            </Box>
          ))}
        </Box>
        <Box className="add-comment">
          <TextField
            className="text"
            variant="outlined"
            fullWidth
            value={newComment}
            onChange={handleCommentChange}
            placeholder="입력"
          />
          <Button
            onClick={handleAddComment}
            className="cmtaddbtn"
            variant="contained"
            color="primary"
          >
            추가하기
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PostPage;
