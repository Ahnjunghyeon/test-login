import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  runTransaction,
  doc,
  getDoc,
  collection,
  getDocs,
  onSnapshot,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  MenuItem,
  Menu,
  Typography,
  IconButton,
  Avatar,
  Collapse,
  Button,
  Tooltip,
  TextField,
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
import NotesIcon from "@mui/icons-material/Notes";
import MapsUgcRoundedIcon from "@mui/icons-material/MapsUgcRounded";
import FollowersPage from "../pages/FollowersPage";
import UploadPost from "./UploadPost";
import ProfileImage from "./ProfileLogo";
import EditPostDialog from "./EditPostDialog"; // EditPostDialog 임포트
import "./PostList.css";

const PostList = ({
  user,
  posts,
  displayName,
  handleUpdatePost,
  handleDeletePost,
  postId,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState({});
  const [expanded, setExpanded] = useState({});
  const [contentExpanded, setContentExpanded] = useState({});
  const [followedPosts, setFollowedPosts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categoryMenuAnchorEl, setCategoryMenuAnchorEl] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [likesCount, setLikesCount] = useState({});
  const [showFollowers, setShowFollowers] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 869);
  const [newComment, setNewComment] = useState({});
  const [comments, setComments] = useState({});
  const [openEditDialog, setOpenEditDialog] = useState(false); // EditPostDialog 열림 상태
  const [currentPost, setCurrentPost] = useState(null); // 현재 수정할 게시물

  const navigate = useNavigate();
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
                    : "알 수 없는 사용자";
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

          likedPostsData[post.id] = likeDoc.exists();
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
            `포스트 ${post.id}의 좋아요 수를 가져오는 중 오류 발생:`,
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

  // 댓글 실시간 업데이트
  useEffect(() => {
    const unsubscribeComments = {};
    const allPosts = [...posts, ...followedPosts];
    allPosts.forEach((post) => {
      const commentsRef = collection(
        db,
        `users/${post.uid}/posts/${post.id}/comments`
      );
      const q = query(commentsRef, orderBy("timestamp"));
      unsubscribeComments[post.id] = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map((doc) => doc.data());
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

  const handleExpandClick = (postId) => {
    setExpanded((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleContentExpandClick = (postId) => {
    setContentExpanded((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
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
      console.error("포스트 좋아요/좋아요 취소 중 오류 발생:", error);
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
        console.error("포스트를 찾을 수 없습니다!");
      }
    } catch (error) {
      console.error("포스트를 가져오는 중 오류 발생:", error);
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
        throw new Error("웹 공유 API가 이 브라우저에서 지원되지 않습니다.");
      }
    } catch (error) {
      console.error("공유 중 오류 발생:", error);
    }
  };

  const handleResize = () => {
    setIsLargeScreen(window.innerWidth >= 869);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 댓글 추가 핸들러
  const handleAddComment = async (postId) => {
    if (!newComment[postId]) return; // 빈 댓글은 무시

    // 게시물 객체 찾기
    const post = combinedPosts.find((p) => p.id === postId);
    if (!post) {
      console.error("게시물을 찾을 수 없습니다!");
      return;
    }

    try {
      // 사용자 정보를 가져오기
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const displayName = userDoc.exists()
        ? userDoc.data().displayName
        : "알 수 없는 사용자";

      // 댓글 추가
      const commentsRef = collection(
        db,
        `users/${post.uid}/posts/${postId}/comments`
      );

      await addDoc(commentsRef, {
        content: newComment[postId],
        displayName: displayName,
        timestamp: new Date().toISOString(),
        userId: user.uid,
      });

      // 댓글 입력 필드 초기화
      setNewComment((prev) => ({
        ...prev,
        [postId]: "",
      }));
    } catch (error) {
      console.error("댓글 추가 중 오류 발생:", error);
    }
  };

  const handleEditPostClick = (post) => {
    setCurrentPost(post); // 현재 수정할 게시물 설정
    setOpenEditDialog(true); // EditPostDialog 열기
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false); // EditPostDialog 닫기
    setCurrentPost(null); // 현재 수정할 게시물 초기화
  };

  return (
    <>
      <div className="PostList">
        <div className="Posts">
          {user ? (
            <>
              <h2>게시물 목록</h2>
              <Button onClick={handleCategoryMenuOpen}>주제 필터</Button>
              <Menu
                anchorEl={categoryMenuAnchorEl}
                open={Boolean(categoryMenuAnchorEl)}
                onClose={handleCategoryMenuClose}
              >
                <MenuItem onClick={() => handleCategorySelect("")}>
                  전체
                </MenuItem>
                <MenuItem onClick={() => handleCategorySelect("Travel")}>
                  여행
                </MenuItem>
                <MenuItem onClick={() => handleCategorySelect("Food")}>
                  음식
                </MenuItem>
                <MenuItem onClick={() => handleCategorySelect("Cooking")}>
                  요리
                </MenuItem>
                <MenuItem onClick={() => handleCategorySelect("Culture")}>
                  일상
                </MenuItem>
                <MenuItem onClick={() => handleCategorySelect("Games")}>
                  게임
                </MenuItem>
                <MenuItem onClick={() => handleCategorySelect("Music")}>
                  음악
                </MenuItem>
                <MenuItem onClick={() => handleCategorySelect("Study")}>
                  자기계발
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
                                onClick={() => handleEditPostClick(post)}
                              >
                                글 수정
                              </MenuItem>{" "}
                              {/* 글 수정 버튼 */}
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
                        <Typography>카테고리: {post.category}</Typography>
                        <Typography variant="subtitle2">
                          {new Date(
                            post.createdAt.seconds * 1000
                          ).toLocaleString()}
                        </Typography>
                        <div>
                          {comments[post.id] &&
                            comments[post.id].map((comment, index) => (
                              <Typography key={index} variant="body2">
                                {comment.displayName}: {comment.content}
                              </Typography>
                            ))}
                        </div>
                        <TextField
                          label="댓글 추가"
                          variant="outlined"
                          fullWidth
                          margin="normal"
                          value={newComment[post.id] || ""}
                          onChange={(e) =>
                            setNewComment((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleAddComment(post.id)}
                        >
                          댓글 추가
                        </Button>
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

        <div className={`slide-menu ${showFollowers ? "open" : ""}`}>
          <div className="slidelist">팔로우 리스트</div>
          {showFollowers && !isLargeScreen && <FollowersPage />}
        </div>
      </div>

      {/* EditPostDialog 추가 */}
      {openEditDialog && currentPost && (
        <EditPostDialog
          open={openEditDialog}
          onClose={handleEditDialogClose}
          post={currentPost}
          handleUpdatePost={handleUpdatePost}
        />
      )}
    </>
  );
};

export default PostList;
