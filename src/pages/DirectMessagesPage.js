import React, { useState, useEffect, useCallback, useRef } from "react";
import { getAuth } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  limit,
  startAfter,
  getDoc,
} from "firebase/firestore";
import { db } from "../Firebase/firebase";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import ProfileImage from "../components/ProfileImage";
import "./DirectMessagesPage.css";
import DeleteIcon from "@mui/icons-material/Delete";

const DirectMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [selectedFollower, setSelectedFollower] = useState(null);
  const [lastMessageSnapshot, setLastMessageSnapshot] = useState(null);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const messagesEndRef = useRef(null);

  const auth = getAuth();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const chatId = user && selectedFollower ? selectedFollower.id : "";

  // 메시지 가져오기
  const fetchMessages = useCallback(async () => {
    if (!user || !selectedFollower || !chatId) return;

    setLoadingMessages(true);
    try {
      const myMessagesRef = collection(
        db,
        `users/${user.uid}/chats/${chatId}/messages`
      );
      const messagesQuery = query(
        myMessagesRef,
        orderBy("timestamp", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(messagesQuery);

      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastMessageSnapshot(lastDoc);
    } catch (error) {
      console.error("Error fetching messages: ", error);
    } finally {
      setLoadingMessages(false);
    }
  }, [user, selectedFollower, chatId]);

  // 추가 메시지 로드
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadMoreMessages = async () => {
    if (!lastMessageSnapshot || loadingMoreMessages) return;

    setLoadingMoreMessages(true);
    try {
      const myMessagesRef = collection(
        db,
        `users/${user.uid}/chats/${chatId}/messages`
      );
      const messagesQuery = query(
        myMessagesRef,
        orderBy("timestamp"),
        startAfter(lastMessageSnapshot),
        limit(50)
      );
      const snapshot = await getDocs(messagesQuery);

      const moreMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages((prevMessages) => [...prevMessages, ...moreMessages]);

      // 마지막 문서 업데이트
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastMessageSnapshot(lastDoc);
    } catch (error) {
      console.error("Error loading more messages: ", error);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  // 팔로워 가져오기
  const fetchFollowers = useCallback(async () => {
    if (!user) return;

    setLoadingFollowers(true);
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
    } catch (error) {
      console.error("Error fetching followers: ", error);
    } finally {
      setLoadingFollowers(false);
    }
  }, [user]);

  // 컴포넌트 마운트 시 팔로워 가져오기
  useEffect(() => {
    if (user) {
      fetchFollowers();
    } else {
      navigate("/home");
    }
  }, [user, navigate, fetchFollowers]);

  // 팔로워 선택 시 메시지 가져오기
  useEffect(() => {
    if (followers.length > 0 && !selectedFollower) {
      setSelectedFollower(followers[0]);
    }
  }, [followers, selectedFollower]);

  // 선택된 팔로워가 있을 때 메시지 가져오기
  useEffect(() => {
    if (selectedFollower) {
      fetchMessages();
    }
  }, [selectedFollower, fetchMessages]);

  // 메시지 입력 후 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedFollower || !user || !chatId) return;

    try {
      // 상대방의 Firebase에 메시지 추가
      await addDoc(
        collection(
          db,
          `users/${selectedFollower.id}/chats/${user.uid}/messages`
        ),
        {
          senderId: user.uid,
          receiverId: selectedFollower.id,
          content: newMessage,
          timestamp: new Date(),
        }
      );

      // 나의 Firebase에 메시지 추가
      await addDoc(
        collection(
          db,
          `users/${user.uid}/chats/${selectedFollower.id}/messages`
        ),
        {
          senderId: user.uid,
          receiverId: selectedFollower.id,
          content: newMessage,
          timestamp: new Date(),
        }
      );

      setNewMessage("");
      fetchMessages(); // 메시지 전송 후 새로고침
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  // 메시지 삭제 확인 다이얼로그 열기
  const handleOpenDeleteDialog = (msg) => {
    setMessageToDelete(msg);
    setOpenDeleteDialog(true);
  };

  // 메시지 삭제 확인 다이얼로그 닫기
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setMessageToDelete(null);
  };

  // 메시지 삭제
  const handleDeleteMessage = async () => {
    if (!user || !selectedFollower || !chatId || !messageToDelete) return;

    try {
      // 나의 Firebase에서 메시지 삭제
      const messageRefToSelf = doc(
        db,
        `users/${user.uid}/chats/${selectedFollower.id}/messages`,
        messageToDelete.id
      );
      await deleteDoc(messageRefToSelf);

      // 상대방의 Firebase에서 메시지 삭제
      const messageRefToOther = doc(
        db,
        `users/${selectedFollower.id}/chats/${user.uid}/messages`,
        messageToDelete.id
      );
      await deleteDoc(messageRefToOther);

      fetchMessages(); // 메시지 삭제 후 새로고침
      handleCloseDeleteDialog(); // 다이얼로그 닫기
    } catch (error) {
      console.error("Error deleting message: ", error);
    }
  };

  // 팔로워 클릭 처리
  const handleFollowerClick = async (followerId) => {
    const selected = followers.find((follower) => follower.id === followerId);
    setSelectedFollower(selected);

    // 대화 내용을 가져오기
    const messagesRef = collection(
      db,
      `users/${user.uid}/chats/${followerId}/messages`
    );
    const messagesQuery = query(messagesRef, orderBy("timestamp"), limit(50));
    const snapshot = await getDocs(messagesQuery);
    const fetchedMessages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setMessages(fetchedMessages);
    navigate(`/direct-messages/${followerId}`);
  };

  // 스크롤이 끝에 도달하면 추가 메시지 로드
  useEffect(() => {
    const handleScroll = () => {
      if (messagesEndRef.current) {
        const bottom = messagesEndRef.current.getBoundingClientRect().bottom;
        if (bottom <= window.innerHeight) {
          loadMoreMessages();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreMessages]);

  if (loadingMessages || loadingFollowers) {
    return <CircularProgress />;
  }

  return (
    <Container className="directpage">
      <div className="direct-messages">
        <div className="followers-list">
          <Typography variant="h6">팔로워 목록</Typography>
          {/* 팔로워 리스트 */}
          <List>
            {followers.length === 0 ? (
              <Typography>팔로워가 없습니다.</Typography>
            ) : (
              followers.map((follower) => (
                <ListItem
                  key={follower.id} // 고유한 ID 사용
                  onClick={() => handleFollowerClick(follower.id)}
                  selected={selectedFollower?.id === follower.id}
                >
                  <div className="avatar-profile">
                    <ProfileImage uid={follower.id} />
                  </div>
                  <ListItemText
                    primary={follower.displayName}
                    secondary={follower.email}
                  />
                </ListItem>
              ))
            )}
          </List>
        </div>
        <div className="messages-container">
          {selectedFollower ? (
            <>
              <div className="selected-follower-info">
                <ProfileImage uid={selectedFollower.id} />
                <div> &ensp;</div>
                <Typography>{selectedFollower.displayName}</Typography>
                <div> &ensp;님과의 대화</div>
              </div>
              {/* 메시지 리스트 */}
              <List className="messages-list">
                {messages.map((msg) => (
                  <ListItem
                    key={msg.id} // 고유한 ID 사용
                    className={msg.senderId === user.uid ? "mine" : "theirs"}
                    alignItems="flex-start"
                  >
                    {msg.senderId !== user.uid && (
                      <div className="avatar-profile">
                        <ProfileImage uid={msg.senderId} />
                      </div>
                    )}
                    <ListItemText
                      primary={msg.content}
                      secondary={new Date(
                        msg.timestamp.toDate()
                      ).toLocaleTimeString()}
                    />
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleOpenDeleteDialog(msg)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
                {/* 메시지 리스트 끝 지점 */}
                <div ref={messagesEndRef} />
              </List>

              <div className="message-input">
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="메시지를 입력하세요..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!selectedFollower}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!selectedFollower}
                >
                  전송
                </Button>
              </div>
              {loadingMoreMessages && <CircularProgress />}
            </>
          ) : (
            <Typography>메시지를 보낼 팔로워를 선택하세요.</Typography>
          )}
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>메시지 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>메시지를 삭제하시겠습니까?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            아니요
          </Button>
          <Button onClick={handleDeleteMessage} color="primary">
            네
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DirectMessagesPage;
