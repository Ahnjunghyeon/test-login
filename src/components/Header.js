import React, { useState, useEffect, useRef } from "react";
import { IconButton, Menu, MenuItem, Button, Icon } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";

import AddHomeRoundedIcon from "@mui/icons-material/AddHomeRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import GradeIcon from "@mui/icons-material/Grade";
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
import SearchBar from "./SearchBar";
import ProfileImage from "./ProfileLogo";
import logo from "../img/GREAPP.png"; // 로고 이미지 경로

const Header = ({ refreshProfileImage }) => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu open/close
  const auth = getAuth();
  const db = getFirestore();
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const menuRef = useRef(null); // Ref to access the menu DOM element

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

  const handleIconClick = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle menu open/close
  };

  const handleClickOutside = (event) => {
    // Close menu if clicked outside
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  const addToFavorites = () => {
    const url = "https://login-test-a417d.web.app";
    const title = "My Home Page";

    if (window.external && window.external.AddFavorite) {
      // Internet Explorer
      window.external.AddFavorite(url, title);
    } else if (window.sidebar && window.sidebar.addPanel) {
      // Firefox <=22
      window.sidebar.addPanel(title, url, "");
    } else {
      // Other browsers
      alert("Press Ctrl+D (Windows) or Command+D (Mac) to bookmark this page.");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className={`overlay ${isMenuOpen ? "open" : ""}`} />
      <div className="topheader">
        <IconButton className="favoriteButton" onClick={addToFavorites}>
          <GradeIcon sx={{ color: "gold" }} />
        </IconButton>
      </div>
      <hr className="topline" />

      <div className="header">
        <div className="mainlogo" onClick={() => navigate("/")}>
          <img
            src={logo}
            alt="Logo"
            style={{ cursor: "pointer", height: "40px", marginRight: "10px" }}
          />
        </div>
        <div className="search">
          <SearchBar />
        </div>
        <div className="menulist">
          <div
            className="homebt"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "45px",
              height: "45px",
              padding: "8px",
              borderRadius: "15%",
              transition: "background-color 0.3s",
              backgroundColor: "transparent",
            }}
            onClick={() => navigate("/home")}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <AddHomeRoundedIcon
              sx={{
                color: "#83769C",
                fontSize: "1.7rem",
              }}
            />
          </div>

          {user && (
            <div
              className="uploadbt"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "45px",
                height: "45px",
                padding: "8px",
                borderRadius: "15%",
                transition: "background-color 0.3s",
                backgroundColor: "transparent",
                marginRight: "5px",
              }}
              onClick={() => navigate("/uploadpage")}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <UploadFileRoundedIcon
                sx={{
                  color: "#83769C",
                  fontSize: "1.7rem",
                }}
              />
            </div>
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
                  onClick={() => {
                    handleMenuClose();
                    navigate(`/profile/${user.uid}`);
                  }}
                >
                  <div className="menutext">프로필</div>
                </MenuItem>
                <MenuItem onClick={() => navigate("/home")}>
                  <div className="menutext">홈</div>
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/uploadpage"
                  onClick={handleMenuClose}
                >
                  <div className="menutext">업로드</div>
                </MenuItem>
                <MenuItem onClick={signOutUser}>
                  <div className="menutext">로그아웃</div>
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
      <div className="Sidebtn">
        <IconButton
          className="lsidelist"
          size="large"
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={handleIconClick}
          sx={{ color: "#83769C", fontSize: "1.5rem" }} // Adjust icon size
        >
          <MenuIcon />
        </IconButton>
      </div>
      <hr className="topline" />

      {/* Header2 */}
      <div className={`header2 ${isMenuOpen ? "open" : ""}`}>
        {/* Conditional rendering for the menu */}
        <div
          ref={menuRef}
          className={`header2-menu ${isMenuOpen ? "open" : ""}`}
        >
          <div className="header2-menuopenBtn">
            <IconButton
              className="header2-menu-button"
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleIconClick}
              sx={{ color: "#83769C", fontSize: "1.5rem", margin: "0 7px" }} // Adjust icon size
            >
              <MenuOpenRoundedIcon />
            </IconButton>
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
          </div>
          <div
            className="search"
            style={{
              maxWidth: "220px",
              marginLeft: "20px",
              marginRight: "20px",
            }}
          >
            <SearchBar className="sidesearch" />
          </div>
          <MenuItem
            className="sidehomebtn"
            style={{ marginLeft: "2px" }}
            onClick={() => navigate("/home")}
          >
            <AddHomeRoundedIcon sx={{ color: "#83769C" }} />
            <div className="text" style={{ marginLeft: "30px" }}>
              Home
            </div>
          </MenuItem>
          <MenuItem
            className="sideuploadbtn"
            style={{ marginLeft: "2px" }}
            onClick={() => navigate("/uploadpage")}
          >
            {user && <UploadFileRoundedIcon sx={{ color: "#83769C" }} />}{" "}
            <div className="text" style={{ marginLeft: "30px" }}>
              Upload
            </div>
          </MenuItem>
        </div>
      </div>
    </>
  );
};

export default Header;
