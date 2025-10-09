import { toast } from "sonner";
import { User, UserQueryParams } from "../types";
import api from "./api";

// --- API Helpers ---
export async function registerUser(user: Partial<User>): Promise<User | null> {
  try {
    const response = await api.post<{ message: string; data: User }>(
      "/api/auth/register",
      user
    );
    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, "error while registering user");
    toast.error("Error registring user", {
      description: errorMessage,
    });
    return null;
  }
}

export async function fetchUsers(
  params: UserQueryParams
): Promise<{ users: User[]; totalItems: number }> {
  try {
    const response = await api.get<{
      message: string;
      users: User[];
      totalItems: number;
    }>("/api/users", { params });
    return response.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, "error while fetching users");
    toast.error("Error fetching user", {
      description: errorMessage,
    });
    return { users: [], totalItems: 0 };
  }
}

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<User | null> {
  try {
    const response = await api.post<{
      message: string;
      data: User;
    }>("/api/auth/login", credentials);
    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, "error while logging in user");
    toast.error("Error loging user", {
      description: errorMessage,
    });
    return null;
  }
}

export const signOut = async (): Promise<{ message: string } | null> => {
  try {
    const response = await api.post<{ message: string }>("/api/auth/logout");
    return response.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, "error while logging out");
    toast.error("Error while logout", {
      description: errorMessage,
    });
    return null;
  }
};
