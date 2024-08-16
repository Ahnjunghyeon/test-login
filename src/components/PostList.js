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
  onSnapshot,
  deleteDoc,
  updateDoc,
  query,
  where,
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
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
  deleteObject,
} from "firebase/storage";

import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NotesIcon from "@mui/icons-material/Notes";
import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";
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
  postId,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState({});
  const [expanded, setExpanded] = useState({});
  const [contentExpanded, setContentExpanded] = useState({});
  const [category, setCategory] = useState("");
  const [followedPosts, setFollowedPosts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [likedPosts, setLikedPosts] = useState({});
  const [likesCount, setLikesCount] = useState({});
  const [editComment, setEditComment] = useState(null); // 댓글 수정 상태
  const [editCommentContent, setEditCommentContent] = useState(""); // 댓글 수정 내용
  const [showFollowers, setShowFollowers] = useState(false); // 상태 추가
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 869);
  const [loading, setLoading] = useState(false);

  const storage = getStorage();

  const navigate = useNavigate(); // Initialize useNavigate

  const db = getFirestore();

  useEffect(() => {
    if (user) {
      const unsubscribeMap = {};

      const followRef = collection(db, `users/${user.uid}/follow`);
      const unsubscribeFollow = onSnapshot(
        followRef,
        async (followSnapshot) => {
          const uids = followSnapshot.docs.map((doc) => doc.id);

          Object.values(unsubscribeMap).forEach((unsubscribe) => unsubscribe());

          const followedPostsData = [];
          for (const uid of uids) {
            const postsRef = collection(db, `users/${uid}/posts`);
            const unsubscribePosts = onSnapshot(postsRef, (postsSnapshot) => {
              const posts = postsSnapshot.docs.map((postDoc) => ({
                id: postDoc.id,
                uid,
                userDisplayName: "",
                ...postDoc.data(),
              }));

              Promise.all(
                posts.map(async (post) => {
                  const userDoc = await getDoc(doc(db, "users", uid));
                  post.userDisplayName = userDoc.exists()
                    ? userDoc.data().displayName
                    : "Unknown User";
                  return post;
                })
              ).then((postsWithDisplayName) => {
                followedPostsData.push(...postsWithDisplayName);
                followedPostsData.sort((a, b) => b.createdAt - a.createdAt);
                setFollowedPosts(followedPostsData);
              });
            });

            unsubscribeMap[uid] = unsubscribePosts;
          }
        }
      );

      return () => {
        unsubscribeFollow();
        Object.values(unsubscribeMap).forEach((unsubscribe) => unsubscribe());
      };
    }
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
  }, [user, posts, followedPosts, db]); // 'db' 추가

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
  }, [posts, followedPosts, db]); // 'db' 추가

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

  useEffect(() => {
    const unsubscribeComments = {};

    const allPosts = [...posts, ...followedPosts];
    allPosts.forEach((post) => {
      const commentsRef = collection(
        db,
        `users/${post.uid}/posts/${post.id}/comments`
      );
      unsubscribeComments[post.id] = onSnapshot(commentsRef, (snapshot) => {
        const commentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort comments by createdAt in descending order
        commentsData.sort((a, b) => b.createdAt - a.createdAt);

        setComments((prevComments) => ({
          ...prevComments,
          [post.id]: commentsData,
        }));
      });
    });

    return () => {
      Object.values(unsubscribeComments).forEach((unsubscribe) =>
        unsubscribe()
      );
    };
  }, [posts, followedPosts, db]);

  const handleMenuOpen = (event, post) => {
    setMenuAnchorEl((prev) => ({ ...prev, [post.id]: event.currentTarget }));
  };

  const handleMenuClose = (post) => {
    setMenuAnchorEl((prev) => ({ ...prev, [post.id]: null }));
  };

  //댓글 버튼으로 실시간 업데이트하기
  const subscribeToComments = (postId) => {
    const commentsRef = collection(
      db,
      `users/${user.uid}/posts/${postId}/comments`
    );
    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      commentsData.sort((a, b) => b.createdAt - a.createdAt);

      setComments((prevComments) => ({
        ...prevComments,
        [postId]: commentsData,
      }));
    });

    return unsubscribe;
  };

  const handleExpandClick = (postId) => {
    setExpanded((prev) => ({ ...prev, [postId]: !prev[postId] }));

    if (!expanded[postId]) {
      const unsubscribe = subscribeToComments(postId);
      return () => {
        unsubscribe();
      };
    }
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

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    setLoading(true);

    const uploadedUrls = [];

    // userPostId를 가져와야 합니다. 이 값은 필요에 따라 전달해야 합니다.
    const userPostId = selectedPost.id; // 적절한 값으로 변경해야 합니다.

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageName = `image${imageUrls.length + i + 1}`;
      // userPostId를 경로에 포함시킵니다.
      const fileRef = ref(
        storage,
        `users/${selectedPost.uid}/posts/${userPostId}/${imageName}`
      );
      const uploadTask = uploadBytesResumable(fileRef, file);

      try {
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload is ${progress}% done`);
            },
            (error) => {
              console.error("Error uploading image:", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(downloadURL);
              resolve();
            }
          );
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        setLoading(false);
        return;
      }
    }

    // 새로운 이미지 URL을 기존 이미지 URL에 추가
    setImageUrls((prev) => [...prev, ...uploadedUrls]);
    setLoading(false);
  };

  const handleRemoveImage = async (index) => {
    const imageUrlToRemove = imageUrls[index];
    const imageRef = ref(storage, imageUrlToRemove);

    try {
      // Firebase Storage에서 이미지를 삭제
      await deleteObject(imageRef);

      // 상태에서 해당 이미지 URL을 제거
      setImageUrls((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting image from Firebase Storage:", error);
    }
  };

  // 댓글 입력 핸들러
  const handleCommentChange = (postId, content) => {
    setNewComment(content);
  };

  const handleAddComment = async (postId) => {
    if (newComment.trim() === "") return;

    try {
      const commentId = `${user.uid}${new Date().getTime()}`;
      const commentRef = collection(
        db,
        `users/${user.uid}/posts/${postId}/comments`
      );

      await addDoc(commentRef, {
        commentsid: commentId,
        content: newComment,
        createdAt: new Date(),
        userId: user.uid,
        displayName: user.displayName,
      });

      // 댓글 입력 후 상태 즉시 업데이트
      const commentsSnapshot = await getDocs(commentRef);
      const updatedComments = commentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      updatedComments.sort((a, b) => b.createdAt - a.createdAt);

      setComments((prevComments) => ({
        ...prevComments,
        [postId]: updatedComments,
      }));

      setNewComment("");
    } catch (error) {
      console.error("댓글 추가 중 오류 발생:", error);
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

  //댓글수정처리함수
  const handleEditComment = (comment) => {
    setEditComment(comment);
    setEditCommentContent(comment.content);
  };

  const handleSaveCommentEdit = async (commentId) => {
    const postId = Object.keys(comments).find((postId) =>
      comments[postId].some((comment) => comment.id === commentId)
    );

    if (postId) {
      try {
        const commentsRef = collection(
          db,
          `users/${user.uid}/posts/${postId}/comments`
        );
        const commentsSnapshot = await getDocs(commentsRef);
        const commentDoc = commentsSnapshot.docs.find(
          (doc) => doc.id === commentId // Firestore 자동 생성 ID 사용
        );

        if (commentDoc) {
          const commentRef = doc(
            db,
            `users/${user.uid}/posts/${postId}/comments`,
            commentDoc.id
          );

          await updateDoc(commentRef, {
            content: editCommentContent,
          });

          const updatedComments = comments[postId].map((comment) =>
            comment.id === commentId
              ? { ...comment, content: editCommentContent }
              : comment
          );
          setComments((prevComments) => ({
            ...prevComments,
            [postId]: updatedComments,
          }));

          setEditComment(null);
          setEditCommentContent("");
        } else {
          console.error("Comment not found!");
        }
      } catch (error) {
        console.error("Error updating comment:", error);
      }
    } else {
      console.error("Post not found for comment update.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const postId = Object.keys(comments).find((postId) =>
      comments[postId].some((comment) => comment.id === commentId)
    );

    if (postId) {
      try {
        const commentsRef = collection(
          db,
          `users/${user.uid}/posts/${postId}/comments`
        );
        const commentsSnapshot = await getDocs(commentsRef);
        const commentDoc = commentsSnapshot.docs.find(
          (doc) => doc.id === commentId // Firestore 자동 생성 ID 사용
        );

        if (commentDoc) {
          const commentRef = doc(
            db,
            `users/${user.uid}/posts/${postId}/comments`,
            commentDoc.id
          );

          await deleteDoc(commentRef);

          const updatedComments = comments[postId].filter(
            (comment) => comment.id !== commentId
          );
          setComments((prevComments) => ({
            ...prevComments,
            [postId]: updatedComments,
          }));
        } else {
          console.error("Comment not found!");
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    } else {
      console.error("Post not found for comment deletion.");
    }
  };

  //슬라이드 버튼
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 869);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 유저의 displayName을 Firestore에서 가져오는 함수
  const getUserDisplayName = async (userId) => {
    try {
      const userRef = doc(db, `users/${userId}`);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data().displayName;
      } else {
        console.error("User not found");
        return "Unknown User";
      }
    } catch (error) {
      console.error("Error getting user displayName:", error);
      return "Unknown User";
    }
  };

  // 좋아요 버튼 핸들러
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
          // 좋아요 제거
          transaction.delete(likeDocRef);
          setLikedPosts((prevLikedPosts) => ({
            ...prevLikedPosts,
            [post.id]: false,
          }));

          // 좋아요 제거 후 알림 삭제
          await removeNotification(post.uid, post.id, user.uid);
        } else {
          // 좋아요 추가
          transaction.set(likeDocRef, { userId: user.uid });
          setLikedPosts((prevLikedPosts) => ({
            ...prevLikedPosts,
            [post.id]: true,
          }));

          // 유저의 displayName 가져오기
          const displayName = await getUserDisplayName(user.uid);

          // 알림 추가
          if (post.uid !== user.uid) {
            await addNotification(post.uid, post.id, user.uid, displayName);
          }
        }
      });
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };

  // 알림을 Firestore에 추가하는 함수
  const addNotification = async (userId, postId, likerId, displayName) => {
    try {
      const notificationsRef = collection(db, `users/${userId}/notifications`);
      const docRef = await addDoc(notificationsRef, {
        message: `사용자 ${displayName}님이 게시물 ${postId}에 좋아요를 눌렀습니다.`,
        read: false,
        timestamp: new Date(),
        type: "like",
        postId,
        likerId,
      });

      // 문서 ID를 반환합니다.
      return docRef.id;
    } catch (error) {
      console.error("Error adding notification:", error);
      return null;
    }
  };

  // 좋아요 취소 시 알림을 삭제하는 함수
  const removeNotification = async (userId, postId, likerId) => {
    try {
      // 알림을 찾기 위한 쿼리
      const notificationsRef = collection(db, `users/${userId}/notifications`);
      const q = query(
        notificationsRef,
        where("postId", "==", postId),
        where("likerId", "==", likerId),
        where("type", "==", "like")
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  };

  // 댓글 알림을 Firestore에 추가하는 함수
  const addCommentNotification = async (
    userId,
    postId,
    commenterId,
    displayName,
    commentContent
  ) => {
    try {
      const notificationsRef = collection(db, `users/${userId}/notifications`);
      const docRef = await addDoc(notificationsRef, {
        message: `사용자 ${displayName}님이 게시물 ${postId}에 댓글을 달았습니다: "${commentContent}"`,
        read: false,
        timestamp: new Date(),
        type: "comment",
        postId,
        commenterId,
      });

      // 문서 ID 반환
      return docRef.id;
    } catch (error) {
      console.error("댓글 알림 추가 중 오류 발생:", error);
      return null;
    }
  };

  return (
    <>
      <div className="PostList">
        <div className="Posts">
          {user ? (
            <>
              <h2>게시물 목록</h2>

              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <Card
                    key={post.id}
                    sx={{ maxWidth: 345, marginTop: "100px", marginBottom: 2 }}
                  >
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
                          style={{ width: "300px" }}
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
                        style={{
                          color: likedPosts[post.id] ? "#e57373" : "#858585",
                        }}
                      >
                        <Tooltip title="좋아요">
                          <FavoriteIcon />
                        </Tooltip>
                      </IconButton>

                      <Typography>{likesCount[post.id]} </Typography>

                      <Typography component="div">
                        <IconButton
                          aria-expanded={expanded[post.id]}
                          aria-label="show more"
                          onClick={() => handleExpandClick(post.id)}
                        >
                          <Tooltip title="댓글">
                            <MapsUgcRoundedIcon />
                          </Tooltip>
                        </IconButton>
                      </Typography>

                      <IconButton
                        onClick={() => handleMoreClick(post.id, post.uid)}
                      >
                        <Tooltip title="글보기">
                          <NotesIcon />
                        </Tooltip>
                      </IconButton>

                      <IconButton
                        aria-label="share"
                        onClick={() => handleShare(post)}
                      >
                        <Tooltip title="공유">
                          <ShareIcon />
                        </Tooltip>
                      </IconButton>
                    </CardActions>

                    <Collapse
                      in={expanded[post.id]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <CardContent>
                        <Typography>카테고리 {post.category}</Typography>
                        <Typography variant="subtitle3">
                          {post.createdAt instanceof Date
                            ? post.createdAt.toLocaleString()
                            : new Date(
                                post.createdAt.seconds * 1000
                              ).toLocaleString()}
                        </Typography>
                        <div>
                          <Typography variant="h6">댓글</Typography>
                          <List className="comments-list">
                            {comments[post.id]?.length > 0 ? (
                              comments[post.id].map((comment) => (
                                <ListItem
                                  key={comment.id}
                                  alignItems="flex-start"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "10px 0",
                                  }}
                                >
                                  <div style={{ width: "50px", left: "50px" }}>
                                    <ProfileImage uid={comment.userId} />
                                    <div
                                      className="comments-displayName"
                                      style={{
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {comment.displayName}
                                    </div>
                                  </div>

                                  <ListItemText
                                    className="comments-index"
                                    style={{ display: "flex" }}
                                    primary={
                                      <>
                                        <div
                                          className="commentedit"
                                          color="textPrimary"
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                          component="span"
                                        >
                                          {editComment &&
                                          editComment.id === comment.id ? (
                                            <>
                                              <TextField
                                                style={{
                                                  display: "flex",
                                                  width: "225px",
                                                }}
                                                value={editCommentContent}
                                                onChange={(e) =>
                                                  setEditCommentContent(
                                                    e.target.value
                                                  )
                                                }
                                                multiline
                                                fullWidth
                                              />
                                              <div className="comments-edit-after">
                                                <Button
                                                  onClick={() =>
                                                    handleSaveCommentEdit(
                                                      comment.id
                                                    )
                                                  }
                                                >
                                                  저장
                                                </Button>
                                                <Button
                                                  onClick={() =>
                                                    setEditComment(null)
                                                  }
                                                >
                                                  취소
                                                </Button>
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              <div>
                                                <div
                                                  className="comments-content"
                                                  style={{
                                                    marginLeft: "15px",
                                                    marginTop: "0px",
                                                    width: "175px",
                                                  }}
                                                >
                                                  {comment.content}
                                                </div>
                                              </div>
                                              <div
                                                className="comments-editbtn"
                                                style={{}}
                                              >
                                                {user &&
                                                  comment.userId ===
                                                    user.uid && (
                                                    <Button
                                                      onClick={() =>
                                                        handleEditComment(
                                                          comment
                                                        )
                                                      }
                                                      color="primary"
                                                    >
                                                      수정
                                                    </Button>
                                                  )}
                                                <div
                                                  style={{ marginTop: "8px" }}
                                                >
                                                  <Button
                                                    onClick={() =>
                                                      handleDeleteComment(
                                                        comment.id
                                                      )
                                                    }
                                                  >
                                                    삭제
                                                  </Button>
                                                </div>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </>
                                    }
                                  />
                                </ListItem>
                              ))
                            ) : (
                              <Typography variant="body2">
                                댓글이 없습니다.
                              </Typography>
                            )}
                          </List>

                          {user && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: "20px",
                              }}
                            >
                              <TextField
                                id={`comment-${post.id}`}
                                label="댓글 추가"
                                value={newComment}
                                onChange={(e) =>
                                  handleCommentChange(post.id, e.target.value)
                                }
                                fullWidth
                                multiline
                                margin="normal"
                              />
                              <Button
                                onClick={() => handleAddComment(post.id)}
                                variant="contained"
                                style={{
                                  fontFamily: "BMJUA, sans-serif",
                                  top: "3px",
                                  height: "50px",
                                  color: "6084e7cc",
                                }}
                              >
                                추가
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
        {isLargeScreen && (
          <div className="Followers">
            <FollowersPage />
          </div>
        )}
        <button
          className="innerbtn"
          onClick={() => setShowFollowers(!showFollowers)}
        >
          {showFollowers ? ">" : "<"}
        </button>

        {/* 슬라이드 메뉴 */}
        <div className={`slide-menu ${showFollowers ? "open" : ""}`}>
          <div className="slidelist">팔로우 리스트</div>
          {showFollowers && !isLargeScreen && <FollowersPage />}
        </div>
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
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ marginTop: "10px" }}
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
            <InputLabel id="category-label">주제</InputLabel>
            <Select
              labelId="category-label"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">주제 선택</MenuItem>
              <MenuItem value="그냥">그냥</MenuItem>
              <MenuItem value="여행">여행</MenuItem>
              <MenuItem value="음식">음식</MenuItem>
              <MenuItem value="요리">요리</MenuItem>
              <MenuItem value="일상">일상</MenuItem>
              <MenuItem value="게임">게임</MenuItem>
              <MenuItem value="음악">음악</MenuItem>
              <MenuItem value="자기계발">자기계발</MenuItem>
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
