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
  CardMedia,
  Grid,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import CustomNavbar from "../components/Header";
import ProfileImage from "../components/Profilelogo";
import UploadImage from "../components/UploadImage";

const Profile = () => {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [refreshProfileImage, setRefreshProfileImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [profilePosts, setProfilePosts] = useState([]);
  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;
  const { uid } = useParams();
  const navigate = useNavigate(); // useNavigate 훅 가져오기

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          setProfileUser(userDoc.data());
          setDisplayName(userDoc.data().displayName);
          setProfileImageUrl(userDoc.data().profileImageUrl);
          if (currentUser && currentUser.uid === uid) {
            setUserEmail(currentUser.email);
          }
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

  const handleImageUpload = () => {
    setRefreshProfileImage(!refreshProfileImage);
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`); // PostList 컴포넌트로 이동하도록 수정
  };

  return (
    <>
      <CustomNavbar refreshProfileImage={refreshProfileImage} />
      <Container className="Profile">
        <Box className="P-main" mt={4}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item md={6} textAlign="center">
              {profileUser && (
                <>
                  <ProfileImage
                    uid={uid}
                    displayName={displayName}
                    refresh={refreshProfileImage}
                  />
                  <Typography variant="h5" className="usname">
                    {displayName}
                  </Typography>
                  {userEmail && (
                    <Typography variant="body1">Email: {userEmail}</Typography>
                  )}
                  <Typography variant="body1">User UID: {uid}</Typography>
                  {currentUser &&
                    currentUser.uid !== uid &&
                    (isFollowing ? (
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
                    ))}
                  {currentUser && currentUser.uid === uid && (
                    <UploadImage uid={uid} onUpload={handleImageUpload} />
                  )}
                </>
              )}
            </Grid>
            <Grid item md={6}>
              {currentUser && currentUser.uid === uid && (
                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    variant="outlined"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Save"}
                  </Button>
                </form>
              )}
            </Grid>
          </Grid>
          <Box mt={4}>
            <Typography variant="h4">User's Posts</Typography>
            <Grid container spacing={4}>
              {profilePosts.map((post) => (
                <Grid item xs={12} sm={6} md={4} key={post.id}>
                  <Card
                    style={{ cursor: "pointer" }}
                    onClick={() => handlePostClick(post.id)}
                  >
                    <CardContent>
                      <Typography variant="h5">{post.title}</Typography>
                      <Typography variant="body2">{post.category}</Typography>
                      {post.imageUrls &&
                        post.imageUrls.map((imageUrl, index) => (
                          <CardMedia
                            component="img"
                            key={index}
                            image={imageUrl}
                            alt={`Image ${index}`}
                            sx={{ maxWidth: "100%", maxHeight: "200px" }}
                          />
                        ))}
                      <Typography variant="body2">{post.content}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Profile;
