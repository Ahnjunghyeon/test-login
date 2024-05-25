import React, { useState, useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { Form, Button, Container, Row, Col, Image } from "react-bootstrap";
import "./Profile.css";
import CustomNavbar from "./components/CustomNavbar"; // Import the CustomNavbar component

const Profile = () => {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const auth = getAuth();
  const db = getFirestore(); // Firestore 초기화
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 로딩 상태 시작
    setLoading(true);

    // Firebase에 중복된 닉네임이 있는지 확인
    const isNicknameAvailable = await checkNicknameAvailability(displayName);

    if (!isNicknameAvailable) {
      alert("The nickname is already taken. Please choose a different one.");
      setLoading(false); // 로딩 상태 종료
      return;
    }

    // 닉네임 변경
    updateProfile(user, {
      displayName,
    })
      .then(() => {
        alert("Profile updated successfully");
      })
      .catch((error) => {
        alert("Failed to update profile: " + error.message);
      })
      .finally(() => {
        setLoading(false); // 로딩 상태 종료
      });
  };

  // Firebase에 중복된 닉네임이 있는지 확인하는 함수
  const checkNicknameAvailability = async (displayName) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("displayName", "==", displayName));
    const querySnapshot = await getDocs(q);

    // 중복된 닉네임이 존재하면 false 반환
    return querySnapshot.empty;
  };

  return (
    <>
      <CustomNavbar /> {/* Navbar 컴포넌트를 렌더링합니다. */}
      <hr className="Line"></hr>
      <div className="Profile">
        <div className="P-main">
          <Container className="mt-4" style={{}}>
            <Row className="justify-content-center">
              <Col md={6} className="text-center">
                {user && (
                  <>
                    <Image
                      src={user.photoURL}
                      roundedCircle
                      width="100"
                      height="100"
                      alt="User profile"
                    />

                    <h3 className="usname">{user.displayName}</h3>
                  </>
                )}
              </Col>
              <Col md={6}>
                <Form
                  onSubmit={handleSubmit}
                  style={{
                    height: "206.59px",
                  }}
                >
                  <Form.Group controlId="formDisplayName">
                    <Form.Label> Your Name </Form.Label>
                    <Form.Control
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={loading} // 로딩 중에는 입력 비활성화
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
