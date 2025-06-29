import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "../lib/api";
import { User, UserQueryParams } from "../types";

// --- API Helpers ---
async function registerUser(user: Partial<User>): Promise<User | null> {
  try {
    const response = await axios.post<{ message: string; data: User }>(
      "/api/auth/register",
      user
    );
    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, "error while registering user");
    window.alert(errorMessage);
    return null;
  }
}

async function fetchUsers(
  params: UserQueryParams
): Promise<{ users: User[]; totalItems: number }> {
  try {
    const response = await axios.get<{
      message: string;
      users: User[];
      totalItems: number;
    }>("/api/users", { params });
    return response.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, "error while fetching users");
    window.alert(errorMessage);
    return { users: [], totalItems: 0 };
  }
}

async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<User | null> {
  try {
    const response = await axios.post<{
      message: string;
      data: User;
      accessToken: string;
      refreshToken: string;
    }>("/api/auth/login", credentials);
    const accessToken = response.data.accessToken;
    localStorage.setItem("accessToken", accessToken);
    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, "error while logging in user");
    window.alert(errorMessage);
    return null;
  }
}

export const signOut = async (): Promise<{ message: string } | null> => {
  try {
    const response = await axios.post<{ message: string }>("/api/auth/logout");
    return response.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, "error while logging out");
    window.alert(errorMessage);
    return null;
  }
};

// --- Zustand Store ---
interface UserState {
  currentUser: User | null;
  users: User[];
  activeUsers: User[];
  isAuthenticated: boolean;
  hasMoreUsers: boolean; // NEW: indicates if more users can be fetched
  getCurrentUser: () => Promise<void>;
  setUsers: (
    params: UserQueryParams
  ) => Promise<{ users: User[]; totalItems: number }>;
  setActiveUsers: () => Promise<{ users: User[]; totalItems: number }>;
  removeActiveUser: (id: string) => void;
  addActiveUser: (user: User) => void;
  register: (user: Partial<User>) => Promise<User | null>;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<User | null>;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      currentUser: null,
      users: [],
      isAuthenticated: false,
      hasMoreUsers: true,

      register: async (user) => {
        const newUser = await registerUser(user);
        if (newUser) {
          console.log(newUser, "user created successfully");
        }
        return newUser;
      },

      login: async ({ email, password }) => {
        const loggedInUser = await loginUser({ email, password });
        if (loggedInUser) {
          set(
            { currentUser: loggedInUser, isAuthenticated: true },
            false,
            "login"
          );
        }
        return loggedInUser;
      },

      getCurrentUser: async () => {
        try {
          const res = await axios.get("/api/users/profile");
          const user = res.data.data;
          set(
            { currentUser: user, isAuthenticated: true },
            false,
            "getCurrentUser"
          );
        } catch (err) {
          console.error("Failed to fetch current user", err);
          set(
            { currentUser: null, isAuthenticated: false },
            false,
            "clearUser"
          );
        }
      },

      setUsers: async (params) => {
        const { users, totalItems } = await fetchUsers(params);
        set(
          (state) => {
            const newUsers =
              params.page && params.page > 1
                ? [...state.users, ...(users || [])]
                : users || [];
            const hasMoreUsers = newUsers.length < totalItems - 1;
            return {
              users: newUsers,
              hasMoreUsers,
            };
          },
          false,
          "setUsers"
        );
        return { users, totalItems };
      },

      setActiveUsers: async () => {
        const { users } = await fetchUsers({ isOnline: true });
        set({ activeUsers: users }, false, "setActiveUsers");
      },

      removeActiveUser: (id: string) => {
        set(
          (state) => ({
            activeUsers: state.activeUsers.filter((user) => user._id !== id),
          }),
          false,
          "removeActiveUser"
        );
      },

      addActiveUser: (user: User) => {
        set(
          (state) => {
            if (state.activeUsers.some((u) => u._id === user._id)) {
              return {};
            }
            return { activeUsers: [...state.activeUsers, user] };
          },
          false,
          "addActiveUser"
        );
      },
    }),
    { name: "user-store" }
  )
);
