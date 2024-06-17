import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from "firebase/firestore";
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
import ProfileImage from "./Profilelogo"; // ProfileImage 컴포넌트를 import

const SearchBar = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSearchResults([]);
    setSearchError(false); // 초기 검색 오류 상태를 false로 설정
    if (searchTerm.length > 0) {
      // 검색어가 입력되면 연관된 사용자들을 가져옴
      getRelatedUsers();
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchResults([]);
        setSearchError(false); // 검색 결과가 없을 때 오류 상태를 초기화
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const getRelatedUsers = async () => {
    try {
      const q = query(
        collection(db, "users"),
        where("displayName", ">=", searchTerm),
        orderBy("displayName"),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        const displayName = doc.data().displayName;
        // 검색어가 displayName에 포함되면 결과에 포함
        if (displayName.includes(searchTerm)) {
          users.push({ ...doc.data(), uid: doc.id }); // UID를 함께 저장
        }
      });
      setSearchResults(users);
      if (users.length === 0) {
        setSearchError(true); // 검색 결과가 없을 때 searchError를 true로 설정
      } else {
        setSearchError(false);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

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
        setSearchError(true); // 검색 결과가 없을 때 searchError를 true로 설정
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
          className="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          inputProps={{ "aria-label": "search" }}
        />
        <IconButton onClick={handleButtonClick} aria-label="search">
          <SearchIcon />
        </IconButton>
      </div>
      {searchResults.length > 0 && (
        <Paper
          style={{
            position: "absolute",
            top: "80px", // Adjust as needed
            left: "48%", // Adjust as needed
            transform: "translateX(-50%)",
            padding: "20px",
            zIndex: 9999,
            maxHeight: "300px", // Adjust as needed
            overflowY: "auto", // Enable vertical scrolling
          }}
        >
          <ul>
            {searchResults.map((user, index) => (
              <li key={index}>
                <div>
                  <Button
                    variant="text"
                    onClick={() => handleProfileClick(user.uid)}
                  >
                    <ProfileImage uid={user.uid} />
                    {user.displayName} (ID: {user.uid.substring(0, 6)})
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Paper>
      )}
    </div>
  );
};

export default SearchBar;
