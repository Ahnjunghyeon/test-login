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
import { storage, db } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import UploadPost from "./UploadPost"; // UploadPost 컴포넌트 임포트

function Dashboard() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]); // 업로드된 이미지 URL 상태

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const folderRef = ref(storage, `images/${title}`);
    const imageUrls = await Promise.all(
      images.map(async (image) => {
        const fileRef = ref(folderRef, image.name);
        const uploadTask = uploadBytesResumable(fileRef, image);

        return new Promise((resolve, reject) => {
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
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      })
    );

    setUploadedImageUrls(imageUrls); // 업로드된 이미지 URL 상태 업데이트
    savePostData(imageUrls);
  };

  const savePostData = async (imageUrls) => {
    try {
      // 사용자의 UID를 이용하여 데이터를 저장합니다.
      await addDoc(collection(db, `users/${user.uid}/posts`), {
        title: title,
        content: content,
        imageUrls: imageUrls, // 여러 이미지 URL을 저장
        createdAt: new Date(),
      });
      setTitle("");
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
          <Box mb={2} style={{ display: "flex", flexWrap: "wrap" }}>
            {previews.map((preview, index) => (
              <div key={index} style={{ alignItems: "center", margin: "10px" }}>
                <img
                  src={preview}
                  alt={`preview-${index}`}
                  style={{
                    display: "flex",
                    maxWidth: "100%",
                    maxHeight: "100px",
                    marginRight: "10px",
                  }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => handleRemoveImage(index)}
                >
                  Remove
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

        {/* UploadPost 컴포넌트를 사용하여 업로드된 이미지 URL을 전달 */}
        {uploadedImageUrls.length > 0 && (
          <UploadPost imageUrls={uploadedImageUrls} />
        )}
      </Container>
    </>
  );
}

export default Dashboard;
