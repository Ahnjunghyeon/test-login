import React, { useState, useEffect } from "react";
import { Typography, Button, IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";

import "./Header.css";
import SearchBar from "./searchBar"; // SearchBar 컴포넌트를 import
import ProfileImage from "./profileImage"; // ProfileImage 컴포넌트를 import

const Header = ({ refreshProfileImage }) => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const auth = getAuth();
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
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        const googleName = user.displayName; // 구글 프로필에서 이름 가져오기
        if (googleName) {
          // 구글 이름이 존재하는 경우에만 업데이트
          updateProfile(user, {
            displayName: googleName,
          })
            .then(() => {
              console.log("Profile updated successfully with Google name");
            })
            .catch((error) => {
              console.error(
                "Failed to update profile with Google name:",
                error
              );
            });
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

  return (
    <>
      <div className="header">
        <div className="mainlogo">
          <IconButton
            className="lsidelist"
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
          >
            {" "}
            <MenuIcon />
          </IconButton>
          <Typography
            className="logoicon"
            component={Link}
            to="/"
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
          >
            JungHyeon
          </Typography>
        </div>
        <div className="search">
          <SearchBar />
        </div>
        <div className="menulist">
          <Button className="homebt" component={Link} to="/">
            <div className="menutext">Home</div>
          </Button>

          {user && (
            <Button className="uploadbt" component={Link} to="/dashboard">
              <div className="menutext">Upload</div>
            </Button>
          )}

          {user && (
            <Button
              className="profilebt"
              onClick={() => navigate(`/profile/${user.uid}`)}
            >
              <div className="menutext">Profile</div>
            </Button>
          )}

          {user ? (
            <>
              <div className="imgmenu">
                <div className="text"> MyPage</div>
                <IconButton className="imgbt" onClick={handleMenuOpen}>
                  {/* ProfileImage 컴포넌트를 사용하여 프로필 이미지 가져오기 */}
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
                    {user.displayName}
                  </MenuItem>
                  <MenuItem className="logoutbt" onClick={signOutUser}>
                    <div className="text">Log Out</div>
                  </MenuItem>
                </Menu>
              </div>
            </>
          ) : (
            <Button className="loginbutton" onClick={signInWithGoogle}>
              <div className="text">Google Login</div>
            </Button>
          )}
        </div>
      </div>
      <hr className="Line" />
      <div className="header2">빈공간~</div>
    </>
  );
};

export default Header;
