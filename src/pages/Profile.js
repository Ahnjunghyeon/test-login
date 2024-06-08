import React, { useState, useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  getFirestore,
} from "firebase/firestore";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap"; // Card import 추가
import "./Profile.css";
import CustomNavbar from "../components/Header";
import { useParams } from "react-router-dom";
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
  const [profilePosts, setProfilePosts] = useState([]); // 사용자가 작성한 글을 저장할 상태 추가
  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;
  const { uid } = useParams();

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

        // 팔로우 상태 확인
        if (currentUser && currentUser.uid !== uid) {
          const followDoc = await getDoc(
            doc(db, `users/${currentUser.uid}/follow`, uid)
          );
          if (followDoc.exists()) {
            setIsFollowing(true);
          }
        }

        // 사용자가 작성한 글을 가져오는 부분
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

    updateProfile(currentUser, {
      displayName,
    })
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

  return (
    <>
      <CustomNavbar refreshProfileImage={refreshProfileImage} />
      <div className="Profile">
        <div className="P-main">
          <Container className="mt-4">
            <Row className="justify-content-center">
              <Col md={6} className="text-center">
                {profileUser && (
                  <>
                    <ProfileImage
                      uid={uid}
                      displayName={displayName}
                      refresh={refreshProfileImage}
                    />
                    <h3 className="usname">{displayName}</h3>
                    {userEmail && <p>식별자 (이메일): {userEmail}</p>}
                    <p>사용자 UID: {uid}</p>
                    {currentUser &&
                      currentUser.uid !== uid &&
                      (isFollowing ? (
                        <Button variant="secondary" onClick={handleUnfollow}>
                          Unfollow
                        </Button>
                      ) : (
                        <Button variant="primary" onClick={handleFollow}>
                          Follow
                        </Button>
                      ))}
                    {currentUser && currentUser.uid === uid && (
                      <UploadImage uid={uid} onUpload={handleImageUpload} />
                    )}
                  </>
                )}
              </Col>
              <Col md={6}>
                {currentUser && currentUser.uid === uid && (
                  <Form onSubmit={handleSubmit} style={{ height: "206.59px" }}>
                    <Form.Group controlId="formDisplayName">
                      <Form.Label> Your Name </Form.Label>
                      <Form.Control
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={loading}
                      />
                    </Form.Group>
                    <Button
                      variant="primary"
                      type="submit"
                      className="mt-3"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save"}{" "}
                    </Button>
                  </Form>
                )}
              </Col>
            </Row>
          </Container>

          {/* 사용자가 작성한 글을 보여주는 부분 */}
          <Container className="mt-4">
            <Row className="justify-content-center">
              <Col md={12}>
                <h3 className="mt-4">User's Posts</h3>
                <Row xs={1} md={2} lg={3} className="g-4">
                  {profilePosts.map((post) => (
                    <Col key={post.id}>
                      <Card>
                        <Card.Body>
                          <Card.Title>{post.title}</Card.Title>
                          <Card.Text>{post.content}</Card.Text>
                          <Card.Text>Category: {post.category}</Card.Text>
                          {/* 이미지를 표시하는 부분 */}
                          {post.imageUrls &&
                            post.imageUrls.map((imageUrl, index) => (
                              <img
                                key={index}
                                src={imageUrl}
                                alt={`Image ${index}`}
                                style={{ maxWidth: "100%", maxHeight: "200px" }}
                              />
                            ))}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
};

export default Profile;
