import React, { useState, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import getAuth from firebase/auth
import { Button } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { Form } from "react-bootstrap";
import Modal from "@mui/material/Modal";

const ProfileImage = ({ uid, onUpload }) => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoURL, setPhotoURL] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const storage = getStorage();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user && user.photoURL) {
          // If user is logged in and has a photoURL from Google, use it
          setPhotoURL(user.photoURL);
        } else {
          // Fallback to checking Firestore
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.profileImage) {
              setPhotoURL(userData.profileImage);
            } else {
              console.log("No profile image found for user:", uid);
            }
          } else {
            console.log("No such user!");
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (uid) {
      fetchUserProfile();
    }
  }, [uid, db]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (image) {
      setUploading(true);
      const storageRef = ref(storage, `users/${uid}/profile/profileImage`);
      try {
        await uploadBytes(storageRef, image);
        const downloadURL = await getDownloadURL(storageRef);
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, { profileImage: downloadURL }, { merge: true });
        setPhotoURL(downloadURL);
        onUpload();
      } catch (error) {
        console.error("Error uploading image: ", error);
      } finally {
        setUploading(false);
      }
    } else {
      alert("Please select an image to upload.");
    }
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <div>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Upload Profile Image</Form.Label>
        <Form.Control type="file" onChange={handleImageChange} />
      </Form.Group>
      <Button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </Button>
      {photoURL && (
        <div onClick={handleModalOpen} style={{ cursor: "pointer" }}>
          <Avatar src={photoURL} alt="Profile" sx={{ width: 40, height: 40 }} />
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            border: "none",
          }}
        >
          <Avatar
            src={photoURL}
            alt="Profile"
            sx={{ width: 200, height: 200 }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProfileImage;
