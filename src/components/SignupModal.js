import React, { useState } from "react";
import { Modal, TextField, Backdrop, Box } from "@mui/material";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../Firebase/firebase"; // firebase.js에서 export된 db import
import "./SignupModal.css";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: 400,
  height: "700px",
  bgcolor: "background.paper",
  boxShadow:
    "0px 8px 16px rgba(0, 0, 0, 0.3), 0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
  borderRadius: 10,
  p: 4,
  fontfamily: "BMJUA",
  color: "#626284",
};

const SignupModal = ({ isOpen, onClose, onSwitch }) => {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSignup = async () => {
    if (email === "" || password === "" || displayName === "") {
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName });

      // Firestore에 사용자 정보 저장
      await setDoc(doc(db, "users", user.uid), {
        displayName: displayName,
        email: email,
        uid: user.uid,
      });

      console.log("Signed up as:", user.email);
      onClose();
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (error) {
      console.error("Error signing up: ", error);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore에 사용자 정보 저장
      await setDoc(doc(db, "users", user.uid), {
        displayName: user.displayName,
        email: user.email,
        uid: user.uid,
        profileImage: user.photoURL, // 프로필 이미지 추가 저장
      });

      console.log("Logged in with Google as:", user.email);
      onClose();
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (error) {
      console.error("Google login error:", error.code, error.message);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Box sx={style}>
        <div className="Signpage">
          <div className="assignlogo">SNSWEB 회원가입</div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
          }}
        >
          <div className="label">
            <div className="text-wrapper">이름</div>
          </div>
          <TextField
            style={{ marginBottom: "10px" }}
            label="이름을 입력해주세요."
            variant="outlined"
            fullWidth
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-field-Name"
          />
          <div className="label">
            <div className="text-wrapper">이메일</div>
          </div>
          <TextField
            style={{ marginBottom: "10px" }}
            label="이메일을 입력해주세요."
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field-Email"
          />
          <div className="label">
            <div className="text-wrapper">비밀번호</div>
          </div>
          <TextField
            label="비밀번호를 입력해주세요"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field-Password"
          />

          <div className="button-container-3">
            <button type="submit">회원가입</button>
          </div>
          <div className="lines">
            <div className="line" />
            <div className="linetext"> OR </div>
            <div className="line2" />
          </div>
          <div className="button-container-4">
            <button type="button" onClick={handleGoogleLogin}>
              구글 계정으로 회원가입
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default SignupModal;
