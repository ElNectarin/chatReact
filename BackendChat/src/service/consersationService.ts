import { User } from "../models/user";
import { ConversationParticipant } from "../models/conversationParticipant";
import { Conversation } from "../models/conversation";

async function getConversationsForUser(
  userId: number
): Promise<Conversation[]> {
  // Найти всех участников бесед, в которых участвует данный пользователь
  const participants = await ConversationParticipant.findAll({
    where: { userId: userId },
  });

  console.log("participants", participants);

  // Извлечь идентификаторы бесед из участников
  const conversationIds = participants.map(
    (participant) => participant.conversationId
  );

  // Найти беседы по идентификаторам
  const conversations = await Conversation.findAll({
    where: { id: conversationIds },
  });

  return conversations;
}

export { getConversationsForUser };
