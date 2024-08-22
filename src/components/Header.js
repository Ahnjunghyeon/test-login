import React, { useState, useEffect, useRef } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Button,
  Typography,
  Popover,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import AddHomeRoundedIcon from "@mui/icons-material/AddHomeRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import MessageRoundedIcon from "@mui/icons-material/MessageRounded"; // 다이렉트 메시지 아이콘 추가
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import "./Header.css";
import SearchBar from "./SearchBar";
import ProfileImage from "./ProfileLogo";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import NotificationsPage from "../pages/NotificationsPage"; // Import NotificationsPage

const Header = ({ refreshProfileImage }) => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [isVisible, setIsVisible] = useState(true);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
    });

    return () => unsubscribe();
  }, [auth, refreshProfileImage]);

  const handleSignup = (email, password) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("User signed up:", userCredential.user);
      })
      .catch((error) => {
        console.error("Error signing up:", error);
      });
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setIsVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  const handleIconClick = (event) => {
    event.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
    setNotificationsOpen(true);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
    setNotificationsOpen(false);
  };

  return (
    <>
      <div className={`header ${isVisible ? "visible" : "hidden"}`}>
        <div className="mainlogo" onClick={() => navigate("/")}>
          <div className="Sidebtn">
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
          </div>
          <div className="Logo">SNSWEB</div>
        </div>
        <div className="search">
          <SearchBar />
        </div>
        <div className="menulist">
          <div className="homebt" onClick={() => navigate("/home")}>
            홈
          </div>

          {user && (
            <>
              <div className="uploadbt" onClick={() => navigate("/uploadpage")}>
                업로드
              </div>
              <IconButton onClick={handleNotificationsOpen}>
                <NotificationsRoundedIcon />
              </IconButton>
              <IconButton
                onClick={() => navigate(`/direct-messages/${user.uid}`)}
              >
                <MessageRoundedIcon /> {/* 다이렉트 메시지 아이콘 */}
              </IconButton>
            </>
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
            <>
              <Button
                className="loginbutton"
                onClick={() => setIsLoginModalOpen(true)}
              >
                <div className="menutext">로그인</div>
              </Button>
              <Button
                className="signupbutton"
                onClick={() => setIsSignupModalOpen(true)}
              >
                <div className="menutext">회원가입</div>
              </Button>
            </>
          )}
        </div>
      </div>

      <hr className="topline" />

      <div className={`header2 ${isMenuOpen ? "open" : ""}`}>
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
            >
              <MenuOpenRoundedIcon />
            </IconButton>
            <div className="mainlogo" onClick={() => navigate("/")}>
              SNSWEB
            </div>
          </div>

          <MenuItem className="sidehomebtn" onClick={() => navigate("/home")}>
            <AddHomeRoundedIcon sx={{ color: "#849aff" }} />
            <div
              className="text"
              style={{
                marginLeft: "30px",
                fontFamily: "BMJUA, sans-serif",
              }}
            >
              홈
            </div>
          </MenuItem>

          <MenuItem
            className="sidehomebtn"
            onClick={() => navigate("/uploadpage")}
          >
            <UploadFileRoundedIcon sx={{ color: "#849aff" }} />
            <div
              className="text"
              style={{
                marginLeft: "30px",
                fontFamily: "BMJUA, sans-serif",
              }}
            >
              업로드
            </div>
          </MenuItem>

          <div className="search" style={{ marginLeft: "20px" }}>
            <SearchBar className="sidesearch" />
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSignup={handleSignup}
      />

      <NotificationsPage
        anchorEl={notificationsAnchorEl}
        open={notificationsOpen}
        onClose={handleNotificationsClose}
      />
    </>
  );
};

export default Header;
