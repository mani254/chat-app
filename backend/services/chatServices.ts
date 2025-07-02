// services/chatService.ts
import { Types } from "mongoose";
import Chat from "../models/Chat";
import { ChatFetchResult, ChatQueryParams } from "../types";

class ChatService {
  private getMatchStage(query: ChatQueryParams): Record<string, any> {
    const { search, userId, isGroupChat } = query;

    // const matchStage: Record<string, any> = {
    //   users: { $in: [userId] }, // Only chats where the user is a participant
    // };
    const matchStage: Record<string, any> = {};

    if (userId && Types.ObjectId.isValid(userId)) {
      matchStage.users = { $in: [new Types.ObjectId(userId)] };
    } else {
      throw new Error("Invalid userId");
    }

    if (typeof isGroupChat === "boolean") {
      matchStage.isGroupChat = isGroupChat;
    }

    if (search && search.trim() !== "") {
      matchStage.name = { $regex: search, $options: "i" };
    }

    return matchStage;
  }

  async fetchChats(query: ChatQueryParams): Promise<ChatFetchResult> {
    try {
      const {
        sortBy = "updatedAt",
        orderBy = "desc",
        page,
        limit,
        fetchFields,
      } = query;

      const skip = page && limit ? (Number(page) - 1) * Number(limit) : 0;
      const matchStage = this.getMatchStage(query);

      const chatStages: any[] = [
        { $sort: { [sortBy]: orderBy === "desc" ? -1 : 1 } },
        { $skip: skip },
      ];

      if (limit) {
        chatStages.push({ $limit: Number(limit) });
      }

      if (fetchFields && Object.keys(fetchFields).length > 0) {
        chatStages.push({ $project: fetchFields });
      }

      console.log(matchStage, "--matchstage--");
      console.log(fetchFields, "fetechfeilds");
      console.log(chatStages, "chatstages");

      const pipeline = [
        { $match: matchStage },

        // Populate users
        {
          $lookup: {
            from: "users",
            localField: "users",
            foreignField: "_id",
            as: "users",
          },
        },
        {
          $project: {
            ...(fetchFields && Object.keys(fetchFields).length > 0
              ? fetchFields
              : {}),
            users: {
              $map: {
                input: "$users",
                as: "user",
                in: {
                  _id: "$$user._id",
                  name: "$$user.name",
                  email: "$$user.email",
                  isOnline: "$$user.isOnline",
                  avatar: "$$user.avatar",
                },
              },
            },
            latestMessage: 1,
            name: 1,
            isGroupChat: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },

        // Populate latestMessage (no sender)
        {
          $lookup: {
            from: "messages",
            localField: "latestMessage",
            foreignField: "_id",
            as: "latestMessage",
          },
        },
        {
          $unwind: {
            path: "$latestMessage",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $facet: {
            totalItems: [{ $count: "count" }],
            chats: chatStages,
          },
        },
        {
          $project: {
            totalItems: {
              $ifNull: [{ $arrayElemAt: ["$totalItems.count", 0] }, 0],
            },
            chats: 1,
          },
        },
      ];

      const [result] = await Chat.aggregate(pipeline as any[]);
      return result || { totalItems: 0, chats: [] };
    } catch (error: any) {
      console.error("Error while fetching chats:", error);
      throw new Error(error.message);
    }
  }

  async getChatById(chatId: Types.ObjectId): Promise<any> {
    try {
      const chat = await Chat.findById(chatId)
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate({
          path: "latestMessage",
          populate: {
            path: "sender",
            select: "name email",
          },
        });

      if (!chat) {
        throw new Error("Chat not found");
      }

      return chat;
    } catch (error: any) {
      console.error("Error while fetching chat by ID:", error);
      throw new Error(error.message);
    }
  }
}

export default new ChatService();
