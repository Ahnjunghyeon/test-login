import React, { useState, useEffect } from "react";
import "./Uploadpage.css";
import CustomNavbar from "../components/Header";
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
} from "@mui/material";
import { storage, db } from "../Firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Uploadpage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userPostsCount, setUserPostsCount] = useState(0);
  const [category, setCategory] = useState(""); // 카테고리 state 추가

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      const userPostsRef = collection(db, `users/${user.uid}/posts`);
      const unsubscribe = onSnapshot(userPostsRef, (snapshot) => {
        setUserPostsCount(snapshot.size);
      });

      return unsubscribe;
    }
  }, [user]);

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

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
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

    savePostData(imageUrls);
  };

  const savePostData = async (imageUrls) => {
    try {
      const userPostId = `${user.uid}${userPostsCount + 1}`;
      await setDoc(doc(db, `users/${user.uid}/posts`, userPostId), {
        title: title,
        content: content,
        imageUrls: imageUrls,
        category: category, // 카테고리 추가
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
            <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={category}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="">Select Category</MenuItem>
                <MenuItem value="Travel">Travel</MenuItem>
                <MenuItem value="Food">Food</MenuItem>
                <MenuItem value="Cooking">Cooking</MenuItem>
                <MenuItem value="Culture">Culture</MenuItem>
                <MenuItem value="Games">Games</MenuItem>
                <MenuItem value="Music">Music</MenuItem>
                <MenuItem value="Study">Study</MenuItem>{" "}
                {/* 중복된 Music 대신 Study로 변경 */}
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
                    display: "flex",

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
    </>
  );
}

export default Uploadpage;
