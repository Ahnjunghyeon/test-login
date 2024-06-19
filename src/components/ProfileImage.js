import React, { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { Avatar } from "@mui/material";
import Modal from "@mui/material/Modal";

const ProfileImage = ({ uid }) => {
  const [photoURL, setPhotoURL] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const storage = getStorage();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fallback to checking Firestore for the profile image based on uid
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
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (uid) {
      fetchUserProfile();
    }
  }, [uid, db]);

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <div>
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
