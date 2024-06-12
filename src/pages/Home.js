import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../Firebase/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";
import PostList from "../components/PostList";
import CustomNavbar from "../components/Header";

function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

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
            alert("Error deleting image. Please try again later.");
          }
        }
      }
      await deleteDoc(doc(db, `users/${user.uid}/posts`, postId));
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error deleting post. Please try again later.");
    }
  };

  return (
    <div className="Home">
      <div className="main">
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
    </div>
  );
}

export default Home;
