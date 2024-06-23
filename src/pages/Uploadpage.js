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
  onSnapshot,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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

      // Firestore에 데이터 저장
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
      <Container className="Dashboard mt-4">
        <Typography variant="h4" component="h1" gutterBottom>
          Write a Post
        </Typography>
        <form onSubmit={handleSubmit}>
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
            <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={category}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="">Select Category</MenuItem>
                <MenuItem value="None">None</MenuItem>
                <MenuItem value="Travel">Travel</MenuItem>
                <MenuItem value="Food">Food</MenuItem>
                <MenuItem value="Cooking">Cooking</MenuItem>
                <MenuItem value="Culture">Culture</MenuItem>
                <MenuItem value="Games">Games</MenuItem>
                <MenuItem value="Music">Music</MenuItem>
                <MenuItem value="Study">Study</MenuItem>
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
                Upload Images
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
              <div
                key={index}
                style={{
                  alignItems: "center",
                  margin: "10px",
                  position: "relative",
                }}
              >
                <img
                  src={preview}
                  alt={`preview-${index}`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100px",
                    marginRight: "10px",
                  }}
                />
                <Button
                  onClick={() => handleRemoveImage(index)}
                  style={{
                    position: "absolute",
                    top: "0px",
                    right: "10px",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    width: "30px",
                    height: "30px",
                    minWidth: "30px",
                    fontSize: "12px",
                    padding: "0",
                  }}
                >
                  X
                </Button>
              </div>
            ))}
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
      <Footer /> {/* Footer 컴포넌트 추가 */}
      <Dialog open={confirmDialogOpen} onClose={handleCancel}>
        <DialogTitle>게시물을 등록하시겠습니까?</DialogTitle>
        <DialogActions>
          <Button onClick={handleConfirm} color="primary">
            Yes
          </Button>
          <Button onClick={handleCancel} color="primary">
            No
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Uploadpage;
