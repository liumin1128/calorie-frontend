import { create } from "zustand";
import { getSuggestion } from "@/services/adviceService";

const STORAGE_KEY = "health_advice_cache";

interface HealthAdviceState {
  advice: string | null;
  loading: boolean;
  error: string | null;
  fetchAdvice: (token: string, options?: { force?: boolean }) => Promise<void>;
  clearAdvice: () => void;
}

function loadFromSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveToSession(value: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore storage errors
  }
}

function removeFromSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

export const useHealthAdviceStore = create<HealthAdviceState>((set, get) => ({
  advice: loadFromSession(),
  loading: false,
  error: null,

  fetchAdvice: async (token: string, options?: { force?: boolean }) => {
    const { advice } = get();
    if (advice && !options?.force) return;
    set({ loading: true, error: null });
    try {
      const result = await getSuggestion(token);
      saveToSession(result.suggestion);
      set({ advice: result.suggestion });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "获取建议失败，请稍后重试",
      });
    } finally {
      set({ loading: false });
    }
  },

  clearAdvice: () => {
    removeFromSession();
    set({ advice: null });
  },
}));
