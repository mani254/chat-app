import { Types } from "mongoose";
import User from "../models/User";
import { UserFetchResult, UserQueryParams } from "../types";

class UserService {
  private getMatchState(query: UserQueryParams): Record<string, any> {
    const { search, isOnline } = query;
    let matchStage: Record<string, any> = {};

    if (search && search.trim() !== "") {
      matchStage.name = { $regex: search, $options: "i" };
    }

    matchStage.isOnline = Boolean(isOnline);

    return matchStage;
  }

  async fetchUsers(query: UserQueryParams): Promise<UserFetchResult> {
    try {
      const {
        sortBy = "createdAt",
        orderBy = "desc",
        page,
        limit,
        fetchFields,
      } = query;

      const skip = page && limit ? (Number(page) - 1) * Number(limit) : 0;
      const matchStage = this.getMatchState(query);

      // Build dynamic stages
      const userStages: any[] = [
        { $sort: { [sortBy]: orderBy === "desc" ? -1 : 1 } },
        { $skip: skip },
      ];

      if (limit) {
        userStages.push({ $limit: Number(limit) });
      }

      // Add $project only if fetchFields is provided
      if (fetchFields && Object.keys(fetchFields).length > 0) {
        userStages.push({ $project: fetchFields });
      }

      const pipeline = [
        { $match: matchStage },
        {
          $facet: {
            totalItems: [{ $count: "count" }],
            users: userStages,
          },
        },
        {
          $project: {
            totalItems: { $arrayElemAt: ["$totalItems.count", 0] },
            users: 1,
          },
        },
      ];

      const [result] = await User.aggregate(pipeline as any[]);
      return result || { totalItems: 0, users: [] };
    } catch (error: any) {
      console.error("Error while fetching users:", error);
      throw new Error(error.message);
    }
  }

  async getUserById(userId: Types.ObjectId): Promise<any> {
    try {
      const user = await User.findById(userId).select("-password");
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error: any) {
      console.error("Error while fetching user by ID:", error);
      throw new Error(error.message);
    }
  }
}
export default new UserService();
