import React, { useState, useEffect } from "react";
import { db } from "../Firebase/firebase"; // Firebase 설정
import { collection, getDocs } from "firebase/firestore";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
} from "@mui/material";

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRef = collection(db, "posts");
        const snapshot = await getDocs(postsRef);
        setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Container>
      <Typography variant="h4">Explore</Typography>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post.id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={post.imageURL}
                alt={post.title}
              />
              <CardContent>
                <Typography variant="h6">{post.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {post.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  Like
                </Button>
                <Button size="small" color="primary">
                  Comment
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ExplorePage;
