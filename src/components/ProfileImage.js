import React, { useState, useEffect } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { Avatar } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const ProfileImage = ({ uid }) => {
  const [photoURL, setPhotoURL] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPhotoURL(userData.profileImage || null); // 기본 이미지로 null 설정
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

  return (
    <div>
      <div style={{ cursor: "pointer" }}>
        <Avatar
          src={photoURL || ""}
          alt="Profile"
          sx={{
            width: 90,
            height: 90,
            backgroundColor: photoURL ? "transparent" : "#e0e0e0",
          }}
        >
          {!photoURL && (
            <AccountCircleIcon
              sx={{
                color: "#858585",
                fontSize: 60, // Avatar의 크기에 비례하여 조정
              }}
            />
          )}
        </Avatar>
      </div>
    </div>
  );
};

export default ProfileImage;
