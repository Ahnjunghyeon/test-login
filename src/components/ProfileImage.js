import React, { useState, useEffect, useCallback } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { Avatar } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const ProfileImage = ({ uid }) => {
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = getFirestore();

  const fetchUserProfile = useCallback(async () => {
    if (!uid) return;

    setLoading(true);
    setError(null);

    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setPhotoURL(userData.profileImage || null);
      } else {
        console.log("No such user!");
        setPhotoURL(null); // 사용자 데이터가 없을 때 null로 설정
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError(error.message); // 오류 메시지를 상태로 저장
    } finally {
      setLoading(false);
    }
  }, [uid, db]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (loading)
    return (
      <Avatar sx={{ width: 40, height: 40, backgroundColor: "#e0e0e0" }} />
    );

  if (error) return <div>Error loading profile image</div>;

  return (
    <div>
      <div style={{ cursor: "pointer" }}>
        <Avatar
          src={photoURL || ""}
          alt="Profile"
          sx={{
            width: 40,
            height: 40,
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
