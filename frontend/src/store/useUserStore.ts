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

interface UserState {
  currentUser: User | null;
  users: User[];
  activeUsers: User[];
  isAuthenticated: boolean;
  token?: string;

  page: number;
  limit: number;
  totalUsers: number;
  loadingUsers: boolean;

  register: (user: Partial<User>) => Promise<User | null>;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<User | null>;
  getCurrentUser: () => Promise<void>;
  setToken: (token: string) => void;

  loadUsers: (
    search: string,
    options?: { reset?: boolean; limit?: number }
  ) => Promise<void>;

  setActiveUsers: () => Promise<void>;
  removeActiveUser: (id: string) => void;
  addActiveUser: (user: User) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      currentUser: null,
      users: [],
      activeUsers: [],
      isAuthenticated: false,
      token: undefined,

      page: 1,
      limit: 20,
      totalUsers: 0,
      loadingUsers: false,

      register: async (user) => await registerUser(user),

      login: async ({ email, password }) => {
        const loggedInUser = await loginUser({ email, password });
        const accessToken = window.localStorage.getItem("accessToken") || "";
        if (loggedInUser) {
          set({
            currentUser: loggedInUser,
            isAuthenticated: true,
            token: accessToken,
          });
        }
        return loggedInUser;
      },

      setToken: (token) => set({ token }),

      getCurrentUser: async () => {
        try {
          const res = await axios.get("/api/users/profile");
          set({ currentUser: res.data.data, isAuthenticated: true });
        } catch {
          set({ currentUser: null, isAuthenticated: false });
        }
      },

      loadUsers: async (search, options = {}) => {
        const { page, limit, users, loadingUsers } = get();
        if (loadingUsers) return;

        const reset = options.reset ?? false;
        const nextPage = reset ? 1 : page;
        const fetchLimit = options.limit ?? limit;

        set({ loadingUsers: true });

        try {
          const { users: newUsers, totalItems } = await fetchUsers({
            search,
            page: nextPage,
            limit: fetchLimit,
            filterMain: true,
          });

          const updatedUsers = reset ? newUsers : [...users, ...newUsers];

          set({
            users: updatedUsers,
            page: nextPage + 1,
            totalUsers: totalItems,
            limit: fetchLimit,
            loadingUsers: false,
          });
        } catch (err) {
          console.error("Failed to load users", err);
          set({ loadingUsers: false });
        }
      },

      setActiveUsers: async () => {
        const { users } = await fetchUsers({
          isOnline: true,
          filterMain: true,
        });
        set({ activeUsers: users });
      },

      removeActiveUser: (id: string) =>
        set((state) => ({
          activeUsers: state.activeUsers.filter((user) => user._id !== id),
        })),

      addActiveUser: (user: User) =>
        set((state) => {
          if (state.activeUsers.some((u) => u._id === user._id)) return {};
          return { activeUsers: [...state.activeUsers, user] };
        }),
    }),
    { name: "user-store" }
  )
);

export const userStore = useUserStore;
