import React, { useState, useEffect } from "react";
import {
  // AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  InputBase,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { Link } from "react-router-dom";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { styled, alpha } from "@mui/material/styles";
import {
  red,
  blue,
  green,
  purple,
  // deepPurple,
  indigo,
} from "@mui/material/colors";
import "./CustomNavbar.css";
import "../Layout.js";
import "../App.js";

const CustomNavbar = ({ currentUser }) => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

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

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  }));

  const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    width: "100%",
    "& .MuiInputBase-input": {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create("width"),
      [theme.breakpoints.up("sm")]: {
        width: "12ch",
        "&:focus": {
          width: "20ch",
        },
      },
    },
  }));

  const drawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
        </ListItem>
        <ListItem button component={Link} to="/">
          <ListItemText primary="Home" />
        </ListItem>
        {user && (
          <ListItem button component={Link} to="/dashboard">
            <ListItemText primary="Dashboard" />
          </ListItem>
        )}
        {user && (
          <ListItem button component={Link} to="/profile">
            <ListItemText primary="Profile" />
          </ListItem>
        )}
      </List>
      <Divider />
      <List>
        {user ? (
          <ListItem button onClick={signOutUser}>
            <ListItemText primary="Logout" />
          </ListItem>
        ) : (
          <ListItem button onClick={signInWithGoogle}>
            <ListItemText primary="Google Login" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  // ------------- Material Ui color
  const colors = {
    lightRed: red[300],
    darkRed: red[700],
    lightBlue: blue[300],
    darkBlue: blue[700],
    lightGreen: green[300],
    darkGreen: green[700],
    lightPurple: purple[300],
    darkPurple: purple[700],
    whiteindigo: indigo[50],
  };

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
                sx={{ mr: 2 }}
                onClick={toggleDrawer(true)}
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
                React
              </Typography>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Search sx={{ display: { xs: "none", sm: "block" } }}>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                component={Link}
                to="/"
                color="inherit"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Home
              </Button>
              {user && (
                <Button
                  component={Link}
                  to="/dashboard"
                  color="inherit"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  Dashboard
                </Button>
              )}
              {user && (
                <Button
                  component={Link}
                  to="/profile"
                  color="inherit"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  Profile
                </Button>
              )}
              {user ? (
                <>
                  <IconButton onClick={handleMenuOpen} color="inherit">
                    <Avatar src={user.photoURL} alt="User" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem
                      onClick={handleMenuClose}
                      component={Link}
                      to="/profile"
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
          <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
            {drawerList()}
          </Drawer>
        </div>
      </div>
    </>
  );
};

export default CustomNavbar;
