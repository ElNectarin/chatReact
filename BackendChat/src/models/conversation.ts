import { BelongsToManyAddAssociationsMixin, DataTypes, Model } from "sequelize";
import { sequelize } from "../dbconfig";
import { User } from "./user";
import { Message } from "./message";

class Conversation extends Model {
  public id!: number;
  public name!: string;

  public addUsers!: BelongsToManyAddAssociationsMixin<User, number>;

  static initializeModel() {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "Conversation",
      }
    );
  }

  static associate() {
    this.belongsToMany(User, {
      through: "UserConversation",
      foreignKey: "conversationId",
      otherKey: "userId",
    });
    this.hasMany(Message, { foreignKey: "conversationId" });
  }

  static async createConversation(
    name: string,
    participants: User[]
  ): Promise<Conversation> {
    const conversation = await Conversation.create({ name });
    await conversation.addUsers(participants);
    return conversation;
  }
}

Conversation.initializeModel();

export { Conversation };
