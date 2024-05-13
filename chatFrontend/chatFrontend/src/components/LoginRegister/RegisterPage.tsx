import axios from "axios";
import React, { Dispatch, SetStateAction } from "react";

interface Props {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
}

const RegisterPage: React.FC<Props> = ({ page, setPage }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSetUsername: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setUsername(e.target.value);
  };

  const handleSetPassword: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setPassword(e.target.value);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      const response = await axios.post(
        "http://localhost:3001/register",
        {
          username: username,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      console.log(data);
    } catch (error) {
      console.error("Ошибка при регистрации пользователя:", error);
    }
  };

  return (
    <div className="wrapper fadeInDown">
      <div id="formContent">
        <h2
          className="inactive underlineHover"
          onClick={() => setPage(page - 1)}
        >
          {" "}
          Sign In{" "}
        </h2>
        <h2 className="active">Sign Up </h2>

        <form onSubmit={handleRegisterSubmit}>
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
            type="text"
            id="password"
            className="fadeIn third"
            name="login"
            placeholder="password"
            onChange={handleSetPassword}
            value={password}
          />
          <input type="submit" className="fadeIn fourth" value="Sign Up" />
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
