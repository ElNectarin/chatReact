import { DataTypes, Model } from "sequelize";
import { sequelize } from "../dbconfig";
import { io } from "../../index";
import { User } from "./user";
import { Conversation } from "./conversation";

export { io } from "../../index";

class Message extends Model {
  public id!: number;
  public text!: string;
  public senderId!: number;
  public recipientId!: number;
  public sentAt!: Date;
  public conversationId!: number;

  static initializeModel() {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        text: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        senderId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        recipientId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        sentAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        conversationId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "Message",
      }
    );
  }

  static associate() {
    this.belongsTo(User, { as: "sender", foreignKey: "senderId" });
    this.belongsTo(User, { as: "recipient", foreignKey: "recipientId" });
    this.belongsTo(Conversation, {
      foreignKey: "conversationId",
      as: "conversation",
    });
  }

  static async createMessage(
    senderId: number,
    recipientId: number,
    text: string,
    conversationId?: number
  ): Promise<Message> {
    const message = await Message.create({
      senderId,
      recipientId,
      text,
      sentAt: new Date(),
      conversationId,
    });

    return message;
  }
}

Message.initializeModel();

export { Message };
