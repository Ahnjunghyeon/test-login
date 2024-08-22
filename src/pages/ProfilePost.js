import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  Typography,
  CircularProgress,
  Box,
  IconButton,
  TextField,
  Button,
  Tooltip,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ProfileLogo from "../components/ProfileLogo";
import { db } from "../Firebase/firebase";
import { useLocation } from "react-router-dom";
import "./PostPage.css";

const ProfilePost = () => {
  const { state } = useLocation();
  const { uid, postId } = state || {};
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!uid || !postId) return;

      try {
        const postDoc = await getDoc(doc(db, `users/${uid}/posts/${postId}`));
        if (postDoc.exists()) {
          setPost(postDoc.data());
        } else {
          console.error("해당 문서가 존재하지 않습니다.");
        }
      } catch (error) {
        console.error("게시물을 가져오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [uid, postId]);

  useEffect(() => {
    const fetchLikes = async () => {
      if (!uid || !postId || !currentUserId) return;

      try {
        const likesRef = collection(db, `users/${uid}/posts/${postId}/likes`);
        const likesSnapshot = await getDocs(likesRef);
        setLikesCount(likesSnapshot.docs.length);

        const userLikeDoc = await getDoc(doc(likesRef, currentUserId));
        setLiked(userLikeDoc.exists());
      } catch (error) {
        console.error("좋아요를 가져오는 중 오류 발생:", error);
      }
    };

    fetchLikes();
  }, [uid, postId, currentUserId]);

  const fetchComments = async () => {
    if (!uid || !postId) return;

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
            console.error("사용자 프로필을 가져오는 중 오류 발생:", error);
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
      console.error("댓글을 가져오는 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [uid, postId]);

  const addLikeNotification = async () => {
    if (!uid || !postId) return;

    try {
      const postOwnerRef = doc(db, `users/${uid}`);
      const postOwnerDoc = await getDoc(postOwnerRef);

      if (postOwnerDoc.exists()) {
        const currentUser = auth.currentUser;
        const currentUserName = currentUser?.displayName || "알 수 없는 사용자";

        await addDoc(collection(db, `users/${uid}/notifications`), {
          type: "like",
          message: `${currentUserName}님이 당신의 게시물을 좋아합니다.`,
          postId,
          timestamp: new Date(),
          read: false,
        });
      }
    } catch (error) {
      console.error("좋아요 알림 추가 중 오류 발생:", error);
    }
  };

  const handleLikePost = async () => {
    if (!uid || !postId || !currentUserId) return;

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

        const notificationsSnapshot = await getDocs(
          collection(db, `users/${uid}/notifications`)
        );
        const notificationToRemove = notificationsSnapshot.docs.find(
          (doc) => doc.data().postId === postId && doc.data().type === "like"
        );
        if (notificationToRemove) {
          await deleteDoc(
            doc(db, `users/${uid}/notifications`, notificationToRemove.id)
          );
        }
      } else {
        await setDoc(likeDocRef, { userId: currentUserId });
        setLiked(true);
        setLikesCount((prevCount) => prevCount + 1);
        await addLikeNotification();
      }
    } catch (error) {
      console.error("좋아요 처리 중 오류 발생:", error);
    }
  };

  const handleCommentChange = (event) => setNewComment(event.target.value);

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
          displayName: user.displayName || "알 수 없는 사용자",
          timestamp: new Date(),
        });
        setNewComment("");
        fetchComments();
      } else {
        console.error("사용자가 로그인되어 있지 않습니다.");
      }
    } catch (error) {
      console.error("댓글 추가 중 오류 발생:", error);
    }
  };

  const handleEditCommentChange = (event) =>
    setEditCommentContent(event.target.value);

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
      console.error("댓글 수정 중 오류 발생:", error);
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
      console.error("댓글 삭제 중 오류 발생:", error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!post) {
    return <Typography variant="h5">게시물을 찾을 수 없습니다.</Typography>;
  }

  return (
    <div className="container">
      <Button className="exitbtn" onClick={() => window.history.back()}>
        X
      </Button>
      <Box className="post-image-container">
        {post.imageUrls && post.imageUrls[0] && (
          <img src={post.imageUrls[0]} alt="Post" className="post-image" />
        )}
      </Box>
      <Typography className="post-displyName">{post.displayName}</Typography>
      <Typography className="post-content">{post.content}</Typography>
      <Box className="post-category-liked">
        <Box className="actions">
          <IconButton
            onClick={handleLikePost}
            style={{
              color: liked ? "#e57373" : "#858585",
            }}
          >
            <Tooltip title="좋아요">
              <FavoriteIcon />
            </Tooltip>
          </IconButton>
          <Typography>{likesCount} 좋아요</Typography>
        </Box>
        <Typography className="post-category">{post.category}</Typography>
      </Box>
      <Box className="comments-section">
        <Typography variant="h6" className="comments-title">
          댓글
        </Typography>
        <Box className="comments-list">
          {comments.map((comment) => (
            <Box
              key={comment.id}
              className="comment"
              style={{
                border:
                  currentUserId === comment.userId ? "1px solid #000" : "",
              }}
            >
              <ProfileLogo userId={comment.userId} />
              <Typography className="comment-username">
                {comment.displayName}
              </Typography>
              {editingCommentId === comment.id ? (
                <Box className="edit-comment-form">
                  <TextField
                    value={editCommentContent}
                    onChange={handleEditCommentChange}
                    fullWidth
                  />
                  <Button
                    onClick={() => handleEditComment(comment.id)}
                    variant="contained"
                  >
                    수정
                  </Button>
                </Box>
              ) : (
                <Typography className="comment-content">
                  {comment.content}
                </Typography>
              )}
              {currentUserId === comment.userId && (
                <Box className="comment-actions">
                  <IconButton
                    onClick={() =>
                      setEditingCommentId(
                        editingCommentId === comment.id ? null : comment.id
                      )
                    }
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteComment(comment.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          ))}
        </Box>
        <Box className="add-comment-form">
          <TextField
            value={newComment}
            onChange={handleCommentChange}
            fullWidth
            placeholder="댓글을 작성하세요"
          />
          <Button onClick={handleAddComment} variant="contained">
            추가
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default ProfilePost;
