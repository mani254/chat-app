// services/chatService.ts
import { Types } from "mongoose";
import Chat, { IChat } from "../models/Chat";
import { ChatFetchResult, ChatQueryParams, CreateChatPayload } from "../types";
import messageServices from "./messageServices";

class ChatService {
  private getMatchStage(query: ChatQueryParams): Record<string, any> {
    const { search, userId, isGroupChat } = query;
    const matchStage: Record<string, any> = {};

    if (userId && Types.ObjectId.isValid(userId)) {
      matchStage.users = { $in: [new Types.ObjectId(userId)] };
    } else {
      throw new Error("Invalid userId");
    }

    if (isGroupChat !== undefined) {
      const normalizedIsGroupChat =
        typeof isGroupChat === "string"
          ? isGroupChat === "true"
          : Boolean(isGroupChat);
      matchStage.isGroupChat = normalizedIsGroupChat;
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

      const skip =
        query?.skip || (page && limit) ? (Number(page) - 1) * Number(limit) : 0;
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

  async createChat(
    data: CreateChatPayload,
    userId: Types.ObjectId
  ): Promise<IChat> {
    const { users, isGroupChat, name, groupAdmin } = data;
    const userObjectIds = users.map((id) => {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid user ID: ${id}`);
      }
      return new Types.ObjectId(id);
    });

    if (!isGroupChat) {
      if (userObjectIds.length !== 2) {
        throw new Error("One-on-one chat must contain exactly 2 users");
      }

      const [userA, userB] = userObjectIds;

      const existingChat = await Chat.findOne({
        isGroupChat: false,
        users: { $all: [userA, userB], $size: 2 },
      })
        .populate("users", "-password")
        .populate("latestMessage")
        .populate("groupAdmin", "-password");

      if (existingChat) {
        return existingChat;
      }
    }

    const chatData: Partial<IChat> = {
      users: userObjectIds,
      isGroupChat,
    };

    if (isGroupChat) {
      if (!name || !groupAdmin) {
        throw new Error("Group name and groupAdmin are required");
      }

      if (!Types.ObjectId.isValid(groupAdmin)) {
        throw new Error("Invalid groupAdmin ID");
      }

      chatData.name = name;
      chatData.groupAdmin = new Types.ObjectId(groupAdmin);
    }

    const createdChat = await Chat.create(chatData);
    let messageId = null;
    if (createdChat && userId) {
      messageId = await messageServices.createMessage({
        chat: createdChat._id,
        sender: userId,
        content: "New Chat Was Created",
        messageType: "note",
        readBy: [userId],
        midText: true,
      });
    }

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: createdChat._id },
      { latestMessage: messageId },
      { new: true }
    );

    const populatedChat = await Chat.findById(updatedChat._id)
      .populate("users", "-password")
      .populate("latestMessage", "-password");

    if (!isGroupChat) {
      const userNames = (populatedChat.users as any[])
        .map((u) => u.name.trim())
        .sort((a, b) => a.localeCompare(b));

      const nameForSearch = userNames.join(" - ");

      await Chat.findByIdAndUpdate(createdChat._id, {
        name: nameForSearch,
      });
    }

    return populatedChat;
  }
}

export default new ChatService();
