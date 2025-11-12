// Adjust the import path as necessary
import type { UserDocument } from '@workspace/database/schemas';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '../lib/api';
import { fetchUsers, initiateGoogleLogin, loginUser, registerUser, signOut } from '../lib/userApi';

interface UserState {
  currentUser: UserDocument | null;
  users: UserDocument[];
  activeUsers: UserDocument[];
  isAuthenticated: boolean;

  page: number;
  limit: number;
  totalUsers: number;
  loadingUsers: boolean;

  register: (user: Partial<UserDocument>) => Promise<UserDocument | null>;
  login: (credentials: { email: string; password: string }) => Promise<UserDocument | null>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;

  loadUsers: (search: string, options?: { reset?: boolean; limit?: number }) => Promise<void>;

  setActiveUsers: () => Promise<void>;
  removeActiveUser: (id: string) => void;
  addActiveUser: (user: UserDocument) => void;
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

      loginWithGoogle: async () => {
        const authUrl = await initiateGoogleLogin();
        if (authUrl) {
          // Redirect to Google OAuth
          window.location.href = authUrl;
        }
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
          const res = await api.get('/api/users/profile');
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
          console.error('Failed to load users', err);
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
          activeUsers: state.activeUsers.filter((user) => user._id.toString() !== id),
        })),

      addActiveUser: (user: UserDocument) =>
        set((state) => {
          const exists = state.activeUsers.find((u) => u._id === user._id);
          if (exists) return { activeUsers: state.activeUsers };

          return {
            activeUsers: [user, ...state.activeUsers],
          };
        }),
    }),
    { name: 'user-store' },
  ),
);

export const userStore = useUserStore;
