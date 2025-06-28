import { Request, Response } from "express";
import userServices from "../services/userServices";
import { UserQueryParams } from "../types";

export const fetchUsers = async (req: Request, res: Response) => {
  try {
    const { sortBy, orderBy, filterMain } = req.query as UserQueryParams;

    const allowedSortFields = ["createdAt", "name"];

    if (sortBy && !allowedSortFields.includes(sortBy)) {
      res.status(400).json({
        message: "Invalid sort field. Allowed fields: createdAt, name",
      });
      return;
    }

    if (orderBy && !["asc", "desc"].includes(orderBy)) {
      res
        .status(400)
        .json({ message: "Invalid sort order. Allowed values: asc, desc." });
      return;
    }

    let data = await userServices.fetchUsers(req.query);

    if (filterMain) {
      data.users = data.users.filter(
        (user) => (user._id as string)?.toString() != req?.userId?.toString()
      );
    }

    res.status(200).json({
      message: "Users fetched successfully",
      users: data.users,
      totalItems: data.totalItems,
    });
  } catch (err: any) {
    console.error("Error while fetching users", err);
    res
      .status(500)
      .json({ message: "error while fetching users", error: err.message });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const user = await userServices.getUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (err: any) {
    console.error("Error while fetching user profile", err);
    res.status(500).json({
      message: "error while fetching user profile",
      error: err.message,
    });
  }
};
