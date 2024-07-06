import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  TextField,
  Typography,
  Backdrop,
  Box,
} from "@mui/material";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
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

const SignupModal = ({ isOpen, onClose }) => {
  const auth = getAuth();
  const db = getFirestore();
  const [isSignUp, setIsSignUp] = useState(true); // 기본값을 true로 설정하여 Sign Up 모드로 시작
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorTooltip, setErrorTooltip] = useState(false);

  // isOpen prop이 변경될 때 isSignUp 상태 초기화
  useEffect(() => {
    setIsSignUp(true); // 기본값을 true로 설정하여 Sign Up 모드로 초기화
    setEmail("");
    setPassword("");
    setDisplayName("");
  }, [isOpen]);

  const handleLogin = (event) => {
    event.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Logged in as:", user.email);
        onClose();
        // 로그인 성공 후 초기화
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
        // Google 로그인 성공 후 초기화
        setEmail("");
        setPassword("");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Google login error:", errorCode, errorMessage);
      });
  };

  const handleSignup = async () => {
    if (email === "" || password === "" || displayName === "") {
      setErrorTooltip(true);
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
      await setDoc(doc(db, "users", user.uid), {
        displayName,
        email,
        profileImage: "",
      });
      console.log("Signed up as:", user.email);
      onClose();
      // 회원가입 성공 후 초기화
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (error) {
      console.error("Error signing up: ", error);
    }
  };

  const handleCheckboxChange = (event) => {
    setIsSignUp(event.target.checked);
    // 회원가입 모드로 변경 시 입력 필드 초기화
    if (!event.target.checked) {
      setEmail("");
      setPassword("");
      setDisplayName("");
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Box sx={style}>
        <div className="text-center">
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            className="typography"
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </Typography>
          <input
            className="checkbox"
            type="checkbox"
            id="reg-log"
            name="reg-log"
            onChange={handleCheckboxChange}
            checked={isSignUp} // 체크박스 체크 상태를 isSignUp 상태와 동기화
          />
          <label htmlFor="reg-log"></label>
        </div>

        {isSignUp ? (
          <>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
            />
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
            <div className="button-group">
              <Button onClick={handleSignup} className="default btn-6">
                Sign Up
              </Button>
              <Button onClick={handleGoogleLogin} className="google btn-6">
                Sign Up with Google
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleLogin}>
            <TextField
              type="email"
              name="email"
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
            <TextField
              type="password"
              name="password"
              label="Password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
            <div className="button-group">
              <Button type="submit" className="default btn-6">
                Login
              </Button>
              <Button onClick={handleGoogleLogin} className="google btn-6">
                Login with Google
              </Button>
            </div>
          </form>
        )}
      </Box>
    </Modal>
  );
};

export default SignupModal;
