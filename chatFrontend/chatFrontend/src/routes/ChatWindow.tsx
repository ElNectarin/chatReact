import { useTheme } from "@mui/material/styles";

const ChatWindow = ({ header, messages, sendMessage, selectedUser }) => {
  const theme = useTheme();
  return (
    <div
      className="chat-window"
      style={{ background: theme.palette.background.paper }}
    >
      <div>
        <h2
          className="chat-window-header"
          style={{ color: selectedUser ? "" : "#000" }}
        >
          {header}
        </h2>
      </div>

      <div className="chat-messages">
        {messages.map((message) => {
          const sentDate = moment(message.sentAt);
          const formatDate = sentDate.format("hh:mm");

          const isSender = message.senderId === Number(senderId);
          const isReceiver = message.recipientId === Number(senderId);
          const isBetweenSelectedUsers =
            (isSender &&
              message.recipientId ===
                (selectedUser ? selectedUser.id : selectedConversation.id)) ||
            (isReceiver &&
              message.senderId ===
                (selectedUser ? selectedUser.id : selectedConversation.id));

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
          return null;
        })}
      </div>

      <input
        type="text"
        placeholder="Написать сообщение..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            selectedUser ? sendMessage() : sendMessageonConversation();
          } else if (e.key === "Tab") {
            setVisibleEmoji(!visibleEmoji);
          }
        }}
      />
      <button onClick={selectedUser ? sendMessage : sendMessageonConversation}>
        <img src={sendPng} alt="send" />
      </button>
    </div>
  );
};

export default ChatWindow;
