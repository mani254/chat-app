import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  isDarkMode: boolean;
  isSidebarOpen?: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isDarkMode: false,
      isSidebarOpen: true,
      toggleTheme: () =>
        set(
          (state) => ({ isDarkMode: !state.isDarkMode }),
          false,
          "toggleTheme"
        ),
      toggleSidebar: () =>
        set(
          (state) => ({ isSidebarOpen: !state.isSidebarOpen }),
          false,
          "toggleSidebar"
        ),
    }),
    { name: "ui-store" }
  )
);
