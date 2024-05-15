import { sequelize } from "../dbconfig";
import { Conversation } from "./conversation";
import { Message } from "./message";
import { User } from "./user";

// Подключение всех моделей
Conversation.initializeModel();
Message.initializeModel();
User.initializeModel();

// Настройка связей между моделями
Conversation.associate();
Message.associate();
User.associate();

export { sequelize, Conversation, Message, User };
