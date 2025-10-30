// services/messageService.ts
import { Message, MessageDocument, MessageQueryParams, User } from '@workspace/database';
import { Types } from 'mongoose';

class MessageService {
  private getMatchStage(query: MessageQueryParams): Record<string, any> {
    const { chatId, senderId, messageType, search } = query;

    const matchStage: Record<string, any> = {};

    if (chatId && Types.ObjectId.isValid(chatId)) {
      matchStage.chat = new Types.ObjectId(chatId);
    }

    if (senderId && Types.ObjectId.isValid(senderId)) {
      matchStage.sender = new Types.ObjectId(senderId);
    }

    if (messageType && ['text', 'media', 'note'].includes(messageType)) {
      matchStage.messageType = messageType;
    }

    if (search && search.trim() !== '') {
      matchStage.content = { $regex: search, $options: 'i' };
    }

    return matchStage;
  }

  async fetchMessages(query: MessageQueryParams): Promise<{ totalItems: number; messages: MessageDocument[] }> {
    try {
      const { sortBy = 'createdAt', orderBy = 'desc', page, limit, fetchFields, includeChat = false } = query;

      const skip = Number(query?.skip) || (page && limit ? (Number(page) - 1) * Number(limit) : 0);

      const matchStage = this.getMatchStage(query);

      const messageStages: any[] = [{ $sort: { [sortBy]: orderBy === 'desc' ? -1 : 1 } }, { $skip: skip }];

      if (limit) {
        messageStages.push({ $limit: Number(limit) });
      }

      if (fetchFields && Object.keys(fetchFields).length > 0) {
        messageStages.push({ $project: fetchFields });
      }

      const pipeline = [
        { $match: matchStage },
        // Populate sender
        {
          $lookup: {
            from: 'users',
            localField: 'sender',
            foreignField: '_id',
            as: 'sender',
          },
        },
        {
          $unwind: {
            path: '$sender',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'messages',
            localField: 'replyTo',
            foreignField: '_id',
            as: 'replyTo',
          },
        },
        {
          $unwind: {
            path: '$replyTo',
            preserveNullAndEmptyArrays: true,
          },
        },
        ...(includeChat
          ? [
              {
                $lookup: {
                  from: 'chats',
                  localField: 'chat',
                  foreignField: '_id',
                  as: 'chat',
                },
              },
              {
                $unwind: {
                  path: '$chat',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ]
          : []),

        {
          $facet: {
            totalItems: [{ $count: 'count' }],
            messages: messageStages,
          },
        },
        {
          $project: {
            totalItems: {
              $ifNull: [{ $arrayElemAt: ['$totalItems.count', 0] }, 0],
            },
            messages: 1,
          },
        },
      ];
      const [result] = await Message.aggregate(pipeline);

      if (!result) {
        return { totalItems: 0, messages: [] };
      }

      // ✅ Fix: properly handle async user lookups
      const formattedMessages = await Promise.all(
        result.messages.map(async (message: any) => {
          if (message?.replyTo?.sender) {
            const user = await User.findById(message.replyTo.sender);
            return {
              ...message,
              replyTo: {
                ...message.replyTo,
                sender: user || 'Unknown user',
              },
            };
          }
          return message;
        }),
      );

      return {
        ...result,
        messages: formattedMessages,
      };
    } catch (error: any) {
      console.error('Error while fetching messages:', error);
      throw new Error(error.message);
    }
  }

  async getMessageById(messageId: Types.ObjectId): Promise<any> {
    try {
      const message = await Message.findById(messageId).populate('sender', '-password').populate('chat');

      if (!message) {
        throw new Error('Message not found');
      }

      return message;
    } catch (error: any) {
      console.error('Error while fetching message by ID:', error);
      throw new Error(error.message);
    }
  }

  async createMessage(messageData: any): Promise<MessageDocument> {
    try {
      const message = await Message.create(messageData);
      return message;
    } catch (error: any) {
      console.error('Error while creating message:', error);
      throw new Error(error.message);
    }
  }
}

export default new MessageService();
