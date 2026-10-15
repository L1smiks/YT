import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface UserState {
    userId: string | null;
    userName: string | null;
    isLoggedIn: boolean;
    setUser: (user: User) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            userId: null,
            userName: null,
            isLoggedIn: false,
            setUser: (user) => set({ userId: user.id, userName: user.username, isLoggedIn: true }),
            logout: () => set({ userId: null, userName: null, isLoggedIn: false }),
        }),
        { name: 'User' },
    ),
);

/** Current user, or null when signed out. */
export function useCurrentUser(): User | null {
    const userId = useUserStore((s) => s.userId);
    const userName = useUserStore((s) => s.userName);
    return userId && userName ? { id: userId, username: userName } : null;
}
