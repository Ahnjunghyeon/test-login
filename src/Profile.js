import React, { useState, useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import { Form, Button, Container } from "react-bootstrap";
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
      <div>
        <CustomNavbar /> {/* Navbar 컴포넌트를 렌더링합니다. */}
      </div>
      <div className="App">
        <div className="A1">gsdgasd</div>
        <div className="Profile">
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formDisplayName">
              <Form.Label>Nickname</Form.Label>
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
              {/* 로딩 상태에 따른 버튼 텍스트 변경 */}
            </Button>
          </Form>{" "}
        </div>
      </div>
    </>
  );
};

export default Profile;
