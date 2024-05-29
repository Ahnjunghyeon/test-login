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
import { ref, getDownloadURL, deleteObject } from "firebase/storage";

import PostList from "./PostList";

function App() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [Images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
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

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleEditPost = () => {
    if (selectedPost) {
      setTitle(selectedPost.title);
      setContent(selectedPost.content);
      setImageUrls(selectedPost.imageUrls || []);
      handleMenuClose();
    }
  };

  const handleSaveChanges = async () => {
    if (selectedPost) {
      await updatePostData(selectedPost.id, imageUrls);
      setTitle("");
      setContent("");
      setImageUrls([]);
    }
  };

  const updatePostData = async (postId, updatedImageUrls) => {
    try {
      if (postId) {
        await updateDoc(doc(db, `users/${user.uid}/posts`, postId), {
          title: title,
          content: content,
          imageUrls: updatedImageUrls,
        });
        setPosts(
          posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  title: title,
                  content: content,
                  imageUrls: updatedImageUrls,
                }
              : post
          )
        );
        handleEditDialogClose();
      }
    } catch (error) {
      console.error("Error updating post data:", error);
    }
  };

  const handleEditDialogClose = () => {
    setSelectedPost(null);
    setImages([]);
  };

  // 글 삭제함수.
  const handleDeletePost = async () => {
    if (selectedPost) {
      if (selectedPost.imageUrls && selectedPost.imageUrls.length > 0) {
        for (const imageUrl of selectedPost.imageUrls) {
          const imageRef = ref(storage, imageUrl);
          try {
            await getDownloadURL(imageRef);
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

  return (
    <div className="App">
      <CustomNavbar />
      <PostList
        user={user}
        posts={posts}
        menuAnchorEl={menuAnchorEl}
        expanded={expanded}
        handleMenuOpen={handleMenuOpen}
        handleMenuClose={handleMenuClose}
        handleEditPost={handleEditPost}
        handleDeletePost={handleDeletePost}
        handleExpandClick={handleExpandClick}
      />
    </div>
  );
}

export default App;
