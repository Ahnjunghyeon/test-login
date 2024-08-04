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
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        console.error("No user is signed in");
      }
    });

    // Cleanup subscription on unmount
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
          const userDoc = await getDoc(doc(db, `users/${commentData.userId}`));
          return {
            ...commentData,
            userProfile: userDoc.exists() ? userDoc.data() : {},
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
      const likesRef = collection(db, `users/${uid}/posts/${postId}/likes`);
      const likeDocRef = doc(likesRef, currentUserId);

      if (liked) {
        await deleteDoc(likeDocRef);
        setLiked(false);
        setLikesCount((prevCount) => prevCount - 1);
      } else {
        await addDoc(likesRef, { userId: currentUserId });
        setLiked(true);
        setLikesCount((prevCount) => prevCount + 1);
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

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
      await addDoc(commentsRef, {
        content: newComment,
        userId: currentUserId,
        timestamp: new Date(),
      });
      setNewComment("");
      const commentsSnapshot = await getDocs(commentsRef);
      const commentsList = await Promise.all(
        commentsSnapshot.docs.map(async (commentDoc) => {
          const commentData = commentDoc.data();
          const userDoc = await getDoc(doc(db, `users/${commentData.userId}`));
          return {
            ...commentData,
            userProfile: userDoc.exists() ? userDoc.data() : {},
          };
        })
      );
      setComments(commentsList);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!post) {
    return <Typography variant="h5">게시물을 찾을 수 없습니다.</Typography>;
  }

  return (
    <Container className="container">
      <Typography variant="h3" className="text">
        {post.category}
      </Typography>
      <UploadPost imageUrls={post.imageUrls} />
      <Typography variant="h5" className="content">
        {post.content}
      </Typography>
      <Box className="actions">
        <IconButton
          onClick={handleLikePost}
          color={liked ? "secondary" : "default"}
          className={liked ? "liked" : ""}
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
          {comments.map((comment, index) => (
            <Box key={index} className="comment">
              <Box className="comment-header">
                <Profilelogo uid={comment.userId} />{" "}
                {/* Profilelogo 컴포넌트 사용 */}
                <Typography variant="body2" className="comment-author">
                  {comment.userProfile.displayName || "Unknown User"}
                </Typography>
              </Box>
              <Typography variant="body1" className="comment-content">
                {comment.content}
              </Typography>
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
            className="text"
            variant="contained"
            color="primary"
          >
            댓글을 추가해보세요!
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PostPage;
