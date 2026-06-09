import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserSession } from "../types/schemas";

interface AuthState {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserSession, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "lms-auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);