import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../Firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Container, Typography, CircularProgress, Box } from "@mui/material";
import "./PostPage.css"; // CSS 파일 import
import UploadPost from "../components/UploadPost"; // UploadPost 컴포넌트 import

const PostPage = () => {
  const { uid, postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, `users/${uid}/posts`, postId));
        if (postDoc.exists()) {
          setPost(postDoc.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [uid, postId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!post) {
    return <Typography variant="h5">게시물을 찾을 수 없습니다.</Typography>;
  }

  return (
    <Container className="container">
      <Typography variant="h3" className="title">
        {post.category}
      </Typography>
      <Typography variant="h5" className="content">
        {post.content}
      </Typography>
      <UploadPost imageUrls={post.imageUrls} /> {/* UploadPost 컴포넌트 추가 */}
    </Container>
  );
};

export default PostPage;
