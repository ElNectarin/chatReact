// import { Request, Response } from "express";
// import { Message } from "../models/message";
// import { io } from "../../index"; // Импортируем экземпляр сервера сокетов

// async function sendMessage(req: Request, res: Response): Promise<void> {
//   const { text, userId } = req.body;
//   const senderId = req.session.userId as number; // Предполагается, что у вас есть сессии пользователя

//   try {
//     const message = await Message.create({ text, userId: senderId });

//     // Отправляем сообщение через сокеты
//     io.emit("message", message);

//     res
//       .status(201)
//       .json({ message: "Сообщение успешно отправлено", data: message });
//   } catch (error) {
//     console.error("Ошибка при отправке сообщения:", error);
//     res.status(500).json({ error: "Произошла ошибка при отправке сообщения" });
//   }
// }

// async function getMessages(req: Request, res: Response): Promise<void> {
//   const userId = parseInt(req.params.userId);

//   try {
//     const messages = await Message.findAll({
//       where: {
//         userId,
//       },
//     });
//     res.json({ messages });
//   } catch (error) {
//     console.error("Ошибка при получении сообщений:", error);
//     res.status(500).json({ error: "Произошла ошибка при получении сообщений" });
//   }
// }

// export { sendMessage, getMessages };
