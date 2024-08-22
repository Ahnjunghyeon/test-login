import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../Firebase/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";
import { writeBatch } from "firebase/firestore";

import PostList from "../components/PostList";

function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  // 사용자 인증 상태 확인 및 게시물 가져오기
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserPosts(user.uid); // 사용자 게시물 가져오기
      } else {
        setUser(null);
        setPosts([]);
      }
    });

    return () => {
      unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
    };
  }, []);

  // 사용자 게시물 가져오기
  const fetchUserPosts = async (uid) => {
    try {
      const postsRef = collection(db, `users/${uid}/posts`);
      // 게시물을 페이지네이션하여 가져오기
      const querySnapshot = await getDocs(postsRef);
      const userPosts = [];
      querySnapshot.forEach((doc) => {
        userPosts.push({ id: doc.id, ...doc.data() });
      });
      setPosts(userPosts);
    } catch (error) {
      console.error("게시물 가져오기 오류: ", error);
    }
  };

  // 게시물 업데이트 처리
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
      console.error("게시물 업데이트 오류:", error);
    }
  };

  // 게시물 삭제 처리
  const handleDeletePost = async (postId) => {
    try {
      const batch = writeBatch(db);
      const post = posts.find((post) => post.id === postId);

      if (post.imageUrls && post.imageUrls.length > 0) {
        for (const imageUrl of post.imageUrls) {
          const imageRef = ref(storage, imageUrl);
          try {
            await getDownloadURL(imageRef); // URL 확인
            await deleteObject(imageRef); // 이미지 삭제
          } catch (error) {
            console.error("이미지 삭제 오류:", error);
            alert("이미지 삭제 오류. 나중에 다시 시도해 주세요.");
          }
        }
      }

      const postDocRef = doc(db, `users/${user.uid}/posts`, postId);
      batch.delete(postDocRef); // 게시물 삭제

      await batch.commit(); // 배치 커밋
      setPosts(posts.filter((post) => post.id !== postId)); // 상태 업데이트
    } catch (error) {
      console.error("게시물 삭제 오류:", error);
      alert("게시물 삭제 오류. 나중에 다시 시도해 주세요.");
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
