import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "../lib/api";
import { fetchUsers, loginUser, registerUser, signOut } from "../lib/userApi";
import { User } from "../types";

interface UserState {
  currentUser: User | null;
  users: User[];
  activeUsers: User[];
  isAuthenticated: boolean;
  // token?: string;

  page: number;
  limit: number;
  totalUsers: number;
  loadingUsers: boolean;

  register: (user: Partial<User>) => Promise<User | null>;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<User | null>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  // setToken: (token: string) => void;

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
        if (loggedInUser) {
          set({
            currentUser: loggedInUser,
            isAuthenticated: true,
            // token: undefined,
          });
        }
        return loggedInUser;
      },

      logout: async () => {
        const res = await signOut();
        if (res) {
          set({
            // token: undefined,
            currentUser: null,
            isAuthenticated: false,
            users: [],
            activeUsers: [],
          });
        }
      },

      // setToken: (_token) => set({ token: undefined }),

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
          const exists = state.activeUsers.find((u) => u._id === user._id);
          if (exists) return {};

          return {
            activeUsers: [user, ...state.activeUsers],
          };
        }),
    }),
    { name: "user-store" }
  )
);

export const userStore = useUserStore;
