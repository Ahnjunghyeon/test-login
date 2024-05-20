import React, { useState, useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Form, Button, Container, Image } from "react-bootstrap";
import CustomNavbar from "./components/CustomNavbar"; // Import the CustomNavbar component

const Profile = () => {
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [user]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let downloadURL = photoURL;

    if (imageFile) {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        "user-profiles/" + user.uid + "/profile.jpg"
      );

      try {
        await uploadBytes(storageRef, imageFile);
        downloadURL = await getDownloadURL(storageRef);
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    }

    updateProfile(user, {
      displayName,
      photoURL: downloadURL,
    })
      .then(() => {
        alert("Profile updated successfully");
      })
      .catch((error) => {
        alert("Failed to update profile: " + error.message);
      });
  };

  return (
    <>
      <CustomNavbar /> {/* Navbar 컴포넌트를 렌더링합니다. */}
      <Container className="mt-5">
        <h2>Edit Profile</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formDisplayName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formPhotoURL" className="mt-3">
            <Form.Label>Profile Photo</Form.Label>
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
            Save
          </Button>
        </Form>
      </Container>
    </>
  );
};

export default Profile;
