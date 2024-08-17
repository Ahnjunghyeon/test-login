import React, { useState, useEffect } from "react";
import { db, auth } from "../Firebase/firebase";
import { collection, onSnapshot, updateDoc, getDocs } from "firebase/firestore";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      const notificationsRef = collection(
        db,
        `users/${currentUserId}/notifications`
      );
      const unsubscribe = onSnapshot(
        notificationsRef,
        (snapshot) => {
          setNotifications(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
          setLoading(false);
        },
        (error) => {
          console.error("알림을 가져오는 중 오류가 발생했습니다:", error);
          setError(
            "알림을 가져오는 중 오류가 발생했습니다. 나중에 다시 시도해 주세요."
          );
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }
  }, [currentUserId]);

  const handleMarkAllAsRead = async () => {
    try {
      const notificationsRef = collection(
        db,
        `users/${currentUserId}/notifications`
      );
      const snapshot = await getDocs(notificationsRef);
      await Promise.all(
        snapshot.docs.map((doc) => updateDoc(doc.ref, { read: true }))
      );
      setNotifications(
        notifications.map((notification) => ({ ...notification, read: true }))
      );
      setSuccessMessage("모든 알림을 읽음으로 표시했습니다.");
    } catch (error) {
      console.error("알림을 읽음으로 표시하는 중 오류가 발생했습니다:", error);
      setError(
        "알림을 읽음으로 표시하는 중 오류가 발생했습니다. 나중에 다시 시도해 주세요."
      );
    }
  };

  if (loading)
    return (
      <Container>
        <CircularProgress />
      </Container>
    );

  return (
    <Container>
      <Typography variant="h4">알림</Typography>
      <Button variant="contained" color="primary" onClick={handleMarkAllAsRead}>
        모두 읽음으로 표시
      </Button>
      <List>
        {notifications.map((notification) => (
          <ListItem key={notification.id}>
            <ListItemText
              primary={notification.message}
              secondary={
                notification.timestamp
                  ? new Date(
                      notification.timestamp.seconds * 1000
                    ).toLocaleString()
                  : "시간 없음"
              }
            />
          </ListItem>
        ))}
      </List>
      {/* 오류 Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      {/* 성공 Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
      >
        <Alert onClose={() => setSuccessMessage("")} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotificationsPage;