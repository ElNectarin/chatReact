import bcrypt from "bcrypt";
import express, { Application } from "express";
import session from "express-session";
import http from "http";
const pgSession = require("connect-pg-simple");
import { Server, Socket } from "socket.io";
import cors from "cors";
import { sequelize } from "./src/dbconfig";
import { Request, Response } from "express";
import { User } from "./src/models/user";
import bodyParser from "body-parser";
import { Op, QueryTypes } from "sequelize";
import { Message } from "./src/models/message";
import { Conversation } from "./src/models/conversation";
import { ConversationParticipant } from "./src/models/conversationParticipant";
import { getConversationsForUser } from "./src/service/consersationService";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const port = process.env.PORT || 3001;

const app: Application = express();
app.use(bodyParser.json());

const SequelizeStore = pgSession(session);
const sessionMiddleware = session({
  store: new SequelizeStore({
    db: sequelize,
    tableName: "session",
    conString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/chatApp",
  }),
  secret: "your_secret_here", // Замените "your_secret_here" на ваш секретный ключ
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
});

app.use(sessionMiddleware);
app.use(cors());

User.initializeModel();
Message.initializeModel();
Conversation.initializeModel();

User.associate();
Message.associate();
Conversation.associate();

async function initializeDatabase() {
  try {
    await sequelize.sync(); // Этот метод создаст таблицы, если их нет
    console.log("База данных успешно инициализирована");
  } catch (error) {
    console.error("Ошибка при инициализации базы данных:", error);
  }
}

// Вызов функции инициализации базы данных перед запуском сервера
initializeDatabase();

// Регистрация пользователя
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.create({ username, password });
    req.session.userId = user.id; // Устанавливаем идентификатор пользователя в сессию
    res.status(201).json({ message: "Пользователь успешно зарегистрирован" });
    console.log(req.session.userId);
  } catch (error) {
    console.error("Ошибка при регистрации пользователя:", error);
    res
      .status(500)
      .json({ error: "Произошла ошибка при регистрации пользователя" });
  }
});

// Аутентификация пользователя
app.post(
  "/login",
  async (
    { body: { username, password, socketId }, session, sessionID },
    res
  ) => {
    try {
      console.log("Attempting login for username:", username);
      const user = await User.findOne({ where: { username } });

      if (!user) {
        console.log("User not found");
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        console.log("Password incorrect");
        return res.status(401).json({ error: "Invalid username or password" });
      }

      session.userId = user.id;
      console.log("Session data after setting userId:", session);
      user.sessionId = sessionID;
      console.log("user.sessiondId", user.sessionId);

      if (!socketId) {
        return res.status(400).json({ error: "Socket ID is missing" });
      }

      user.socketId = socketId; // Сохраняем socketId в базе данных
      await user.save();
      console.log("User socketId saved:", user.socketId);

      return res.json({
        message: "User successfully authenticated",
        userId: user.id,
        sessionId: sessionID,
      });
    } catch (error) {
      console.error("Error authenticating user:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while authenticating user" });
    }
  }
);

app.post("/logout", async (req, res) => {
  const { username } = req.body;

  try {
    // Находим пользователя по имени пользователя
    const user = await User.findOne({ where: { username } });

    if (user) {
      // Удаляем sessionId у пользователя (или какой-то другой идентификатор сессии, который вы используете)
      user.sessionId = null;
      user.socketId = "";
      await user.save();

      res.json({ message: `Пользователь ${username} успешно вышел` });
    } else {
      res.status(404).json({ error: `Пользователь ${username} не найден` });
    }
  } catch (error) {
    console.error("Ошибка при выходе пользователя:", error);
    res.status(500).json({ error: "Произошла ошибка при выходе пользователя" });
  }
});

app.post("/conversations", async (req: Request, res: Response) => {
  const { name, participants } = req.body;
  console.log("Name:", name);
  console.log("Participants:", participants);

  try {
    const conversation = await Conversation.createConversation(
      name,
      participants
    );
    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/getConversation", async (req: Request, res: Response) => {
  try {
    const userIdString = req.query.userId as string; // Получаем userId из параметров запроса и преобразуем к строке
    const userId = parseInt(userIdString, 10); // Преобразуем userId из строки в число
    console.log("User ID:", userId);

    // Вызываем функцию, чтобы получить список бесед для пользователя
    const userConversations = await getConversationsForUser(userId);

    res.json(userConversations);
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    res.status(500).json({ error: "Error fetching user conversations" });
  }
});

app.get("/userslist", async (req: Request, res: Response) => {
  try {
    // Получаем всех пользователей из базы данных
    const allUsers = await User.findAll();
    // console.log("allUsers: ", allUsers);

    // Отправляем список пользователей клиенту
    res.json(allUsers);
  } catch (error) {
    // Обрабатываем ошибку, если что-то пошло не так
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

const server = http.createServer(app);
const io = new Server().attach(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.use((socket: Socket, next: (err?: Error | undefined) => void) => {
  sessionMiddleware(
    socket.request as Request,
    {} as Response,
    (err?: Error | string) => {
      if (typeof err === "string") {
        next(new Error(err));
      } else {
        next(err);
      }
    }
  );
});

io.on("connection", async (socket: Socket) => {
  const request = socket.request as Request;
  try {
    const sessionId = socket.handshake.query.sessionId;

    console.log("socket.handshake.query", socket.handshake.query);
    console.log("sessionId", sessionId);
    const user = await User.findOne({ where: { sessionId } });

    if (user) {
      console.log("User connected:", user.id, socket.id);
      user.socketId = socket.id; // Сохраняем socketId пользователя в базе данных
      await user.save();
    }

    socket.on("message", async (data) => {
      try {
        console.log("Received message data:", data);
        const { recipientId, senderId, text, sessionId, conversationId } = data;

        // Извлекаем сессию из базы данных или кэша на основе sessionId
        const session = await User.findOne({ where: { sessionId: sessionId } });

        // Проверяем, аутентифицирован ли пользователь или истекла ли сессия
        if (!session || !session.id) {
          console.error("User not authenticated or session expired.");
          return;
        }

        // Проверяем, совпадает ли отправитель с текущим пользователем
        if (Number(senderId) !== session.id) {
          console.error("senderId", senderId);
          console.error("session.id", session.id);
          console.error("Sender ID does not match current user.");
          return;
        }

        const sender = await User.findByPk(session.id);
        console.log("sender", sender);
        if (!sender) {
          console.error("Sender not found in database for userId:", session.id);
          return;
        }

        if (!conversationId) {
          const recipient = await User.findByPk(recipientId);

          if (!recipient) {
            console.error("Recipient not found in database:", recipientId);
            return;
          }
          const message = await sender.sendMessage(
            recipientId,
            text,
            conversationId
          );
          message.senderId = senderId; // Добавляем senderId к сообщению
          message.sentAt = new Date();
          await message.save();

          // Проверяем, если отправитель не является также получателем, и отправляем сообщение получателю
          if (senderId !== recipientId) {
            const recipientSocket = io.sockets.sockets.get(recipient.socketId);
            if (recipientSocket) {
              recipientSocket.emit("message", { recipientId, senderId, text });
            } else {
              console.error(
                "Recipient socket not found for recipientId:",
                recipientId
              );
            }
          }

          // Отправляем сообщение отправителю
          const senderSocket = io.sockets.sockets.get(socket.id);
          if (senderSocket) {
            senderSocket.emit("message", { recipientId, senderId, text });
          } else {
            console.error("Sender socket not found for senderId:", senderId);
            // Обработка случая, когда сокет отправителя не найден
          }
        } else {
          const conversation = await Conversation.findByPk(conversationId);

          if (!conversation) {
            console.error("Беседа не найдена в базе данных:", conversationId);
            return;
          }

          const message = await sender.sendMessage(0, text, conversationId);
          message.sentAt = new Date();
          await message.save();

          // Получаем всех участников беседы из модели ConversationParticipant
          const participants = await ConversationParticipant.findAll({
            where: {
              conversationId: conversation.id,
              userId: {
                [Op.ne]: senderId, // Исключаем отправителя из получателей сообщения
              },
            },
            include: [User],
          });

          participants.forEach(async (participant) => {
            const participantSocket = io.sockets.sockets.get(socket.id);
            if (participantSocket) {
              participantSocket.emit("message", {
                text,
                senderId,
                conversationId,
              });
            } else {
              console.error(
                "Сокет участника не найден для userId:",
                participant.userId
              );
            }
          });
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    });

    socket.on("requestHistory", async () => {
      try {
        // Извлекаем сессию из базы данных или кэша на основе sessionId
        const session = await User.findOne({
          where: { sessionId: socket.handshake.query.sessionId },
        });

        // Проверяем, аутентифицирован ли пользователь или истекла ли сессия
        if (!session || !session.id) {
          console.error("User not authenticated or session expired.");
          return;
        }

        // Получаем список групповых чатов, в которых участвует пользователь
        const conversations = await Conversation.findAll({
          include: [
            {
              model: User,
              where: { id: session.id },
            },
          ],
        });

        const conversationIds = conversations.map(
          (conversation) => conversation.id
        );

        // Получаем историю сообщений для текущего пользователя
        const historyMessages = await Message.findAll({
          where: {
            [Op.or]: [{ senderId: session.id }, { recipientId: session.id }],
          },
          order: [["createdAt", "DESC"]],
          limit: 50,
        });

        const groupMessages = await Message.findAll({
          where: { conversationId: conversationIds },
          order: [["createdAt", "DESC"]],
          limit: 50,
        });

        const allMessages = [...historyMessages, ...groupMessages];

        // Отправляем историю сообщений клиенту
        socket.emit("history", allMessages);
      } catch (error) {
        console.error("Error handling requestHistory:", error);
      }
    });

    socket.on("disconnect", async () => {
      // Обработка отключения пользователя
      if (request.session && request.session.userId) {
        try {
          const user = await User.findByPk(request.session.userId);

          if (user) {
            user.sessionId = null;
            user.socketId = "";
            await user.save();
            console.log(`User ${user.username} disconnected`);
          }
        } catch (error) {
          console.error("Error fetching user from database:", error);
        }
      }
    });
  } catch (error) {
    console.error("Error handling socket connection:", error);
  }
});

export { io };

app.use((req: Request, res: Response, next) => {
  console.log("Session established:", req.session); // Выводим содержимое сессии
  next();
});

server.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
