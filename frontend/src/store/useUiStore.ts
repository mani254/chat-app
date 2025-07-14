import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UIState {
  isSidebarOpen?: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isSidebarOpen: true,

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
