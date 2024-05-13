import React, { useState } from "react";
import { Socket } from "socket.io-client";
import { ThemeProvider } from "@mui/material/styles";
import MainChatPage from "./routes/MainChatPage";
import Button from "@mui/material/Button";
import darkTheme from "./theme/darkTheme";
import lightTheme from "./theme/litghtTheme";

interface Props {
  socket: Socket;
}

const App: React.FC<Props> = ({ socket }) => {
  const [theme, setTheme] = useState(lightTheme);
  const toggleTheme = () => {
    setTheme(theme.palette.mode === "light" ? darkTheme : lightTheme);
  };

  // Создаем тему

  return (
    <ThemeProvider theme={theme}>
      <Button onClick={toggleTheme}>Toggle Theme</Button>
      <MainChatPage socket={socket} />
    </ThemeProvider>
  );
};

export default App;
