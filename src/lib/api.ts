import { useAuthStore } from "@/store/auth-store";

/**
 * Get the current auth token from the auth store.
 * Works on client-side only.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().token;
}

/**
 * Get auth headers for API requests.
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
