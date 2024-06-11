import React, { Dispatch, SetStateAction, useEffect } from "react";

import "../../styles/LoginPage.scss";
import axios from "axios";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

interface Props {
  socket: Socket;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
}

const LoginPage: React.FC<Props> = ({ socket, page, setPage }) => {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSetUsername: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setUsername(e.target.value);
  };

  const handleSetPassword: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setPassword(e.target.value);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const response = await axios.post(
        "http://localhost:3001/login",
        {
          username: username,
          password: password,
          socketId: socket.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      console.log(data);

      // Проверяем, была ли успешная аутентификация
      if (response.status === 200) {
        console.log(data);
        // Если да, сохраняем sessionId в localStorage
        localStorage.setItem("sessionId", data.sessionId);
        localStorage.setItem("id", data.userId);
        const sessionId = localStorage.getItem("sessionId");
        if (sessionId) {
          navigate("/");
        }
      } else {
        // В противном случае, выводим сообщение об ошибке или выполняем другие действия
        console.error("Ошибка при аутентификации пользователя:", data.error);
      }
    } catch (error) {
      console.error("Ошибка при аутентификации пользователя:", error);
    }
  };

  return (
    <div className="wrapper fadeInDown">
      <div id="formContent">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "2vh",
            marginBottom: "2vh",
          }}
        >
          <h2 className="active" style={{ cursor: "pointer" }}>
            {" "}
            Sign In{" "}
          </h2>
          <h2
            className="inactive underlineHover"
            onClick={() => setPage(page + 1)}
            style={{ cursor: "pointer", marginLeft: "2vh" }}
          >
            Sign Up{" "}
          </h2>
        </div>

        <form onSubmit={handleLoginSubmit}>
          <input
            type="text"
            id="login"
            className="fadeIn second"
            name="login"
            placeholder="username"
            value={username}
            onChange={handleSetUsername}
          />
          <input
            type="password"
            id="password"
            className="fadeIn third"
            name="login"
            placeholder="password"
            onChange={handleSetPassword}
            value={password}
          />
          <input type="submit" className="fadeIn fourth" value="Log In" />
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
