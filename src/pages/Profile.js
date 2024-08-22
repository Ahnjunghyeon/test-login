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
      setLoading(true); // 데이터 로딩 시작
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
      } finally {
        setLoading(false); // 데이터 로딩 종료
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
        await setDoc(userFollowRef, { uid });
        setIsFollowing(true);

        const currentTime = Timestamp.now();

        if (currentUser.uid !== uid) {
          await addDoc(collection(db, `users/${uid}/notifications`), {
            type: "follow",
            timestamp: currentTime,
            message: `${currentUser.displayName || "User"} followed you.`,
            read: false,
          });
        }
      } catch (error) {
        console.error("Error following user:", error);
        alert("Failed to follow user. Please try again later.");
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
        alert("Failed to unfollow user. Please try again later.");
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
      alert("Profile updated successfully.");
    } catch (error) {
      alert("Failed to update profile: " + error.message);
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
        alert("Profile image updated successfully.");
      } catch (error) {
        alert("Failed to update profile image.");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/home/`);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <CustomNavbar />
      <Container className="profile-page">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 3fr",
            gap: 2,
            p: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 2,
              borderRight: "1px solid #ddd",
            }}
          >
            {profileUser && (
              <>
                <Box sx={{ position: "relative", mb: 2 }}>
                  <Avatar
                    src={profileImage || "/default-avatar.png"}
                    alt={displayName}
                    sx={{ width: 120, height: 120 }}
                  />
                  {currentUser && currentUser.uid === uid && (
                    <IconButton
                      component="label"
                      sx={{
                        position: "absolute",
                        top: "75%",
                        left: "75%",
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
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {displayName}
                    </Typography>
                    <Typography variant="body1">User UID: {uid}</Typography>
                    <Typography variant="body1">Email: {userEmail}</Typography>
                    {currentUser && currentUser.uid !== uid && (
                      <Button
                        variant="contained"
                        color={isFollowing ? "secondary" : "primary"}
                        onClick={isFollowing ? handleUnfollow : handleFollow}
                        sx={{ mt: 2 }}
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </Button>
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>

          <Box sx={{ p: 2 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Posts
            </Typography>
            <div className="posts-container">
              {profilePosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post.id)}
                  style={{ cursor: "pointer", marginBottom: "16px" }}
                >
                  <Card
                    sx={{
                      maxWidth: 345,
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="body2"
                        sx={{ marginBottom: "8px", fontWeight: "bold" }}
                      >
                        {post.category}
                      </Typography>
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
      </Container>
      <Footer />
    </>
  );
};

export default Profile;
