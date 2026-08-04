import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;

  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      hasHydrated: false,

      login: async (credentials: { email: string; password: string }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Ошибка входа");
          }

          set({
            user: data.user,
            token: data.token,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Ошибка входа",
          });
          throw error;
        }
      },

      register: async (data: { email: string; password: string; name: string }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const response = await res.json();

          if (!res.ok) {
            throw new Error(response.error || "Ошибка регистрации");
          }

          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            error: null,
          });

          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Ошибка регистрации",
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          // ignore
        }
        set({ user: null, token: null, error: null });
      },

      fetchUser: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) {
            set({ user: null, token: null });
            return;
          }

          const data = await res.json();
          set({ user: data.user });
        } catch {
          set({ user: null, token: null });
        }
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            state.setHasHydrated(true);
          }
        };
      },
    }
  )
);
