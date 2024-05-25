import React, { useState, useEffect } from "react";
import "./App.css";
import CustomNavbar from "./components/CustomNavbar";
import { db, storage } from "./firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { styled } from "@mui/material/styles";
import { Image } from "react-bootstrap";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

function App() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null); // 사용자 정보 상태
  const [menuAnchorEl, setMenuAnchorEl] = useState(null); // 메뉴 앵커 엘리먼트 상태
  const [selectedPost, setSelectedPost] = useState(null); // 선택된 게시물
  const [editDialogOpen, setEditDialogOpen] = useState(false); // 수정 다이얼로그 상태
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserPosts(user.uid); // 사용자가 로그인한 경우 게시물 가져오기
      } else {
        setUser(null);
        setPosts([]); // 사용자가 로그아웃한 경우 게시물 초기화
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchUserPosts = async (uid) => {
    try {
      const querySnapshot = await getDocs(collection(db, `users/${uid}/posts`));
      const userPosts = [];
      querySnapshot.forEach((doc) => {
        userPosts.push({ id: doc.id, ...doc.data() });
      });
      setPosts(userPosts);
    } catch (error) {
      console.error("Error fetching user posts: ", error);
    }
  };

  const handleMenuOpen = (event, post) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedPost(null);
  };

  const handleEditPost = () => {
    setEditTitle(selectedPost.title);
    setEditContent(selectedPost.content);
    setImageUrl(selectedPost.imageUrl);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeletePost = async () => {
    if (selectedPost) {
      if (selectedPost.imageUrl) {
        const imageRef = ref(storage, selectedPost.imageUrl);
        await deleteObject(imageRef);
      }
      await deleteDoc(doc(db, `users/${user.uid}/posts`, selectedPost.id));
      setPosts(posts.filter((post) => post.id !== selectedPost.id));
      handleMenuClose();
    }
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedPost(null);
    setEditImage(null);
  };

  const handleEditDialogSave = async () => {
    let updatedImageUrl = imageUrl;

    if (editImage) {
      setUploading(true);
      const storageRef = ref(storage, `images/${editImage.name}`);
      const uploadTask = uploadBytesResumable(storageRef, editImage);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Error uploading image:", error);
          setUploading(false);
        },
        async () => {
          updatedImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          await updatePostData(updatedImageUrl);
        }
      );
    } else {
      await updatePostData(updatedImageUrl);
    }
  };

  const updatePostData = async (imageUrl) => {
    if (selectedPost) {
      await updateDoc(doc(db, `users/${user.uid}/posts`, selectedPost.id), {
        title: editTitle,
        content: editContent,
        imageUrl: imageUrl,
      });
      setPosts(
        posts.map((post) =>
          post.id === selectedPost.id
            ? {
                ...post,
                title: editTitle,
                content: editContent,
                imageUrl: imageUrl,
              }
            : post
        )
      );
      handleEditDialogClose();
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setEditImage(file);
  };

  const handleRemoveImage = () => {
    setEditImage(null);
    setImageUrl("");
  };

  const handleUploadImage = async () => {
    if (editImage) {
      const storageRef = ref(storage, `images/${editImage.name}`);
      const uploadTask = uploadBytesResumable(storageRef, editImage);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // 업로드 상태 변화 처리
        },
        (error) => {
          // 업로드 오류 처리
          console.error("Error uploading image:", error);
        },
        async () => {
          // 업로드 완료 처리
          const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(imageUrl);
        }
      );
    }
  };

  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="App">
      <CustomNavbar />
      <div className="Home">
        <div className="HomeHeader">
          {/* 사용자 게시물 출력 */}
          {user && (
            <div className="Posts">
              <h2>{user.email}님의 게시물</h2>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="Post"
                    style={{ marginBottom: "20px" }}
                  >
                    <Card sx={{ maxWidth: 345 }}>
                      <CardHeader
                        avatar={
                          <Avatar
                            sx={{ bgcolor: red[500] }}
                            aria-label="recipe"
                          >
                            {user && (
                              <>
                                <Image
                                  src={user.photoURL}
                                  roundedCircle
                                  width="50"
                                  height="50"
                                  alt="User profile"
                                />
                              </>
                            )}
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
                              anchorEl={menuAnchorEl}
                              open={Boolean(menuAnchorEl)}
                              onClose={handleMenuClose}
                            >
                              <MenuItem onClick={handleEditPost}>
                                글 수정
                              </MenuItem>
                              <MenuItem onClick={handleDeletePost}>
                                글 삭제
                              </MenuItem>
                            </Menu>
                          </>
                        }
                        title={post.title}
                        subheader={user.displayName}
                      />
                      <CardMedia
                        className="insertimage"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            component="img"
                            height="300"
                            width="auto"
                          />
                        )}
                      </CardMedia>

                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {post.content}
                        </Typography>
                      </CardContent>
                      <CardActions disableSpacing>
                        <IconButton aria-label="add to favorites">
                          <FavoriteIcon />
                        </IconButton>
                        <IconButton aria-label="share">
                          <ShareIcon />
                        </IconButton>
                        <ExpandMore
                          expand={expanded}
                          onClick={handleExpandClick}
                          aria-expanded={expanded}
                          aria-label="show more"
                        >
                          <ExpandMoreIcon />
                        </ExpandMore>
                      </CardActions>
                      <Collapse
                        in={expanded}
                        timeout="auto"
                        unmountOnExit
                      ></Collapse>
                    </Card>
                  </div>
                ))
              ) : (
                <p>게시물이 없습니다.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>글 수정</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Content"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          {imageUrl && (
            <div>
              <img
                src={imageUrl}
                alt="Current"
                height="100"
                style={{ marginTop: "10px" }}
              />
              <Button onClick={handleRemoveImage} color="secondary">
                Remove Image
              </Button>
            </div>
          )}
          {imageUrl && (
            <div>
              <input
                accept="image/*"
                id="image-input"
                type="file"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <label htmlFor="image-input">
                <Button component="span">Upload Image</Button>
              </label>
            </div>
          )}
          {uploading && (
            <CircularProgress size={24} style={{ marginTop: "10px" }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleEditDialogSave} disabled={uploading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default App;
