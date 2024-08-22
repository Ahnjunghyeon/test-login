import React, { useState, useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  getFirestore,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  IconButton,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CustomNavbar from "../components/Header";
import Footer from "../components/Footer";
import UploadPost from "../components/UploadPost";
import NotificationsPage from "../pages/NotificationsPage";

const Profile = () => {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileImage, setProfileImage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [profilePosts, setProfilePosts] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  const currentUser = auth.currentUser;
  const { uid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileUser(userData);
          setDisplayName(userData.displayName || "");
          setProfileImage(userData.profileImage || "");
          setUserEmail(userData.email || "");
        } else {
          console.log("No such user!");
        }

        if (currentUser && currentUser.uid !== uid) {
          const followDoc = await getDoc(
            doc(db, `users/${currentUser.uid}/follow`, uid)
          );
          setIsFollowing(followDoc.exists());
        }

        if (uid) {
          const userPosts = await fetchUserPosts(uid);
          setProfilePosts(userPosts);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [uid, db, currentUser]);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "");
      setProfileImage(currentUser.photoURL || "");
      setUserEmail(currentUser.email || "");
    }
  }, [currentUser]);

  const fetchUserPosts = async (uid) => {
    try {
      const userPostsRef = collection(db, `users/${uid}/posts`);
      const querySnapshot = await getDocs(userPostsRef);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching user posts:", error);
      return [];
    }
  };

  const handleFollow = async () => {
    if (currentUser) {
      const userFollowRef = doc(db, `users/${currentUser.uid}/follow`, uid);
      try {
        // 팔로우 추가
        await setDoc(userFollowRef, { uid });
        setIsFollowing(true);

        // 현재 시간을 Timestamp 객체로 생성
        const currentTime = Timestamp.now();

        if (currentUser.uid !== uid) {
          await addDoc(collection(db, `users/${uid}/notifications`), {
            type: "follow",
            timestamp: currentTime, // Timestamp 객체로 저장
            message: `${
              currentUser.displayName || "사용자"
            }님이 당신을 팔로우했습니다.`,
            read: false,
          });
        }
      } catch (error) {
        console.error("Error following user:", error);
      }
    }
  };

  const handleUnfollow = async () => {
    if (currentUser) {
      const userFollowRef = doc(db, `users/${currentUser.uid}/follow`, uid);
      try {
        await deleteDoc(userFollowRef);
        setIsFollowing(false);
      } catch (error) {
        console.error("Error unfollowing user:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(currentUser, { displayName });
      await setDoc(
        doc(db, "users", currentUser.uid),
        { displayName },
        { merge: true }
      );
      alert("프로필이 성공적으로 업데이트되었습니다.");
    } catch (error) {
      alert("프로필 업데이트 실패: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    if (event.target.files[0]) {
      setUploadingImage(true);
      const file = event.target.files[0];
      const storageRef = ref(
        storage,
        `users/${uid}/profileImages/${file.name}`
      );
      try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        await setDoc(
          doc(db, "users", uid),
          { profileImage: downloadURL },
          { merge: true }
        );
        setProfileImage(downloadURL);
        alert("프로필 이미지가 성공적으로 업데이트되었습니다.");
      } catch (error) {
        alert("프로필 이미지를 업데이트하는 중에 오류가 발생했습니다.");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/posts/${uid}/${postId}`);
  };

  return (
    <>
      <CustomNavbar />
      <Container className="profiepage">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 2,
          }}
        >
          {profileUser && (
            <>
              <Box sx={{ position: "relative", mb: 2 }}>
                <Avatar
                  src={profileImage || "/default-avatar.png"}
                  alt={displayName}
                  sx={{ width: 100, height: 100 }}
                />
                {currentUser && currentUser.uid === uid && (
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      top: "70%",
                      left: "70%",
                      backgroundColor: "white",
                      color: "purple",
                    }}
                  >
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <PhotoCamera />
                  </IconButton>
                )}
              </Box>

              {currentUser && currentUser.uid === uid ? (
                <form onSubmit={handleSubmit}>
                  <TextField
                    label="Display Name"
                    variant="outlined"
                    fullWidth
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ color: "purple", backgroundColor: "white" }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Update"}
                  </Button>
                </form>
              ) : (
                <Box>
                  <Typography variant="h5">{displayName}</Typography>
                  <Typography variant="body1">User UID: {uid}</Typography>
                  <Typography variant="body1">이메일: {userEmail}</Typography>
                </Box>
              )}

              {currentUser && currentUser.uid !== uid && (
                <Button
                  variant="contained"
                  color={isFollowing ? "secondary" : "primary"}
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                >
                  {isFollowing ? "언팔로우" : "팔로우"}
                </Button>
              )}
            </>
          )}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4">게시물</Typography>
            <div className="posts-container">
              {profilePosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post.id)}
                  style={{ cursor: "pointer", marginBottom: "16px" }}
                >
                  <Card>
                    <CardContent>
                      <Typography variant="body2">{post.category}</Typography>
                      {post.imageUrls && post.imageUrls.length > 0 && (
                        <UploadPost imageUrls={post.imageUrls} />
                      )}
                      <Typography variant="body2">{post.content}</Typography>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </Box>
        </Box>
        <NotificationsPage uid={uid} />
      </Container>
      <Footer />
    </>
  );
};

export default Profile;
