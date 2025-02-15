import { DataTypes, Model } from "sequelize";
import { sequelize } from "../dbconfig";
import bcrypt from "bcrypt";
import { Message } from "./message";
import { io } from "../../index";
import { Conversation } from "./conversation";

export { io } from "../../index";

class User extends Model {
  public id!: number;
  public username!: string;
  public sessionId!: string | null;
  public socketId!: string;
  public password!: string;

  static initializeModel() {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        sessionId: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },
        socketId: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "User",

        indexes: [{ unique: true, fields: ["username"] }],
        hooks: {
          beforeSave: async (user: User) => {
            if (user.changed("password")) {
              const saltRounds = 10;
              const hashedPassword = await bcrypt.hash(
                user.password,
                saltRounds
              );
              user.password = hashedPassword;
            }
          },
        },
      }
    );
  }

  static associate() {
    this.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
    this.hasMany(Message, {
      foreignKey: "recipientId",
      as: "receivedMessages",
    });
    this.belongsToMany(Conversation, {
      through: "ConversationParticipants",
      foreignKey: "userId",
      otherKey: "conversationId",
      as: "conversations",
    });
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  async sendMessage(
    recipientId: number,
    text: string,
    conversationId: number
  ): Promise<Message> {
    const message = await Message.create({
      senderId: this.id,
      recipientId,
      text,
      sentAt: new Date(),
      conversationId,
    });
    return message;
  }
}

User.initializeModel();

export { User };
