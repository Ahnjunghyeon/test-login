import React, { useState, useEffect } from "react";
import { db, auth } from "../Firebase/firebase";
import {
  collection,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import {
  Typography,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  Popover,
  Button,
  Divider,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import "./NotificationsPage.css";

const NotificationsPage = ({ anchorEl, open, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId("");
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
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setNotifications(data);
          setLoading(false);
        },
        (error) => {
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
      const batch = writeBatch(db);

      const allRead = notifications.every((notification) => notification.read);

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: !allRead });
      });

      await batch.commit();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: !allRead }))
      );
      setSuccessMessage(
        allRead
          ? "모든 알림이 읽지 않음으로 표시되었습니다."
          : "모든 알림을 읽음으로 표시했습니다."
      );
    } catch (error) {
      setError(
        "알림을 읽음으로 표시하는 중 오류가 발생했습니다. 나중에 다시 시도해 주세요."
      );
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      const notificationsRef = collection(
        db,
        `users/${currentUserId}/notifications`
      );
      const snapshot = await getDocs(notificationsRef);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      setNotifications([]);
      setSuccessMessage("모든 알림이 삭제되었습니다.");
    } catch (error) {
      setError(
        "모든 알림을 삭제하는 중 오류가 발생했습니다. 나중에 다시 시도해 주세요."
      );
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteDoc(
        doc(db, `users/${currentUserId}/notifications`, notificationId)
      );
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      setSuccessMessage("알림이 삭제되었습니다.");
    } catch (error) {
      setError(
        "알림을 삭제하는 중 오류가 발생했습니다. 나중에 다시 시도해 주세요."
      );
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <CircularProgress />
      </div>
    );
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      style={{ marginTop: "13px" }}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "bottom", horizontal: "right" }}
      PaperProps={{
        style: {
          marginTop: "30px", // Popover의 위치를 아래로 이동
        },
      }}
    >
      <div className="notifications-container">
        <div className="button-container">
          <Button
            onClick={handleMarkAllAsRead}
            color="primary"
            variant="contained"
          >
            모두 읽음으로 표시
          </Button>
          <Button
            onClick={handleDeleteAllNotifications}
            color="secondary"
            variant="contained"
          >
            전체 알림 삭제
          </Button>
        </div>
        <Divider />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem key={notification.id} className="notification-item">
              <ListItemText
                primary={
                  <span
                    className={`notification-message ${
                      notification.read ? "read" : ""
                    }`}
                  >
                    {notification.message}
                  </span>
                }
                secondary={
                  notification.timestamp ? (
                    <span className="notification-timestamp">
                      {new Date(
                        notification.timestamp.seconds * 1000
                      ).toLocaleString()}
                    </span>
                  ) : (
                    "시간 없음"
                  )
                }
              />
              <IconButton
                edge="end"
                onClick={() => handleDeleteNotification(notification.id)}
                color="error"
                size="small"
              >
                <DeleteIcon className="delete-icon" />
              </IconButton>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>알림이 없습니다.</MenuItem>
        )}
      </div>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
      >
        <Alert onClose={() => setSuccessMessage("")} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Popover>
  );
};

export default NotificationsPage;
