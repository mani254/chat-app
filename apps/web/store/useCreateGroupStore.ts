import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface GroupState {
  name: string;
  description: string;
  image: File | string | undefined | null;
  users: string[];

  setName: (name: string) => void;
  setDescription: (desc: string) => void;
  setImage: (image: File | string) => void;
  addUser: (userId: string) => void;
  setUsers: (userIds: string[]) => void;
  resetUsers: () => void;
}

export const useCreateGroupStore = create<GroupState>()(
  devtools(
    (set, get) => ({
      name: '',
      description: '',
      image: null,
      users: [],

      setName: (name: string) => set({ name }),
      setDescription: (desc: string) => set({ description: desc }),
      setImage: (image: File | string) => set({ image }),
      addUser: (userId: string) =>
        set((state) => {
          if (state.users.includes(userId)) return state;
          return { users: [...state.users, userId] };
        }),
      setUsers: (userIds: string[]) => set({ users: Array.from(new Set(userIds)) }),
      resetUsers: () => set({ users: [] }),
    }),
    { name: 'create-group-store' },
  ),
);
