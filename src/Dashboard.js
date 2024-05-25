import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import CustomNavbar from "./components/CustomNavbar";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { storage, db } from "./firebase"; // Firebase 초기화 파일에서 storage와 db를 import 합니다.
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore"; // Firestore 모듈 추가
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Dashboard() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); // 사용자 정보 상태

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 사용자가 로그인한 경우
        setUser(user);
      } else {
        // 사용자가 로그아웃한 경우
        setUser(null);
      }
    });

    return () => {
      // 컴포넌트가 언마운트될 때 이벤트 리스너 구독 해제
      unsubscribe();
    };
  }, []);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    let imageUrl = "";
    if (image) {
      const storageRef = ref(storage, `images/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Error uploading image:", error);
          setLoading(false);
        },
        async () => {
          imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          savePostData(imageUrl); // 이미지 업로드가 완료된 후에 데이터 저장
        }
      );
    } else {
      savePostData(imageUrl); // 이미지가 없으면 빈 문자열을 전달
    }
  };

  const savePostData = async (imageUrl) => {
    try {
      // 사용자의 UID를 이용하여 데이터를 저장합니다.
      await addDoc(collection(db, `users/${user.uid}/posts`), {
        title: title,
        content: content,
        imageUrl: imageUrl,
        createdAt: new Date(),
      });
      setTitle("");
      setContent("");
      setImage(null);
      setLoading(false);
      console.log("Document successfully written!");
    } catch (error) {
      console.error("Error writing document: ", error);
      setLoading(false);
    }
  };

  return (
    <>
      <CustomNavbar />
      <Container className="Dashboard mt-4">
        <Typography variant="h4" component="h1" gutterBottom>
          Write a Post
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              fullWidth
              label="Title"
              variant="outlined"
              value={title}
              onChange={handleTitleChange}
            />
          </Box>
          <Box mb={2}>
            <TextField
              fullWidth
              label="Content"
              variant="outlined"
              multiline
              rows={4}
              value={content}
              onChange={handleContentChange}
            />
          </Box>
          <Box mb={2}>
            <input
              accept="image/*"
              type="file"
              onChange={handleImageChange}
              id="upload-button"
              style={{ display: "none" }}
            />
            <label htmlFor="upload-button">
              <Button variant="contained" component="span">
                Upload Image
              </Button>
            </label>
            {image && <Typography>{image.name}</Typography>}
          </Box>
          {loading ? (
            <CircularProgress />
          ) : (
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          )}
        </form>
      </Container>
    </>
  );
}

export default Dashboard;
