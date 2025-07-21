import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: (value?: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isSidebarOpen: true,

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
    }),
    { name: "ui-store" }
  )
);
