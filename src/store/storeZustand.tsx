import { create } from 'zustand';
import { persist } from 'zustand/middleware'

interface UserState {
  userId: string | null;
  userName: string | null;
  setUserId: (id: string | null) => void;
  setUserName: (username: string | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      userName: null,
      isLoggedIn: false, 

      setUserId: (id) => set({ userId: id }),

      setUserName: (username) => set({ userName: username }),

      setIsLoggedIn: (status) => set({ isLoggedIn: status }), 
    }),
    {name: "User"}
  )
);
