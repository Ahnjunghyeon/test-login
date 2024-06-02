import React, { useState, useEffect } from "react";
import {
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
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
      <div className="Top">
        <div className="Top2">
          <Toolbar
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="open drawer"
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                style={{
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                히
              </Typography>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <SearchBar />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Button
                component={Link}
                to="/"
                color="inherit"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  margin: "3px", // 마진 추가
                }}
              >
                홈
              </Button>

              {user && (
                <Button
                  component={Link}
                  to="/dashboard"
                  color="inherit"
                  sx={{
                    display: { xs: "none", sm: "block" },
                    margin: "3px", // 마진 추가
                  }}
                >
                  업로드
                </Button>
              )}

              {user && (
                <Button
                  onClick={() => navigate(`/profile/${user.uid}`)}
                  color="inherit"
                  sx={{
                    display: { xs: "none", sm: "block" },
                    margin: "3px", // 마진 추가
                  }}
                >
                  프로필
                </Button>
              )}

              {user ? (
                <>
                  <IconButton onClick={handleMenuOpen} color="inherit">
                    {/* ProfileImage 컴포넌트를 사용하여 프로필 이미지 가져오기 */}
                    <ProfileImage
                      uid={user.uid}
                      refresh={refreshProfileImage}
                    />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate(`/profile/${user.uid}`);
                      }}
                    >
                      {user.displayName}
                    </MenuItem>
                    <MenuItem onClick={signOutUser}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={signInWithGoogle}
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  Google Login
                </Button>
              )}
            </div>
          </Toolbar>
        </div>
      </div>
      <hr className="Line" />
    </>
  );
};

export default Header;
