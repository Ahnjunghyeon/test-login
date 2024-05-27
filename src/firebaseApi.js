// firebaseApi.js
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage, db } from "./firebase";

// 사용자의 게시물을 가져오는 함수
const fetchUserPosts = async (uid) => {
  try {
    const querySnapshot = await getDocs(collection(db, `users/${uid}/posts`));
    const userPosts = [];
    querySnapshot.forEach((doc) => {
      userPosts.push({ id: doc.id, ...doc.data() });
    });
    return userPosts;
  } catch (error) {
    console.error("Error fetching user posts: ", error);
    return [];
  }
};

// 게시물을 삭제하는 함수
const deletePost = async (uid, postId, imageUrls) => {
  if (imageUrls && imageUrls.length > 0) {
    for (const imageUrl of imageUrls) {
      const imageRef = ref(storage, imageUrl);
      try {
        await getDownloadURL(imageRef);
        await deleteObject(imageRef);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
  }
  await deleteDoc(doc(db, `users/${uid}/posts`, postId));
};

// 게시물을 업데이트하는 함수
const updatePost = async (uid, postId, newData) => {
  await updateDoc(doc(db, `users/${uid}/posts`, postId), newData);
};

// 이미지 업로드 함수
const uploadImages = async (images, folderName) => {
  const uploadPromises = images.map((image) => {
    const folderRef = ref(storage, folderName);
    const storageRef = ref(folderRef, image.name);
    const uploadTask = uploadBytesResumable(storageRef, image);
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Error uploading image:", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  });
  return await Promise.all(uploadPromises);
};

export { fetchUserPosts, deletePost, updatePost, uploadImages };
