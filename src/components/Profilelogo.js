import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import Avatar from "@mui/material/Avatar";
import { db } from "../Firebase/firebase"; // firebase 설정 파일을 import

const Profilelogo = ({ uid, refresh }) => {
  const [photoURL, setPhotoURL] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPhotoURL(userData.profileImage); // Set photoURL to profileImage field
        } else {
          console.log("No such user!");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [uid, refresh]);

  return (
    <Avatar
      src={photoURL}
      alt="Profile"
      sx={{ width: 40, height: 40, borderRadius: "50%" }}
    />
  );
};

export default Profilelogo;
