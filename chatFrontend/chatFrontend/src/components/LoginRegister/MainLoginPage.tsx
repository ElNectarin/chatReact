import React from "react";
import { Socket } from "socket.io-client";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

interface Props {
  socket: Socket;
}

const MainLoginPage: React.FC<Props> = ({ socket }) => {
  const [page, setPage] = React.useState(0);

  const componentList = [
    <LoginPage socket={socket} page={page} setPage={setPage} />,
    <RegisterPage page={page} setPage={setPage} />,
  ];

  return (
    <div className="App">
      <div>{componentList[page]}</div>
    </div>
  );
};

export default MainLoginPage;
