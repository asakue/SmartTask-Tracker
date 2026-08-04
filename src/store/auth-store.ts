import { create } from "zustand";
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  hasHydrated: false,

  login: async (credentials: { email: string; password: string }) => {
    set({ isLoading: true, error: null });
    console.log("[AUTH] Trying to login...", credentials.email);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      const data = await res.json();
      console.log("[AUTH] Login response:", res.status, data);

      if (!res.ok) {
        throw new Error(data.error || "Ошибка входа");
      }

      set({
        user: data.user,
        token: data.token,
        isLoading: false,
        error: null,
      });
      
      console.log("[AUTH] Login successful, user:", data.user);
    } catch (error: any) {
      console.error("[AUTH] Login error:", error);
      set({
        isLoading: false,
        error: error.message || "Ошибка входа",
      });
      throw error;
    }
  },

  register: async (data: { email: string; password: string; name: string }) => {
    set({ isLoading: true, error: null });
    console.log("[AUTH] Trying to register...", data.email);
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const response = await res.json();
      console.log("[AUTH] Register response:", res.status, response);

      if (!res.ok) {
        throw new Error(response.error || "Ошибка регистрации");
      }

      set({
        user: response.user,
        token: response.token,
        isLoading: false,
        error: null,
      });
      
      console.log("[AUTH] Register successful, user:", response.user);
    } catch (error: any) {
      console.error("[AUTH] Register error:", error);
      set({
        isLoading: false,
        error: error.message || "Ошибка регистрации",
      });
      throw error;
    }
  },

  logout: async () => {
    console.log("[AUTH] Logging out");
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    set({ user: null, token: null, error: null });
  },

  fetchUser: async () => {
    const { token } = get();
    if (!token) {
      console.log("[AUTH] No token, skipping fetchUser");
      return;
    }

    try {
      console.log("[AUTH] Fetching user with token");
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.log("[AUTH] fetchUser failed, clearing auth");
        set({ user: null, token: null });
        return;
      }

      const data = await res.json();
      console.log("[AUTH] fetchUser success:", data.user);
      set({ user: data.user });
    } catch {
      console.log("[AUTH] fetchUser error");
      set({ user: null, token: null });
    }
  },

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setHasHydrated: (v) => set({ hasHydrated: v }),
}));

// Инициализация
setTimeout(() => {
  useAuthStore.getState().setHasHydrated(true);
}, 100);
