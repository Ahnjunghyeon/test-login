import React, { useState, useEffect } from "react";

import "./Uploadpage.css";
import CustomNavbar from "../components/Header";
import Footer from "../components/Footer"; // Footer 컴포넌트 추가

import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { storage, db } from "../Firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // useNavigate import 추가

function Uploadpage() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState(""); // displayName 상태 추가
  const [categoryPostsCount, setCategoryPostsCount] = useState(0); // 카테고리별 게시물 수 상태 추가
  const [imageError, setImageError] = useState(""); // 이미지 에러 상태 추가
  const navigate = useNavigate(); // useNavigate hook 추가

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserDisplayName(user.uid);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user && category) {
      fetchCategoryPostsCount(user.uid, category);
    }
  }, [user, category]);

  const fetchUserDisplayName = async (uid) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      setDisplayName(userDoc.data().displayName);
    }
  };

  const fetchCategoryPostsCount = async (uid, category) => {
    const categoryPostsQuery = query(
      collection(db, `users/${uid}/posts`),
      where("category", "==", category)
    );
    const categoryPostsSnapshot = await getDocs(categoryPostsQuery);
    setCategoryPostsCount(categoryPostsSnapshot.size);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setImages(files);

    const filePreviews = files.map((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prevPreviews) => [...prevPreviews, reader.result]);
      };
      reader.readAsDataURL(file);
      return null;
    });
    setPreviews([]);
    Promise.all(filePreviews);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (images.length === 0) {
      setImageError("사진을 하나 이상 추가해야 합니다.");
      return;
    }

    setImageError("");
    setConfirmDialogOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);

    const folderRef = ref(storage, `users/${user.uid}/postimage/`);

    // 이미지 업로드 및 저장을 위한 함수
    const uploadImages = async () => {
      const uploadedImageUrls = [];

      // 각 이미지에 대해 순차적으로 업로드 처리
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imageName = `image${i}`; // 이미지 이름을 image0, image1, image2, ... 형태로 지정

        const fileRef = ref(folderRef, imageName);
        const uploadTask = uploadBytesResumable(fileRef, image);

        try {
          // 업로드가 진행됨에 따라 발생하는 이벤트 처리
          await new Promise((resolve, reject) => {
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
                reject(error);
              },
              async () => {
                // 업로드 완료 후 이미지 다운로드 URL 획득
                const downloadURL = await getDownloadURL(
                  uploadTask.snapshot.ref
                );
                uploadedImageUrls.push(downloadURL);
                resolve();
              }
            );
          });
        } catch (error) {
          console.error("Error uploading image:", error);
          setLoading(false);
          return;
        }
      }

      return uploadedImageUrls;
    };

    try {
      // 이미지 업로드 및 URL 획득
      const imageUrls = await uploadImages();

      // Firestore에 데이터 저장 및 페이지 네비게이션
      await savePostData(imageUrls);
    } catch (error) {
      console.error("Error uploading images or saving data:", error);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirmDialogOpen(false);
  };

  const savePostData = async (imageUrls) => {
    try {
      const postNumber = categoryPostsCount + 1;
      const userPostId = category
        ? `${displayName}_${category}_${postNumber}`
        : `${displayName}_${postNumber}`;
      await setDoc(doc(db, `users/${user.uid}/posts`, userPostId), {
        content: content,
        imageUrls: imageUrls,
        category: category || "Uncategorized",
        createdAt: new Date(),
        uid: user.uid, // 유저의 uid를 추가합니다.
      });
      setContent("");
      setImages([]);
      setPreviews([]);
      setLoading(false);
      console.log("Document successfully written!");

      // 새로 생성된 게시물 페이지로 이동
      navigate("/home");
    } catch (error) {
      console.error("Error writing document: ", error);
      setLoading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);

    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
  };

  return (
    <>
      <CustomNavbar />
      <Container className="Dashboard">
        <Typography variant="h4" component="h1" gutterBottom>
          업로드 페이지
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              fullWidth
              label="내용"
              variant="outlined"
              multiline
              rows={4}
              value={content}
              onChange={handleContentChange}
            />
          </Box>
          <Box mb={2}>
            <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
              <InputLabel id="category-label">주제</InputLabel>
              <Select
                labelId="category-label"
                value={category}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="">주제</MenuItem>
                <MenuItem value="None">그냥</MenuItem>
                <MenuItem value="Travel">여행</MenuItem>
                <MenuItem value="Food">음식</MenuItem>
                <MenuItem value="Cooking">요리</MenuItem>
                <MenuItem value="Culture">일상</MenuItem>
                <MenuItem value="Games">게임</MenuItem>
                <MenuItem value="Music">음악</MenuItem>
                <MenuItem value="Study">자기계발</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box mb={2}>
            <input
              accept="image/*"
              type="file"
              multiple
              onChange={handleImageChange}
              id="upload-button"
              style={{ display: "none" }}
            />
            <label htmlFor="upload-button">
              <Button variant="contained" component="span">
                사진을 등록해보세요
              </Button>
            </label>
          </Box>
          {imageError && (
            <Typography color="error" variant="body2" mb={2}>
              {imageError}
            </Typography>
          )}
          <Box mb={2} style={{ display: "flex", flexWrap: "wrap" }}>
            {previews.map((preview, index) => (
              <div key={index} className="image-preview-item">
                <img
                  src={preview}
                  alt={`preview-${index}`}
                  className="image-preview"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="remove-image-button"
                >
                  X
                </button>
                {console.log("Button rendered for image index:", index)}
              </div>
            ))}
          </Box>
          {loading ? (
            <CircularProgress />
          ) : (
            <Button type="submit" variant="contained" color="primary">
              저장
            </Button>
          )}
        </form>
      </Container>
      <Dialog open={confirmDialogOpen} onClose={handleCancel}>
        <DialogTitle>게시물을 등록하시겠습니까?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            아니요
          </Button>
          <Button onClick={handleConfirm} color="primary">
            네
          </Button>
        </DialogActions>
      </Dialog>
      {/* <Footer /> */}
    </>
  );
}

export default Uploadpage;
