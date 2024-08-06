import React, { useState } from "react";
import { Button, Modal, TextField, Backdrop, Box } from "@mui/material";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import "./LsModal.css";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: 400,
  height: "600px",
  bgcolor: "background.paper",
  boxShadow:
    "0px 8px 16px rgba(0, 0, 0, 0.3), 0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
  borderRadius: 10,
  p: 4,
  fontfamily: "BMJUA",
  color: "#626284",
  borderline: "none",
};

const LoginModal = ({ isOpen, onClose, onSwitch }) => {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Logged in as:", user.email);
        onClose();
        setEmail("");
        setPassword("");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Login error:", errorCode, errorMessage);
      });
  };

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log("Logged in with Google as:", user.email);
        onClose();
        setEmail("");
        setPassword("");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Google login error:", errorCode, errorMessage);
      });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Box sx={style}>
        <div className="Loginpage">
          <div className="assignlogo">SNSWEB 로그인</div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="label">
            <div className="text-wrapper">이름</div>
          </div>
          <TextField
            style={{ marginBottom: "10px" }}
            type="email"
            name="email"
            label="이메일을 입력해주세요."
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field-Email"
          />
          비밀번호
          <TextField
            type="password"
            name="password"
            label="비밀번호를 입력해주세요."
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field-Password"
          />
          <div className="button-container-3">
            <button type="submit">로그인</button>
          </div>
          <div className="lines">
            <div className="line" />
            <div className="linetext"> OR </div>
            <div className="line2" />
          </div>
          <div className="button-container-4">
            <button type="button" onClick={handleGoogleLogin}>
              구글 계정으로 로그인
            </button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default LoginModal;
