import React, { useState } from "react";
import Modal from "react-modal";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import "./LoginModal.css"; // 스타일을 위한 CSS 파일 추가

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const auth = getAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        onClose();
      })
      .catch((error) => {
        setError("없는 아이디 입니다.");
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Login Modal"
      shouldCloseOnOverlayClick={true}
      className="modal"
      overlayClassName="overlay"
    >
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <button onClick={onClose}>Close</button>
    </Modal>
  );
};

export default LoginModal;
