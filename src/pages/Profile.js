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
import "./Profile.css";

const Profile = () => {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [refreshProfileImage, setRefreshProfileImage] = useState(false);
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
          console.log("Fetched User Data:", userData); // 로깅 추가
          setProfileUser(userData);
          setDisplayName(userData.displayName || ""); // 기본값 설정
          setProfileImage(userData.profileImage || ""); // 기본값 설정
          setUserEmail(userData.email || ""); // 기본값 설정
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
        console.error("Error fetching user profile: ", error);
      }
    };

    fetchUserProfile();
  }, [uid, db, refreshProfileImage, currentUser]);

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
      const userPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return userPosts;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      return [];
    }
  };

  const handleFollow = async () => {
    if (currentUser) {
      const userFollowRef = doc(db, `users/${currentUser.uid}/follow`, uid);
      try {
        await setDoc(userFollowRef, { uid });
        setIsFollowing(true);
      } catch (error) {
        console.error("Error following user: ", error);
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
        console.error("Error unfollowing user: ", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    updateProfile(currentUser, { displayName })
      .then(() => {
        alert("Profile updated successfully");
        const userRef = doc(db, "users", currentUser.uid);
        setDoc(userRef, { displayName }, { merge: true })
          .then(() => {
            console.log("DisplayName updated successfully in Firestore");
          })
          .catch((error) => {
            console.error("Error updating displayName in Firestore: ", error);
          });
      })
      .catch((error) => {
        alert("Failed to update profile: " + error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleImageUpload = async (event) => {
    if (event.target.files[0]) {
      setUploadingImage(true);
      const file = event.target.files[0];
      const storageRef = ref(storage, `users/${uid}/profileImages`);
      try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        await setDoc(
          doc(db, "users", uid),
          { profileImage: downloadURL },
          { merge: true }
        );
        setProfileImage(downloadURL);
        setRefreshProfileImage(!refreshProfileImage);
        alert("프로필 이미지가 성공적으로 업데이트되었습니다.");
      } catch (error) {
        console.error("Error uploading profile image: ", error);
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
      <CustomNavbar refreshProfileImage={refreshProfileImage} />
      <Container className="Profile">
        <Box className="ProfileContainer">
          <Box className="ProfileBox">
            <Box className="LeftSide">
              {profileUser && (
                <>
                  <Box className="ProfileImageContainer">
                    <Avatar
                      src={profileImage || "/default-avatar.png"}
                      alt={displayName}
                      sx={{ width: 100, height: 100 }}
                    />
                    {currentUser && currentUser.uid === uid && (
                      <IconButton
                        style={{
                          top: "-25px",
                          left: "30px",
                          backgroundColor: "white",
                          color: "purple",
                        }}
                        color="primary"
                        aria-label="upload picture"
                        component="label"
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
                    <form className="Namefield" onSubmit={handleSubmit}>
                      <TextField
                        label="Display Name"
                        variant="outlined"
                        fullWidth
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        sx={{ marginBottom: 2 }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        style={{
                          color: "purple",
                          backgroundColor: "white",
                        }}
                      >
                        {loading ? <CircularProgress size={24} /> : "Update"}
                      </Button>
                    </form>
                  ) : (
                    <Box className="UserInfo">
                      <Typography variant="h5">{displayName}</Typography>
                      <Typography variant="body1">User UID: {uid}</Typography>
                      <Typography variant="body1">
                        이메일: {userEmail}
                      </Typography>
                    </Box>
                  )}

                  {currentUser && currentUser.uid !== uid && (
                    <>
                      {isFollowing ? (
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleUnfollow}
                        >
                          언팔로우
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleFollow}
                        >
                          팔로우
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
            </Box>

            <Box className="Userpost">
              <Typography variant="h4">게시물</Typography>
              <div className="posts-container">
                {profilePosts.map((post) => (
                  <div
                    className="post-card"
                    key={post.id}
                    onClick={() => handlePostClick(post.id)}
                  >
                    <Card className="post-card-content">
                      <CardContent>
                        <Typography variant="body2" className="post-category">
                          {post.category}
                        </Typography>
                        {post.imageUrls && post.imageUrls.length > 0 && (
                          <UploadPost imageUrls={post.imageUrls} />
                        )}
                        <Typography variant="body2" className="post-content">
                          {post.content}
                        </Typography>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </Box>
          </Box>
        </Box>
      </Container>

      <Footer />
    </>
  );
};

export default Profile;
