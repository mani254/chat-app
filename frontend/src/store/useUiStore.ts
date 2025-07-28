import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: (value?: boolean) => void;
  theme: "light-theme" | "navyDark" | "dark" | "pink";
  setTheme: (
    theme: "light-theme" | "navyDark" | "dark" | "pink" | "orange"
  ) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isSidebarOpen: true,
      theme: "light-theme",

      toggleSidebar: (value?: boolean) => {
        if (typeof value === "boolean") {
          set({ isSidebarOpen: value }, false, "toggleSidebar:set");
        } else {
          set(
            (state) => ({ isSidebarOpen: !state.isSidebarOpen }),
            false,
            "toggleSidebar:toggle"
          );
        }
      },

      setTheme: (theme: "light-theme" | "navyDark" | "dark" | "pink") => {
        set({ theme }, false, "setTheme");
      },
    }),
    { name: "ui-store" }
  )
);
