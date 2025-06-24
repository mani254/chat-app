// Add this import
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "../lib/api";
import { User } from "../types";

interface UserState {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  getCurrentUser: () => Promise<null>;
  register: (user: Partial<User>) => Promise<User>;
  login: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<User>;
}

async function registerUser(user: Partial<User>): Promise<User | null> {
  try {
    const response = await axios.post<{ message: string; data: User }>(
      "/api/auth/register",
      user
    );
    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, "error while loging user");
    window.alert(errorMessage);
    return null;
  }
}

async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<User | null> {
  try {
    const response = await axios.post<{ message: string; data: User }>(
      "/api/auth/login",
      credentials
    );
    return response.data.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message;
    console.error(errorMessage, "error while loging user");
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
    console.error(errorMessage, "error while loging out");
    window.alert(errorMessage);
    return null;
  }
};

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      currentUser: null,
      users: [],
      register: async (user: Partial<User>) => {
        const newUser = await registerUser(user);
        if (newUser) console.log(newUser, "user created succesfully");
      },

      login: async ({
        email,
        password,
      }: {
        email: string;
        password: string;
      }) => {
        const logedInUser = await loginUser({ email, password });
        if (logedInUser) set({ currentUser: logedInUser }, false, "login");
      },

      getCurrentUser: async () => {
        try {
          const res = await axios.get("/api/profile");
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
    }),
    { name: "user-store" }
  )
);
