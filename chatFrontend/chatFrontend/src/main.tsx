import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import ProtectedComponent from "./components/ProtectedComponent.tsx";
import { Socket, io } from "socket.io-client";
import MainLoginPage from "./components/LoginRegister/MainLoginPage.tsx";

const isAuthenticated = () => {
  const sessionId = localStorage.getItem("sessionId");
  return !!sessionId;
};

// Создаем сокет с передачей sessionId в query-параметры
const createSocket = () => {
  const sessionId = localStorage.getItem("sessionId");
  if (sessionId) {
    return io("http://localhost:3001", { query: { sessionId } });
  }
  return io("http://localhost:3001", { query: { sessionId } });
};

const socket: Socket | null = createSocket();

// Создание маршрутов
const router = createBrowserRouter([
  {
    path: "/",
    element: isAuthenticated() ? (
      socket ? (
        <App socket={socket} />
      ) : null
    ) : (
      <Navigate to="login" />
    ),
  },
  {
    path: "/login",
    element: <MainLoginPage socket={socket} />,
  },
  {
    path: "/protected",
    element: isAuthenticated() ? (
      <ProtectedComponent />
    ) : (
      <Navigate to="/login" />
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
