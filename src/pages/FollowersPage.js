import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/firebase";
import { useNavigate } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
} from "@mui/material";
import ProfileImage from "../components/ProfileImage";

const FollowersPage = () => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchFollowers();
    } else {
      navigate("/home"); // 로그인 안 되어 있으면 로그인 페이지로 리다이렉트
    }
  }, [user, navigate]);

  const fetchFollowers = async () => {
    try {
      const followsCollection = collection(db, `users/${user.uid}/follow`);
      const followsSnapshot = await getDocs(followsCollection);
      const followerList = await Promise.all(
        followsSnapshot.docs.map(async (followDoc) => {
          const followerId = followDoc.id;
          const followerDocRef = doc(db, `users/${followerId}`);
          const followerDoc = await getDoc(followerDocRef);
          return { id: followerId, ...followerDoc.data() };
        })
      );
      setFollowers(followerList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching followers: ", error);
      setLoading(false);
    }
  };

  const handleProfileClick = (followerId) => {
    navigate(`/profile/${followerId}`); // 해당 팔로워의 프로필 페이지로 이동
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <div>
      <Typography variant="h4">Followers</Typography>
      {followers.length === 0 ? (
        <Typography>No followers found.</Typography>
      ) : (
        <List>
          {followers.map((follower) => (
            <ListItem
              key={follower.id}
              button
              onClick={() => handleProfileClick(follower.id)}
            >
              <ProfileImage uid={follower.id} />
              <ListItemText
                primary={follower.displayName}
                secondary={follower.email}
              />
            </ListItem>
          ))}
        </List>
      )}
      <Button onClick={() => navigate(`/profile/${user.uid}`)}>
        Back to Profile
      </Button>
    </div>
  );
};

export default FollowersPage;
