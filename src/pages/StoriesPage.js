import React, { useState, useEffect } from "react";
import { db, auth } from "../Firebase/firebase"; // Firebase 설정
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Container, Typography, TextField, Button, Grid } from "@mui/material";

const StoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const storiesRef = collection(db, "stories");
        const snapshot = await getDocs(storiesRef);
        setStories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();
  }, []);

  const handleAddStory = async () => {
    try {
      await addDoc(collection(db, "stories"), {
        content: newStory,
        userId: currentUserId,
        timestamp: new Date(),
      });
      setNewStory("");
      // Refresh stories
      const snapshot = await getDocs(collection(db, "stories"));
      setStories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error adding story:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4">Stories</Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        value={newStory}
        onChange={(e) => setNewStory(e.target.value)}
        placeholder="Add a new story"
      />
      <Button onClick={handleAddStory}>Add Story</Button>
      <Grid container spacing={2}>
        {stories.map((story) => (
          <Grid item xs={12} sm={6} md={4} key={story.id}>
            <div>{story.content}</div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default StoriesPage;
