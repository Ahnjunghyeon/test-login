import React, { useState, useEffect } from "react";
import { Button, Modal, TextField, Backdrop, Box } from "@mui/material";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import "./SignupModal.css";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: 400,
  height: "450px",
  maxHeight: "450px",
  bgcolor: "background.paper",
  boxShadow:
    "0px 8px 16px rgba(0, 0, 0, 0.3), 0px 0px 0px 1px rgba(0, 0, 0, 0.1)", // 그림자 추가
  borderRadius: 10, // 테두리를 둥글게 만듦
  p: 4,
};

const SignupModal = ({ isOpen, onClose }) => {
  const auth = getAuth();
  const db = getFirestore();
  const [isSignUp, setIsSignUp] = useState(true); // 초기값을 true로 설정하여 항상 Sign Up 창 먼저 보이기
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorTooltip, setErrorTooltip] = useState(false);

  useEffect(() => {
    setIsSignUp(true); // Modal이 열릴 때마다 Sign Up 창으로 시작하도록 설정
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
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (error) {
      console.error("Error signing up: ", error);
    }
  };

  const handleCheckboxChange = (event) => {
    setIsSignUp(event.target.checked);
    if (!event.target.checked) {
      setEmail("");
      setPassword("");
      setDisplayName("");
    }
  };

  const handleResetPassword = () => {
    console.log("Reset password clicked");
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
          <input
            className="checkbox"
            type="checkbox"
            id="reg-log"
            name="reg-log"
            onChange={handleCheckboxChange}
            checked={isSignUp} // 체크박스 상태를 isSignUp에 맞춰 변경
          />
          <label htmlFor="reg-log" className="checkbox-label">
            {isSignUp ? <AssignmentIndRoundedIcon /> : <LockOpenRoundedIcon />}
          </label>
          <div className="assignlogo">{isSignUp ? "Sign Up" : "Log In"}</div>
        </div>

        {isSignUp ? (
          <>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field-Name"
            />
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field-Email"
            />
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field-Password"
            />
            <div className="button-container-3">
              <span className="mas">Sign Up</span>
              <button onClick={handleSignup}>Sign Up</button>
            </div>
            <div className="button-container-3">
              <span className="mas">Sign Up with Google</span>
              <button onClick={handleGoogleLogin}>Sign Up with Google</button>
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
              className="input-field-Email"
            />
            <TextField
              type="password"
              name="password"
              label="Password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field-Password"
            />
            <div className="button-container-3">
              <span className="mas">Log In</span>
              <button type="submit">Log In</button>
            </div>
            <div className="button-container-3">
              <span className="mas">Log In with Google</span>
              <button onClick={handleGoogleLogin}>Log In with Google</button>
            </div>
            <div className="text-center">
              <Button
                variant="text"
                color="primary"
                onClick={handleResetPassword}
              >
                Forgot Password?
              </Button>
            </div>
          </form>
        )}
      </Box>
    </Modal>
  );
};

export default SignupModal;
