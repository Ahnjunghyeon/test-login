// UploadImage.js

import React, { useState } from "react";
import { storage } from "../Firebase/firebase"; // Firebase 설정 파일을 import
import { ref, uploadBytes } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore"; // Import doc and setDoc
import { db } from "../Firebase/firebase"; // Import db
import { Button } from "react-bootstrap";

const UploadImage = ({ uid }) => {
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (image) {
      const storageRef = ref(storage, `images/${uid}/${image.name}`);
      uploadBytes(storageRef, image).then((snapshot) => {
        console.log("Uploaded a blob or file!", snapshot);

        // 이미지를 업로드한 후 Firestore에 이미지 URL을 저장
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
          storageRef.bucket
        }/o/${encodeURIComponent(snapshot.metadata.fullPath)}?alt=media`;
        // 여기서는 예시로 users/uid 경로에 profileImage 필드에 이미지 URL을 저장하도록 함
        // 이 부분은 실제로 사용하는 데이터 구조에 맞게 수정해야 합니다.
        const userRef = doc(db, "users", uid);
        setDoc(userRef, { profileImage: imageUrl }, { merge: true })
          .then(() => {
            console.log("Profile image updated successfully in Firestore");
          })
          .catch((error) => {
            console.error("Error updating profile image in Firestore: ", error);
          });
      });
    }
  };

  return (
    <div>
      <input type="file" onChange={handleChange} />
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
};

export default UploadImage;
