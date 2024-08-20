import React, { useState, useEffect } from "react";
import { db, auth } from "../Firebase/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  getDocs,
  addDoc,
  deleteDoc, // 삭제 기능을 위한 추가
  doc,
  Timestamp,
} from "firebase/firestore";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete"; // 삭제 아이콘 추가

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

  // 댓글 삭제 함수와 알림 삭제 추가
  const handleDeleteComment = async (postId, commentId) => {
    try {
      // 댓글 삭제
      await deleteDoc(
        doc(db, `users/${currentUserId}/posts/${postId}/comments`, commentId)
      );

      // 관련 알림 삭제
      const notificationsRef = collection(
        db,
        `users/${currentUserId}/notifications`
      );
      const snapshot = await getDocs(notificationsRef);
      const commentNotifications = snapshot.docs.filter(
        (doc) => doc.data().type === "comment" && doc.data().postId === postId
      );

      await Promise.all(
        commentNotifications.map((notification) =>
          deleteDoc(
            doc(db, `users/${currentUserId}/notifications`, notification.id)
          )
        )
      );

      setNotifications(
        notifications.filter(
          (notification) =>
            notification.type !== "comment" || notification.postId !== postId
        )
      );
      setSuccessMessage("댓글과 관련된 알림이 삭제되었습니다.");
    } catch (error) {
      console.error("댓글 삭제 중 오류가 발생했습니다:", error);
      setError("댓글 삭제 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.");
    }
  };

  // 알림 삭제 함수
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteDoc(
        doc(db, `users/${currentUserId}/notifications`, notificationId)
      );
      setNotifications(
        notifications.filter(
          (notification) => notification.id !== notificationId
        )
      );
      setSuccessMessage("알림이 삭제되었습니다.");
    } catch (error) {
      console.error("알림을 삭제하는 중 오류가 발생했습니다: ", error);
      setError(
        "알림을 삭제하는 중 오류가 발생했습니다. 나중에 다시 시도해 주세요."
      );
    }
  };

  // 좋아요 알림 생성 함수
  const createLikeNotification = async (
    postId,
    postOwnerId,
    likerDisplayName
  ) => {
    try {
      if (!postId || !postOwnerId || !likerDisplayName) {
        throw new Error("알림 생성을 위한 필수 정보가 누락되었습니다.");
      }

      await addDoc(collection(db, `users/${postOwnerId}/notifications`), {
        type: "like",
        postId,
        timestamp: Timestamp.now(),
        message: `${likerDisplayName}님이 당신의 게시물에 좋아요를 눌렀습니다.`,
        read: false,
      });
    } catch (error) {
      console.error("좋아요 알림 생성 중 오류가 발생했습니다: ", error);
    }
  };

  // 댓글 알림 생성 함수
  const createCommentNotification = async (
    postId,
    postOwnerId,
    commenterDisplayName,
    commentText
  ) => {
    try {
      if (!postId || !postOwnerId || !commenterDisplayName || !commentText) {
        throw new Error("알림 생성을 위한 필수 정보가 누락되었습니다.");
      }

      await addDoc(collection(db, `users/${postOwnerId}/notifications`), {
        type: "comment",
        postId,
        timestamp: Timestamp.now(),
        message: `${commenterDisplayName}님이 게시물에 댓글을 남기셨습니다: "${commentText}"`,
        read: false,
      });
    } catch (error) {
      console.error("댓글 알림 생성 중 오류가 발생했습니다: ", error);
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
            {/* 알림 삭제 버튼 */}
            <IconButton
              edge="end"
              onClick={() => handleDeleteNotification(notification.id)}
            >
              <DeleteIcon />
            </IconButton>
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
