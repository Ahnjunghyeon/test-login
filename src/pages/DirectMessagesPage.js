import React, { useState, useEffect } from "react";
import { db, auth } from "../Firebase/firebase"; // Firebase 설정
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const DirectMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [receiverId, setReceiverId] = useState(""); // 메시지를 받을 사용자 ID

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUserId && receiverId) {
      const fetchMessages = async () => {
        try {
          const messagesRef = collection(
            db,
            `chats/${currentUserId}_${receiverId}/messages`
          );
          const snapshot = await getDocs(messagesRef);
          setMessages(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      fetchMessages();
    }
  }, [currentUserId, receiverId]);

  const handleSendMessage = async () => {
    try {
      await addDoc(
        collection(db, `chats/${currentUserId}_${receiverId}/messages`),
        {
          content: newMessage,
          senderId: currentUserId,
          timestamp: new Date(),
        }
      );
      setNewMessage("");
      // Refresh messages
      const snapshot = await getDocs(
        collection(db, `chats/${currentUserId}_${receiverId}/messages`)
      );
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4">Direct Messages</Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message"
      />
      <Button onClick={handleSendMessage}>Send</Button>
      <List>
        {messages.map((message) => (
          <ListItem key={message.id}>
            <ListItemText
              primary={message.content}
              secondary={message.timestamp}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default DirectMessagesPage;
