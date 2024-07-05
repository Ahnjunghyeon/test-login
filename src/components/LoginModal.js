import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import "./LoginModal.css";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const LoginModal = ({ isOpen, onClose, onSignupOpen }) => {
  const auth = getAuth();

  const handleLogin = (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // 로그인 성공
        const user = userCredential.user;
        console.log("Logged in as:", user.email);
        onClose();
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
        // Google 로그인 성공
        const user = result.user;
        console.log("Logged in with Google as:", user.email);
        onClose();
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
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          className="typography"
        >
          로그인
        </Typography>
        <form onSubmit={handleLogin}>
          <input type="email" name="email" placeholder="Email" required />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <Button type="submit" fullWidth className="default btn-jelly">
            Login
          </Button>
        </form>
        <Button
          fullWidth
          onClick={handleGoogleLogin}
          className="google btn-jelly"
        >
          Login with Google
        </Button>
        <Button fullWidth onClick={onSignupOpen} className="signup btn-jelly">
          회원가입
        </Button>
      </Box>
    </Modal>
  );
};

export default LoginModal;
