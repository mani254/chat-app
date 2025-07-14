// controllers/messageController.ts
import { Request, Response } from "express";
import { Types } from "mongoose";
import messageServices from "../services/messageServices";
import { MessageQueryParams } from "../types";

export const fetchMessages = async (req: Request, res: Response) => {
  try {
    const {
      chatId,
      senderId,
      messageType,
      search,
      page,
      limit,
      sortBy,
      orderBy,
      includeChat,
    } = req.query as unknown as MessageQueryParams;

    // Validate required params
    if (!chatId) {
      res.status(400).json({ message: "chatId is required" });
      return;
    }

    const allowedSortFields = ["createdAt", "updatedAt"];
    const allowedOrderValues = ["asc", "desc"];
    const allowedTypes = ["text", "image", "file", "note"];

    if (sortBy && !allowedSortFields.includes(sortBy)) {
      res.status(400).json({
        message: `Invalid sort field. Allowed: ${allowedSortFields.join(", ")}`,
      });
      return;
    }

    if (orderBy && !allowedOrderValues.includes(orderBy)) {
      res.status(400).json({
        message: `Invalid orderBy value. Allowed: ${allowedOrderValues.join(
          ", "
        )}`,
      });
      return;
    }

    if (messageType && !allowedTypes.includes(messageType)) {
      res.status(400).json({
        message: `Invalid messageType. Allowed: ${allowedTypes.join(", ")}`,
      });
      return;
    }

    const data = await messageServices.fetchMessages({
      chatId,
      senderId,
      messageType,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy,
      orderBy,
      includeChat: includeChat === "true", // from query string it's string
    });

    res.status(200).json({
      message: "Messages fetched successfully",
      messages: data.messages,
      totalItems: data.totalItems,
    });
  } catch (error: any) {
    console.error("Error while fetching messages:", error);
    res.status(500).json({
      message: "Error while fetching messages",
      error: error.message,
    });
  }
};

export const getMessageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid message ID format" });
      return;
    }

    const message = await messageServices.getMessageById(
      new Types.ObjectId(id)
    );

    res.status(200).json({
      message: "Message fetched successfully",
      data: message,
    });
  } catch (error: any) {
    console.error("Error while fetching message by ID:", error);
    res.status(500).json({
      message: "Error while fetching message",
      error: error.message,
    });
  }
};
