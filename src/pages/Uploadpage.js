import React, { useState, useEffect } from "react";
import "./Uploadpage.css";
import CustomNavbar from "../components/Header";
import Footer from "../components/Footer";
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
import { useNavigate } from "react-router-dom";

function Uploadpage() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [categoryPostsCount, setCategoryPostsCount] = useState(0);
  const [imageError, setImageError] = useState("");
  const navigate = useNavigate();

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

    const postId = new Date().getTime().toString();
    const userPostId = category
      ? `${displayName}_${category}_${categoryPostsCount + 1}`
      : `${displayName}_${categoryPostsCount + 1}`;

    const folderRef = ref(storage, `users/${user.uid}/posts/${userPostId}/`);

    const uploadImages = async () => {
      const uploadedImageUrls = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imageName = `image${i}`;

        const fileRef = ref(folderRef, imageName);
        const uploadTask = uploadBytesResumable(fileRef, image);

        try {
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
      const imageUrls = await uploadImages();
      await savePostData(imageUrls, userPostId, postId);
    } catch (error) {
      console.error("Error uploading images or saving data:", error);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirmDialogOpen(false);
  };

  const savePostData = async (imageUrls, userPostId, postId) => {
    try {
      await setDoc(doc(db, `users/${user.uid}/posts`, userPostId), {
        content: content,
        imageUrls: imageUrls,
        category: category || "Uncategorized",
        createdAt: new Date(),
        uid: user.uid,
        postId: postId,
      });
      setContent("");
      setImages([]);
      setPreviews([]);
      setLoading(false);
      console.log("Document successfully written!");
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
                <MenuItem value="..">그냥</MenuItem>
                <MenuItem value="여행">여행</MenuItem>
                <MenuItem value="음식">음식</MenuItem>
                <MenuItem value="요리">요리</MenuItem>
                <MenuItem value="일상">일상</MenuItem>
                <MenuItem value="게임">게임</MenuItem>
                <MenuItem value="음악">음악</MenuItem>
                <MenuItem value="자기계발">자기계발</MenuItem>
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
      <Footer />
    </>
  );
}

export default Uploadpage;
