import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";

import PostList from "../components/PostList";
import { db, storage } from "../Firebase/firebase";

function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

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
      setLoading(false); // 인증 상태 확인 후 로딩 종료
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchUserPosts = async (uid) => {
    setLoading(true); // 데이터 로딩 시작
    try {
      const postsRef = collection(db, `users/${uid}/posts`);
      const querySnapshot = await getDocs(postsRef);
      const userPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(userPosts);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setLoading(false); // 데이터 로딩 종료
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
      console.error("Error updating post:", error);
      alert("게시물 업데이트 오류. 나중에 다시 시도해 주세요.");
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm(
      "정말로 이 게시물을 삭제하시겠습니까?"
    );
    if (!confirmDelete) return; // 사용자가 삭제를 취소한 경우

    try {
      const batch = writeBatch(db);
      const post = posts.find((post) => post.id === postId);

      if (post?.imageUrls?.length > 0) {
        for (const imageUrl of post.imageUrls) {
          const imageRef = ref(storage, imageUrl);
          try {
            await getDownloadURL(imageRef); // URL 확인
            await deleteObject(imageRef); // 이미지 삭제
          } catch (error) {
            console.error("Error deleting image:", error);
          }
        }
      }

      const postDocRef = doc(db, `users/${user.uid}/posts`, postId);
      batch.delete(postDocRef); // 게시물 삭제

      await batch.commit(); // 배치 커밋
      setPosts(posts.filter((post) => post.id !== postId)); // 상태 업데이트
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("게시물 삭제 오류. 나중에 다시 시도해 주세요.");
    }
  };

  if (loading) {
    return <div>Loading...</div>; // 로딩 상태 UI
  }

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
