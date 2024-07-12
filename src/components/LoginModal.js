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
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import "./LoginModal.css";
import { Margin } from "@mui/icons-material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw", // 뷰포트 너비의 90%
  maxWidth: 400, // 최대 너비 400px
  height: "400px",
  maxheight: "400px",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const LoginModal = ({ isOpen, onClose }) => {
  const auth = getAuth();
  const db = getFirestore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorTooltip, setErrorTooltip] = useState(false);

  useEffect(() => {
    setIsSignUp(false);
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
    // Implement your password reset logic here
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
              className="input-field-"
            />
            Password
            <div className="button-group">
              <Button type="submit" className="btn-6">
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

export default LoginModal;
