import React, { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { Button, Form } from "react-bootstrap";

const UploadImage = ({ uid, onUpload }) => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const storage = getStorage();
  const db = getFirestore();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (image) {
      setUploading(true);
      const storageRef = ref(storage, `users/${uid}/profileImage`);
      try {
        await uploadBytes(storageRef, image);
        const downloadURL = await getDownloadURL(storageRef);
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, { profileImage: downloadURL }, { merge: true });
        onUpload(); // 이미지 업로드 후 콜백 함수 호출
      } catch (error) {
        console.error("Error uploading image: ", error);
      } finally {
        setUploading(false);
      }
    } else {
      alert("Please select an image to upload.");
    }
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
    </div>
  );
};

export default UploadImage;
