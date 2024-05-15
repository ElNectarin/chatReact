import axios from "axios";
import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import "../styles/MainChatPage.scss";
import EmojiPicker from "emoji-picker-react";
import moment from "moment";
import sendPng from "../assets/pngwing.com.png";
import smilePng from "../assets/smile.png";
import { useTheme } from "@mui/material/styles";

interface Message {
  id: number;
  text: string;
  senderId: number;
  recipientId: number;
  sentAt: string;
}

interface Conversation {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
}

interface Props {
  socket: Socket;
}

const MainChatPage: React.FC<Props> = ({ socket }) => {
  const theme = useTheme();
  console.log("Theme", theme);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const senderId = localStorage.getItem("id");
  const sessionId = localStorage.getItem("sessionId");
  const [visibleEmoji, setVisibleEmoji] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  useEffect(() => {
    // Слушаем событие нового сообщения
    socket.on("message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Получаем список пользователей с сервера
    fetchUsersList();
    fetchConversation();

    return () => {
      socket.off("message"); // Отписываемся от события нового сообщения
    };
  }, [socket, selectedUser, senderId]);

  useEffect(() => {
    // Слушаем событие истории сообщений
    socket.on("history", (historyMessages: Message[]) => {
      setMessages(historyMessages.reverse()); // Обратный порядок для отображения в хронологическом порядке
    });

    // Отправляем запрос на историю сообщений серверу
    socket.emit("requestHistory");

    return () => {
      // Отписываемся от события при размонтировании компонента
      socket.off("history");
    };
  }, [socket]);

  const fetchUsersList = async () => {
    try {
      const response = await axios.get("http://localhost:3001/userslist");
      const data = response.data;
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchConversation = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/getConversation",
        {
          params: {
            userId: senderId,
          },
        }
      );
      const data = response.data;
      console.log(data);
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const sendMessage = () => {
    if (!selectedUser) return;
    const newMessage = {
      text: inputValue,
      senderId: Number(senderId),
      recipientId: selectedUser.id,
      sessionId: sessionId,
    };

    // Отправляем сообщение на сервер
    socket.emit("message", newMessage);

    // Очищаем поле ввода
    setInputValue("");
  };

  const sendMessageonConversation = () => {
    if (!selectedConversation) return;
    const newMessage = {
      text: inputValue,
      senderId: Number(senderId),
      sessionId: sessionId,
      conversationId: selectedConversation.id,
    };

    // Отправляем сообщение на сервер
    socket.emit("message", newMessage);

    // Очищаем поле ввода
    setInputValue("");
  };

  useEffect(() => {
    console.log("Selected user has been updated:", selectedUser);
  }, [selectedUser]);
  console.log("messages", messages);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setSelectedConversation(null);
  };

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSelectedUser(null);
    console.log(selectedConversation);
  };

  function handleEmojiSelect(emojiObject) {
    setInputValue(inputValue + emojiObject.emoji);
  }

  function getLastMessage(userId: number) {
    const userMessages = messages.filter(
      (message) => message.senderId === userId || message.recipientId === userId
    );
    if (userMessages.length > 0) {
      const lastMessage = userMessages[userMessages.length - 1];
      return lastMessage.text;
    } else {
      return "No messages yet";
    }
  }

  return (
    <div
      className="chat-container"
      style={{ background: theme.palette.background.paper }}
    >
      <div
        className="users-list"
        style={{
          background: theme.palette.background.default,
          color: theme.palette.text.primary,
        }}
      >
        <h1>Chat</h1>
        {users.map((user) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid",
              paddingTop: "10px",
              paddingBottom: "10px",
            }}
            onClick={() => {
              handleUserClick(user); // Отправляем senderId и recipientId
            }}
          >
            <div
              style={{
                borderRadius: "50%",
                border: "1px solid",
                height: "4vh",
                width: "4vh",
                display: "flex",
                alignItems: "center",
              }}
            >
              <p style={{ marginLeft: "1.2vh" }}>{user.username.charAt(0)}</p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: "7px",
              }}
              key={user.id}
            >
              <p style={{ fontSize: "2vh" }}>{user.username}</p>
              <p style={{ fontSize: "1.6vh" }}>{getLastMessage(user.id)}</p>
            </div>
          </div>
        ))}
        {conversations.map((conversation) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid",
              paddingTop: "10px",
              paddingBottom: "10px",
            }}
            onClick={() => {
              handleConversationClick(conversation);
            }}
          >
            <div
              style={{
                borderRadius: "50%",
                border: "1px solid",
                height: "4vh",
                width: "4vh",
                display: "flex",
                alignItems: "center",
              }}
            >
              <p style={{ marginLeft: "1.2vh" }}>
                {conversation.name.charAt(0)}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: "7px",
              }}
              key={conversation.id}
            >
              <p style={{ fontSize: "2vh" }}>{conversation.name}</p>
              {/* <p style={{ fontSize: "1.6vh" }}>{getLastMessage(user.id)}</p> */}
            </div>
          </div>
        ))}
      </div>
      {selectedUser ? (
        <div
          className="chat-window"
          style={{ background: theme.palette.background.paper }}
        >
          <h2 className="chat-window-header">
            Chatting with {selectedUser.username}
          </h2>
          <div className="chat-messages">
            {messages.map((message) => {
              const sentDate = moment(message.sentAt);
              const formatDate = sentDate.format("hh:mm");

              // Проверяем, является ли отправитель или получатель выбранными пользователями
              const isSender = message.senderId === Number(senderId);
              const isReceiver = message.recipientId === Number(senderId);
              const isBetweenSelectedUsers =
                (isSender && message.recipientId === selectedUser.id) ||
                (isReceiver && message.senderId === selectedUser.id);

              // Отображаем только сообщения, где отправитель или получатель - выбранные пользователи
              if (isBetweenSelectedUsers) {
                return (
                  <div
                    key={message.id}
                    className={`message-container ${
                      isSender ? "sender-message" : "receiver-message"
                    }`}
                  >
                    <div className="message-text">
                      <p className="message-words">{message.text}</p>
                      <p className="message-date">{formatDate}</p>
                    </div>
                  </div>
                );
              }
              return null; // Не отображаем сообщения, которые не соответствуют условиям фильтрации
            })}
          </div>
          <div className="input-container">
            {visibleEmoji && (
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                style={{ position: "absolute", bottom: "7vh", left: "3vh" }}
              />
            )}
            <button
              onClick={() => setVisibleEmoji(!visibleEmoji)}
              className="image-smile"
            >
              <img src={smilePng} alt="smile" />{" "}
            </button>
            <input
              type="text"
              placeholder="Написать сообщение..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  sendMessage();
                } else if (e.key == "Tab") {
                  setVisibleEmoji(!visibleEmoji);
                } else {
                  return;
                }
              }}
            />
            <button onClick={sendMessage}>
              <img src={sendPng} alt="send" />
            </button>
          </div>
        </div>
      ) : selectedConversation ? (
        <div
          className="chat-window"
          style={{ background: theme.palette.background.paper }}
        >
          <h2 className="chat-window-header">{selectedConversation.name}</h2>
          <div className="chat-messages">
            {messages.map((message) => {
              const sentDate = moment(message.sentAt);
              const formatDate = sentDate.format("hh:mm");

              const isSender = message.senderId === Number(senderId);
              return (
                <div
                  key={message.id}
                  className={`message-container ${
                    isSender ? "sender-message" : "receiver-message"
                  }`}
                >
                  <div className="message-text">
                    <p className="message-words">{message.text}</p>
                    <p className="message-date">{formatDate}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="input-container">
            {visibleEmoji && (
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                style={{ position: "absolute", bottom: "7vh", left: "3vh" }}
              />
            )}
            <button
              onClick={() => setVisibleEmoji(!visibleEmoji)}
              className="image-smile"
            >
              <img src={smilePng} alt="smile" />{" "}
            </button>
            <input
              type="text"
              placeholder="Написать сообщение..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
                  sendMessageonConversation();
                } else if (e.key == "Tab") {
                  setVisibleEmoji(!visibleEmoji);
                } else {
                  return;
                }
              }}
            />
            <button onClick={sendMessageonConversation}>
              <img src={sendPng} alt="send" />
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            top: "50%",
            right: "35%",
            height: "2vh",
          }}
        >
          <h1>Выберите диалог</h1>
        </div>
      )}
    </div>
  );
};

export default MainChatPage;
