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
import { InputBase, IconButton, Paper, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ProfileImage from "./ProfileLogo"; // ProfileImage 컴포넌트를 import
import "./SearchBar.css";

const SearchBar = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  const [inputWidth, setInputWidth] = useState("400px");

  useEffect(() => {
    // 화면 크기 조정 시 InputBase의 너비를 업데이트
    const handleResize = () => {
      if (window.innerWidth <= 730) {
        setInputWidth("80%");
      } else {
        setInputWidth("400px");
      }
    };

    // 초기 렌더링 및 윈도우 크기 변경 시 너비 업데이트
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  const getPaperPosition = () => {
    if (searchContainerRef.current) {
      const { bottom } = searchContainerRef.current.getBoundingClientRect();
      return {
        top: bottom + window.scrollY,
        left: searchContainerRef.current.getBoundingClientRect().left,
      };
    }
    return { top: "65px", left: "48%" }; // 기본 위치
  };

  const paperPosition = getPaperPosition();

  return (
    <div ref={searchContainerRef}>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <InputBase
          className="text"
          placeholder="검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          inputProps={{ "aria-label": "search" }}
          style={{ fontFamily: "BMJUA", width: inputWidth }}
        />
        <IconButton
          className="Searchicon"
          onClick={handleButtonClick}
          aria-label="search"
        >
          <SearchIcon />
        </IconButton>
      </div>
      {searchResults.length > 0 && (
        <Paper
          style={{
            position: "absolute",
            top: paperPosition.top,
            left: paperPosition.left + 110, // Move 100px to the right
            width: "220px",
            transform: "translateX(-50%)",
            padding: "20px",
            zIndex: 9999,
            maxHeight: "300px",
            overflowY: "auto",
            backgroundColor: "rgb(255,255,255,1)",
          }}
        >
          <ul style={{ padding: 0, margin: 0 }}>
            {searchResults.map((user, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  margin: 0,
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                <Button
                  variant="text"
                  onClick={() => handleProfileClick(user.uid)}
                  style={{ fontFamily: "BMJUA", textAlign: "left" }}
                >
                  <ProfileImage
                    uid={user.uid}
                    style={{ fontFamily: "BMJUA" }}
                  />
                  {user.displayName} (ID: {user.uid.substring(0, 6)})
                </Button>
              </div>
            ))}
          </ul>
        </Paper>
      )}
    </div>
  );
};

export default SearchBar;
