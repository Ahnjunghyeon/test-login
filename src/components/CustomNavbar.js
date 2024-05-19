import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const CustomNavbar = ({ currentUser }) => {
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const signOutUser = () => {
    signOut(auth)
      .then(() => {
        console.log("Logged out successfully");
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result.user);
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
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">
          React-Firebase Auth
        </Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">
            Home
          </Nav.Link>
          <Nav.Link as={Link} to="/dashboard">
            Dashboard
          </Nav.Link>
          {user && (
            <>
              <Nav.Link as={Link} to="/profile">
                Profile
              </Nav.Link>
            </>
          )}
        </Nav>
        <Nav.Item>
          <Nav.Link as={Link} to="/profile">
            {user && (
              <div style={{ color: "white" }}>
                <img
                  src={user.photoURL}
                  alt="User"
                  style={{
                    width: "30px",
                    borderRadius: "50%",
                    marginRight: "5px",
                  }}
                />
                {user.displayName}
              </div>
            )}
          </Nav.Link>
        </Nav.Item>
        {!user ? (
          <Button variant="outline-info" onClick={signInWithGoogle}>
            Google Login
          </Button>
        ) : (
          <Button variant="outline-info" onClick={signOutUser}>
            Logout
          </Button>
        )}
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
