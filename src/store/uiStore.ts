import { create } from 'zustand';

export type AuthMode = 'login' | 'register';

interface UiState {
    authMode: AuthMode | null;
    openAuth: (mode?: AuthMode) => void;
    closeAuth: () => void;
    toast: { id: number; message: string } | null;
    showToast: (message: string) => void;
    hideToast: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
    authMode: null,
    openAuth: (mode = 'login') => set({ authMode: mode }),
    closeAuth: () => set({ authMode: null }),
    toast: null,
    showToast: (message) => set({ toast: { id: Date.now(), message } }),
    hideToast: () => set({ toast: null }),
}));
