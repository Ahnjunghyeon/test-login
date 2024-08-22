import React, { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../Firebase/firebase";
import { useNavigate } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";
import ProfileImage from "../components/ProfileImage";
import "./FollowersPage.css";

const FollowersPage = () => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // 사용자 상태 관리
  const navigate = useNavigate();

  // 사용자 인증 상태 확인
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/home");
      }
    });

    return () => unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
  }, [navigate]);

  // 팔로워 가져오기
  const fetchFollowers = useCallback(async () => {
    if (!user) return; // 사용자 없음 시 종료

    try {
      const followsCollection = collection(db, `users/${user.uid}/follow`);
      const followsSnapshot = await getDocs(followsCollection);

      const followerIds = followsSnapshot.docs.map((doc) => doc.id);

      if (followerIds.length > 0) {
        const followersCollection = collection(db, "users");
        const followersQuery = query(
          followersCollection,
          where("__name__", "in", followerIds),
          limit(5) // 가져올 문서 수를 제한
        );
        const followersSnapshot = await getDocs(followersQuery);

        // 필드 선택적으로 읽기
        const followerList = followersSnapshot.docs.map((doc) => ({
          id: doc.id,
          displayName: doc.data().displayName || "이름 없음", // default value
          email: doc.data().email || "이메일 없음", // default value
        }));

        setFollowers(followerList);
      } else {
        setFollowers([]);
      }
    } catch (error) {
      console.error("Error fetching followers: ", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFollowers();
    }
  }, [user, fetchFollowers]);

  const handleProfileClick = (followerId) => {
    navigate(`/profile/${followerId}`);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div className="followers">
      <List>
        {user && (
          <ListItem onClick={() => navigate(`/profile/${user.uid}`)}>
            <Avatar>
              <ProfileImage uid={user.uid} />
            </Avatar>
            <ListItemText primary={user.displayName} secondary={user.email} />
          </ListItem>
        )}
        {followers.length === 0 ? (
          <Typography>팔로워가 없습니다.</Typography>
        ) : (
          followers.map((follower) => (
            <ListItem
              key={follower.id}
              onClick={() => handleProfileClick(follower.id)}
            >
              <Avatar>
                <ProfileImage uid={follower.id} />
              </Avatar>
              <ListItemText
                primary={follower.displayName}
                secondary={follower.email}
              />
            </ListItem>
          ))
        )}
      </List>
    </div>
  );
};

export default FollowersPage;
