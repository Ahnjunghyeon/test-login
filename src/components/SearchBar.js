import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

import {
  InputBase,
  IconButton,
  Paper,
  Typography,
  Button,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({ user }) => {
  // user 프로퍼티를 받아옴
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
        users.push(doc.data());
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

  const handleDisplayNameClick = (displayName) => {
    const encodedName = encodeURIComponent(displayName);
    navigate(`/profile/${encodedName}`);
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
                  onClick={() => handleDisplayNameClick(user.displayName)}
                >
                  {user.displayName}
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
