import { DataTypes, Model } from "sequelize";
import { sequelize } from "../dbconfig";
import { User } from "./user";
import { Conversation } from "./conversation";

class ConversationParticipant extends Model {
  public id!: number;
  public userId!: number;
  public conversationId!: number;

  static initializeModel() {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        conversationId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      { sequelize, modelName: "ConversationParticipants" }
    );
  }

  static associate() {
    this.belongsTo(User, { foreignKey: "userId" });
    this.belongsTo(Conversation, { foreignKey: "conversationId" });
  }
}

ConversationParticipant.initializeModel();
ConversationParticipant.associate();

export { ConversationParticipant };
