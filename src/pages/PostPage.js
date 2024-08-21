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
import { db, auth } from "../Firebase/firebase";
import {
  Typography,
  CircularProgress,
  Box,
  IconButton,
  TextField,
  Button,
  Tooltip,
  Dialog,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ProfileLogo from "../components/ProfileLogo";
import "./PostPage.css";

const PostPage = ({ postId, uid, onClose }) => {
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
      try {
        const likesRef = collection(db, `users/${uid}/posts/${postId}/likes`);
        const likesSnapshot = await getDocs(likesRef);
        setLikesCount(likesSnapshot.docs.length);

        if (currentUserId) {
          const userLikeDoc = await getDoc(doc(likesRef, currentUserId));
          setLiked(userLikeDoc.exists());
        }
      } catch (error) {
        console.error("좋아요를 가져오는 중 오류 발생:", error);
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
            doc(
              collection(db, `users/${uid}/notifications`),
              notificationToRemove.id
            )
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
    <Dialog
      open={true}
      onClose={onClose}
      BackdropProps={{
        style: { backgroundColor: "transparent", widht: "150px" },
      }}
    >
      <div className="container">
        <Button className="exitbtn" onClick={onClose}>
          X
        </Button>
        <Box className="post-image-container">
          <img src={post.imageUrls[0]} alt="Post" className="post-image" />
        </Box>
        <Typography className="post-displyName">{post.displayName}</Typography>
        <Typography className="post-content">{post.content}</Typography>
        <Box className="post-category-liked">
          <Box className="actions">
            <IconButton
              onClick={handleLikePost}
              className={liked ? "liked" : "not-liked"}
            >
              <FavoriteIcon />
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
              <Box key={comment.id} className="comment">
                <Box className="comment-header">
                  <div className="comment-userinfo">
                    <ProfileLogo uid={comment.userId} />
                    <Typography variant="body2" className="comment-author">
                      {comment.userProfile.displayName || "알 수 없는 사용자"}
                    </Typography>
                  </div>
                  {comment.userId === currentUserId && (
                    <Box className="comment-actions">
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
                      multiline
                      value={editCommentContent}
                      onChange={handleEditCommentChange}
                    />
                    <Button onClick={() => handleEditComment(comment.id)}>
                      저장
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" className="comment-content">
                    {comment.content}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
          <Box className="add-comment">
            <TextField
              multiline
              value={newComment}
              onChange={handleCommentChange}
              placeholder="댓글을 입력하세요"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComment}
            >
              댓글 추가
            </Button>
          </Box>
        </Box>
      </div>
    </Dialog>
  );
};

export default PostPage;
