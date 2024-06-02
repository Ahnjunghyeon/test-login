import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../Firebase/firebase";
import { useNavigate } from "react-router-dom";

import {
  InputBase,
  IconButton,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ProfileImage from "./profileImage"; // ProfileImage 컴포넌트를 import

const SearchBar = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSearchResults([]);
  }, [searchTerm]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSearch = async () => {
    try {
      const q = query(
        collection(db, "users"),
        where("displayName", "==", searchTerm)
      );
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ ...doc.data(), uid: doc.id }); // UID를 함께 저장
      });
      if (users.length === 0) {
        setSearchError(true);
      } else {
        setSearchError(false);
        setSearchResults(users);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleButtonClick = () => {
    handleSearch();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleProfileClick = (uid) => {
    console.log(`Navigating to profile with UID: ${uid}`);
    navigate(`/profile/${uid}`); // UID를 이용하여 프로필 페이지로 이동
  };

  return (
    <div ref={searchContainerRef}>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <InputBase
          placeholder="Search…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          inputProps={{ "aria-label": "search" }}
        />
        <IconButton onClick={handleButtonClick} aria-label="search">
          <SearchIcon />
        </IconButton>
      </div>
      {searchError ? (
        <Typography variant="body1" style={{ textAlign: "center" }}>
          None
        </Typography>
      ) : null}
      {searchResults.length > 0 && (
        <Paper
          style={{
            position: "absolute",
            top: "50px", // Adjust as needed
            left: "50%", // Adjust as needed
            transform: "translateX(-50%)",
            padding: "20px",
            zIndex: 9999,
          }}
        >
          <Typography variant="h6">Search Results:</Typography>
          <ul>
            {searchResults.map((user, index) => (
              <li key={index}>
                <Button
                  variant="text"
                  onClick={() => handleProfileClick(user.uid)}
                >
                  <ProfileImage uid={user.uid} />
                  {user.displayName} (ID: {user.uid.substring(0, 6)}){" "}
                  {/* 식별자 표시 */}
                </Button>
              </li>
            ))}
          </ul>
        </Paper>
      )}
    </div>
  );
};

export default SearchBar;
