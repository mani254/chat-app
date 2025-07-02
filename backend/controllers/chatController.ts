// controllers/chatController.ts
import { Request, Response } from "express";
import ChatModal from "../models/Chat";
import chatService from "../services/chatServices";
import { ChatQueryParams } from "../types";
export const fetchChats = async (req: Request, res: Response) => {
  try {
    const { sortBy, orderBy, userId } = req.query as ChatQueryParams;

    const allowedSortFields = ["createdAt", "updatedAt", "name"];

    if (sortBy && !allowedSortFields.includes(sortBy)) {
      res.status(400).json({
        message:
          "Invalid sort field. Allowed fields: createdAt, updatedAt, name",
      });
      return;
    }

    if (orderBy && !["asc", "desc"].includes(orderBy)) {
      res
        .status(400)
        .json({ message: "Invalid sort order. Allowed values: asc, desc." });
      return;
    }

    if (!userId) {
      res.status(400).json({ message: "userId is required" });
      return;
    }

    const data = await chatService.fetchChats(req.query);

    const chats = await ChatModal.find();

    console.log(chats, "allchats");

    res.status(200).json({
      message: "Chats fetched successfully",
      chats: data.chats,
      totalItems: data.totalItems,
    });
  } catch (error: any) {
    console.error("Error while fetching chats:", error);
    res
      .status(500)
      .json({ message: "Error while fetching chats", error: error.message });
  }
};
