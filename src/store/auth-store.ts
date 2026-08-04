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

// Хелперы для localStorage
const getFromStorage = (): { user: User | null; token: string | null } => {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const stored = localStorage.getItem("auth-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.state?.user || null,
        token: parsed.state?.token || null,
      };
    }
  } catch (e) {
    console.error("Failed to parse auth-storage", e);
  }
  return { user: null, token: null };
};

const saveToStorage = (user: User | null, token: string | null) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      "auth-storage",
      JSON.stringify({ state: { user, token } })
    );
  } catch (e) {
    console.error("Failed to save auth-storage", e);
  }
};

export const useAuthStore = create<AuthState>((set, get) => {
  // Инициализируем из localStorage
  const { user: storedUser, token: storedToken } = getFromStorage();

  return {
    user: storedUser,
    token: storedToken,
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
        
        // Явно сохраняем
        saveToStorage(data.user, data.token);

        return data;
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
        
        // Явно сохраняем
        saveToStorage(response.user, response.token);

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
      // Очищаем localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-storage");
      }
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
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth-storage");
          }
          return;
        }

        const data = await res.json();
        set({ user: data.user });
      } catch {
        set({ user: null, token: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
        }
      }
    },

    setUser: (user) => {
      set({ user });
      saveToStorage(user, get().token);
    },
    
    setToken: (token) => {
      set({ token });
      saveToStorage(get().user, token);
    },
    
    setHasHydrated: (v) => set({ hasHydrated: v }),
  };
});

// Инициализация хидрации
if (typeof window !== "undefined") {
  const store = useAuthStore.getState();
  setTimeout(() => {
    store.setHasHydrated(true);
  }, 100);
}
