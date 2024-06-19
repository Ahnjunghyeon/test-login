import React, { useState, useEffect } from "react";
import { Typography, Button, IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PublishIcon from "@mui/icons-material/Publish";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import "./Header.css";
import SearchBar from "./searchBar";
import ProfileImage from "./Profilelogo";
import logo from "../img/GREAPP.png"; // 로고 이미지 경로

const Header = ({ refreshProfileImage }) => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [message, setMessage] = useState(""); // State to hold the message
  const auth = getAuth();
  const db = getFirestore();
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const signOutUser = () => {
    signOut(auth)
      .then(() => {
        console.log("Logged out successfully");
        handleMenuClose();
        navigate("/");
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const googleName = user.displayName;
        const profileImageUrl = user.photoURL;
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const isNewUser = !userDoc.exists();

        if (googleName) {
          await updateProfile(user, {
            displayName: googleName,
          });

          try {
            await setDoc(userDocRef, {
              displayName: googleName,
              email: user.email,
              uid: user.uid,
              profileImage: profileImageUrl,
            });
            console.log("User profile saved successfully in Firestore");

            if (isNewUser) {
              navigate(`/profile/${user.uid}`);
            }
          } catch (error) {
            console.error("Failed to save user profile in Firestore:", error);
          }
        } else {
          console.log("Google name not available");
        }
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
  }, [auth, refreshProfileImage]);

  const handleIconClick = (event) => {
    event.stopPropagation();
    setMessage((prevMessage) => (prevMessage ? "" : "구상중"));
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setMessage("");
    };

    if (message) {
      window.addEventListener("click", handleClickOutside);
    }

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [message]);

  return (
    <>
      <div className="topheader">gasd</div>
      <hr className="topline"></hr>

      <div className="header">
        <div className="mainlogo" onClick={() => navigate("/")}>
          <img
            src={logo}
            alt="Logo"
            style={{
              cursor: "pointer",
              height: "40px",
              marginRight: "10px",
            }}
          />
        </div>
        <div className="search">
          <SearchBar />
        </div>
        <div className="menulist">
          <IconButton className="homebt" onClick={() => navigate("/home")}>
            <HomeIcon />
          </IconButton>

          {user && (
            <IconButton className="uploadbt" component={Link} to="/uploadpage">
              <PublishIcon />
            </IconButton>
          )}

          {user ? (
            <>
              <IconButton className="imgbt" onClick={handleMenuOpen}>
                <ProfileImage
                  className="MyPage"
                  uid={user.uid}
                  refresh={refreshProfileImage}
                />
              </IconButton>
              <Menu
                className="text"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  className="text"
                  onClick={() => {
                    handleMenuClose();
                    navigate(`/profile/${user.uid}`);
                  }}
                >
                  <div className="menutext">프로필</div>
                </MenuItem>
                <MenuItem className="logoutbt" onClick={signOutUser}>
                  <div className="text">로그아웃</div>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button className="loginbutton" onClick={signInWithGoogle}>
              <div className="menutext">로그인</div>
            </Button>
          )}
        </div>
      </div>
      <div className="header2">
        <IconButton
          className="lsidelist"
          size="large"
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={handleIconClick}
        >
          <MenuIcon />
        </IconButton>
        {message && <div className="message">{message}</div>}
      </div>
      <hr className="Line" />
    </>
  );
};

export default Header;
