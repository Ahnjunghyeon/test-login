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
import "./LoginModal.css";

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
  fontfamily: "BMJUA",
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
          <div className="assignlogo">{isSignUp ? "회원가입" : "로그인"}</div>
        </div>

        {isSignUp ? (
          <>
            <TextField
              label="이름을 입력해주세요."
              variant="outlined"
              fullWidth
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field-Name"
            />
            <TextField
              label="이메일을 입력해주세요."
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field-Email"
            />
            <TextField
              label="비밀번호를 입력해주세요."
              variant="outlined"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field-Password"
            />
            <div className="button-container-3">
              <span className="mas">회원가입</span>
              <button onClick={handleSignup}>회원가입</button>
            </div>
            <div className="button-container-3">
              <span className="mas">구글 계정으로 회원가입</span>
              <button onClick={handleGoogleLogin}>
                구글 계정으로 회원가입
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleLogin}>
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
            <div className="button-container-3" stlye={{ fontfamily: "BMJUA" }}>
              <span className="mas">로그인</span>
              <button type="submit">로그인</button>
            </div>
            <div className="button-container-3">
              <span className="mas">구글 계정으로 로그인</span>
              <button onClick={handleGoogleLogin}>구글 계정으로 로그인</button>
            </div>
          </form>
        )}
      </Box>
    </Modal>
  );
};

export default LoginModal;
