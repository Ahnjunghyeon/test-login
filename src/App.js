// App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import CustomNavbar from "./components/CustomNavbar";
import { storage, db } from "./firebase";
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
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UploadPost from "./UploadPost";
import EditPostDialog from "./EditPostDialog";

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
  const [user, setUser] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImages, setEditImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserPosts(user.uid);
      } else {
        setUser(null);
        setPosts([]);
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
    setImageUrls(selectedPost.imageUrls || []);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeletePost = async () => {
    if (selectedPost) {
      if (selectedPost.imageUrls && selectedPost.imageUrls.length > 0) {
        for (const imageUrl of selectedPost.imageUrls) {
          const imageRef = ref(storage, imageUrl);
          try {
            await getDownloadURL(imageRef);
            // 이미지가 존재할 경우에만 삭제를 시도합니다.
            await deleteObject(imageRef);
          } catch (error) {
            console.error("Error deleting image:", error);
          }
        }
      }
      await deleteDoc(doc(db, `users/${user.uid}/posts`, selectedPost.id));
      setPosts(posts.filter((post) => post.id !== selectedPost.id));
      handleMenuClose();
    }
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedPost(null);
    setEditImages([]);
  };

  const updatePostData = async (updatedImageUrls) => {
    if (selectedPost) {
      await updateDoc(doc(db, `users/${user.uid}/posts`, selectedPost.id), {
        title: editTitle,
        content: editContent,
        imageUrls: updatedImageUrls,
      });
      setPosts(
        posts.map((post) =>
          post.id === selectedPost.id
            ? {
                ...post,
                title: editTitle,
                content: editContent,
                imageUrls: updatedImageUrls,
              }
            : post
        )
      );
      handleEditDialogClose();
    }
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="App">
      <CustomNavbar />
      <div className="Home">
        <div className="HomeHeader">
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
                              <img
                                src={user.photoURL}
                                alt="User profile"
                                style={{ width: "100%", height: "100%" }}
                              />
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
                      <CardMedia>
                        <UploadPost imageUrls={post.imageUrls || []} />
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
                      <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <CardContent>
                          <Typography paragraph>Additional content</Typography>
                        </CardContent>
                      </Collapse>
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

      <EditPostDialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        title={editTitle}
        content={editContent}
        imageUrls={imageUrls}
        uploading={uploading}
        onTitleChange={(e) => setEditTitle(e.target.value)}
        onContentChange={(e) => setEditContent(e.target.value)}
        onImageChange={(e) => {
          const files = Array.from(e.target.files);
          setEditImages(files);
        }}
        onRemoveImage={(index) => {
          const updatedImages = [...editImages];
          updatedImages.splice(index, 1);
          setEditImages(updatedImages);

          const updatedUrls = [...imageUrls];
          updatedUrls.splice(index, 1);
          setImageUrls(updatedUrls);
        }}
        onSave={async (title, content, imageUrls) => {
          let updatedImageUrls = [...imageUrls];

          if (editImages.length > 0) {
            setUploading(true);
            const uploadPromises = editImages.map((image) => {
              const folderRef = ref(storage, `images/${editTitle}`);
              const storageRef = ref(folderRef, image.name);
              const uploadTask = uploadBytesResumable(storageRef, image);

              return new Promise((resolve, reject) => {
                uploadTask.on(
                  "state_changed",
                  null,
                  (error) => {
                    console.error("Error uploading image:", error);
                    reject(error);
                  },
                  async () => {
                    const downloadURL = await getDownloadURL(
                      uploadTask.snapshot.ref
                    );
                    resolve(downloadURL);
                  }
                );
              });
            });

            updatedImageUrls = await Promise.all(uploadPromises);
            setUploading(false);
          }

          await updatePostData(updatedImageUrls);
        }}
      />
    </div>
  );
}

export default App;
