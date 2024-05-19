// src/App.js

import React, { useState, useEffect } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { Button, Container, Navbar, Nav, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result.user);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const signOutUser = () => {
    signOut(auth)
      .then(() => {
        console.log("로그아웃 되었습니다.");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">React-Firebase Auth</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard">
              Dashboard
            </Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/profile">
                Profile
              </Nav.Link>
            )}
          </Nav>
          {user ? (
            <div className="d-flex align-items-center">
              <Image
                src={user.photoURL}
                roundedCircle
                width="30"
                height="30"
                className="me-2"
              />
              <span className="text-light me-3">{user.displayName}</span>
              <Button variant="outline-info" onClick={signOutUser}>
                로그아웃
              </Button>
            </div>
          ) : (
            <Button variant="outline-info" onClick={signInWithGoogle}>
              Google 로그인
            </Button>
          )}
        </Container>
      </Navbar>
      <Container className="mt-5">
        {user ? (
          <div>
            <h2>환영합니다, {user.displayName}!</h2>
            <Image
              src={user.photoURL}
              roundedCircle
              className="img-thumbnail"
            />
            <p>Email: {user.email}</p>
          </div>
        ) : (
          <h2>로그인해 주세요.</h2>
        )}
      </Container>
    </div>
  );
}

export default App;
