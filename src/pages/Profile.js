import React, { useState, useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDoc,
  getDocs,
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import "./Profile.css";
import CustomNavbar from "../components/Header";
import { useParams } from "react-router-dom";
import ProfileImage from "../components/profileImage";
import UploadImage from "../components/UploadImage"; // UploadImage 컴포넌트를 import

const Profile = () => {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [refreshProfileImage, setRefreshProfileImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(""); // 프로필 이미지 URL 상태 추가
  const [userEmail, setUserEmail] = useState(""); // 사용자 이메일 상태 추가
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
          setProfileImageUrl(userDoc.data().profileImageUrl); // 프로필 이미지 URL 설정
          if (currentUser && currentUser.uid === uid) {
            setUserEmail(currentUser.email); // 현재 사용자와 프로필 소유자가 같은 경우에만 사용자 이메일 설정
          }
        } else {
          console.log("No such user!");
        }
      } catch (error) {
        console.error("Error fetching user profile: ", error);
      }
    };

    fetchUserProfile();
  }, [uid, db, refreshProfileImage, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isNicknameAvailable = await checkNicknameAvailability(displayName);

    if (!isNicknameAvailable) {
      alert("The nickname is already taken. Please choose a different one.");
      setLoading(false);
      return;
    }

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

  const checkNicknameAvailability = async (displayName) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("displayName", "==", displayName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
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
                    <ProfileImage uid={uid} refresh={refreshProfileImage} />
                    <h3 className="usname">{displayName}</h3>
                    {userEmail && <p>식별자 (이메일): {userEmail}</p>}
                    <p>사용자 UID: {uid}</p>
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

          <div className="service">gsadgs</div>
        </div>
      </div>
    </>
  );
};

export default Profile;
