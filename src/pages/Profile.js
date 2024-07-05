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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import CustomNavbar from "../components/Header";
import ProfileImage from "../components/ProfileImage";
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
  const auth = getAuth();
  const db = getFirestore();
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
          setDisplayName(userData.displayName);
          setProfileImage(userData.profileImage);
          setUserEmail(userData.email); // Set the email from user data
        } else {
          console.log("No such user!");
        }

        if (currentUser && currentUser.uid !== uid) {
          const followDoc = await getDoc(
            doc(db, `users/${currentUser.uid}/follow`, uid)
          );
          if (followDoc.exists()) {
            setIsFollowing(true);
          }
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
    }
  }, [currentUser]);

  const fetchUserPosts = async (uid) => {
    try {
      const userPostsRef = collection(db, `users/${uid}/posts`);
      const querySnapshot = await getDocs(userPostsRef);
      const userPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id, // 게시물 ID를 추가
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

  const handleImageUpload = () => {
    setRefreshProfileImage(!refreshProfileImage);
  };

  const handlePostClick = (postId) => {
    navigate(`/posts/${uid}/${postId}`); // 해당 게시물의 URL로 이동
  };

  return (
    <>
      <CustomNavbar refreshProfileImage={refreshProfileImage} />
      <Container className="Profile">
        <Box className="ProfileContainer">
          <Box className="ProfileBox">
            {/* Left side - User Info */}
            <Box className="LeftSide">
              {profileUser && (
                <>
                  {profileImage && (
                    <Avatar
                      src={profileImage}
                      alt="Profile"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        width: "90px",
                        height: "90px",
                      }}
                    />
                  )}

                  {currentUser && currentUser.uid === uid ? (
                    <form className="Namefield" onSubmit={handleSubmit}>
                      <TextField
                        className="yourname"
                        fullWidth
                        label="Your Name"
                        variant="outlined"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={loading}
                      />

                      <Button
                        className="savebt"
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{ mt: 2 }}
                      >
                        {loading ? <CircularProgress size={24} /> : "Save"}
                      </Button>
                    </form>
                  ) : (
                    <Box className="UserInfo">
                      <Typography variant="h5">{displayName}</Typography>
                      <Typography variant="body1">User UID: {uid}</Typography>
                    </Box>
                  )}
                  <Typography variant="body1">Email: {userEmail}</Typography>

                  {currentUser && currentUser.uid !== uid && (
                    <>
                      {isFollowing ? (
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleUnfollow}
                        >
                          Unfollow
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleFollow}
                        >
                          Follow
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
            </Box>

            {/* Right side - User's Posts */}
            <Box className="Userpost">
              <Typography variant="h4">User's Posts</Typography>
              <div className="posts-container">
                {profilePosts.map((post) => (
                  <div
                    className="post-card"
                    key={post.id}
                    onClick={() => handlePostClick(post.id)} // 게시물 클릭 시 이벤트 핸들러 추가
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
