// Profile.js

import React, { useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { Form, Button, Container, Image } from "react-bootstrap";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Profile = () => {
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoURL(reader.result);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 프로필 업데이트
    updateProfile(user, {
      displayName,
      photoURL: imageFile ? URL.createObjectURL(imageFile) : user.photoURL,
    })
      .then(() => {
        alert("프로필이 업데이트되었습니다.");
      })
      .catch((error) => {
        alert("프로필 업데이트에 실패했습니다: " + error.message);
      });
  };

  const uploadImage = async () => {
    if (imageFile) {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        "user-profiles/" + user.uid + "/profile.jpg"
      );

      try {
        await uploadBytes(storageRef, imageFile);
        const downloadURL = await getDownloadURL(storageRef);
        console.log("이미지가 성공적으로 업로드되었습니다.", downloadURL);
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
      }
    }
  };

  return (
    <Container className="mt-5">
      <h2>프로필 수정</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formDisplayName">
          <Form.Label>이름</Form.Label>
          <Form.Control
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formPhotoURL" className="mt-3">
          <Form.Label>프로필 사진</Form.Label>
          <br />
          {photoURL && (
            <Image src={photoURL} rounded className="mb-3" width={200} />
          )}
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          저장
        </Button>
      </Form>
    </Container>
  );
};

export default Profile;
