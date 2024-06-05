import React, { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import CustomNavbar from "./components/Header";
import { storage, db } from "./Firebase/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";

import PostList from "./components/PostList";

function App() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  const handleUpdatePost = async (postId, updatedData) => {
    try {
      const postDocRef = doc(db, `users/${user.uid}/posts`, postId);
      await updateDoc(postDocRef, updatedData);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, ...updatedData } : post
        )
      );
    } catch (error) {
      console.error("Error updating post data:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const post = posts.find((post) => post.id === postId);
      if (post.imageUrls && post.imageUrls.length > 0) {
        for (const imageUrl of post.imageUrls) {
          const imageRef = ref(storage, imageUrl);
          try {
            await getDownloadURL(imageRef);
            await deleteObject(imageRef);
          } catch (error) {
            console.error("Error deleting image:", error);
          }
        }
      }
      await deleteDoc(doc(db, `users/${user.uid}/posts`, postId));
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleProfileNavigation = () => {
    if (user) {
      navigate(`/profile/${user.uid}`);
    }
  };

  return (
    <div className="App">
      <CustomNavbar onProfileClick={handleProfileNavigation} />

      <Routes>
        <Route
          path="/"
          element={
            <PostList
              user={user}
              posts={posts}
              handleUpdatePost={handleUpdatePost}
              handleDeletePost={handleDeletePost}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
