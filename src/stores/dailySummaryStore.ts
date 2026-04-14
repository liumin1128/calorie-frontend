import { create } from "zustand";
import dayjs from "dayjs";
import { getDailySummary } from "@/services/calorieService";
import type { DailySummaryMap } from "@/types/calorie";

const STORAGE_PREFIX = "daily_summary_";

function cacheKey(month: string) {
  return `${STORAGE_PREFIX}${month}`;
}

const memoryCache = new Map<string, DailySummaryMap>();

function loadFromSession(month: string): DailySummaryMap | null {
  const mem = memoryCache.get(month);
  if (mem) return mem;
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(cacheKey(month));
    if (raw) {
      const parsed = JSON.parse(raw) as DailySummaryMap;
      memoryCache.set(month, parsed);
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveToSession(month: string, data: DailySummaryMap) {
  memoryCache.set(month, data);
  try {
    sessionStorage.setItem(cacheKey(month), JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

interface DailySummaryState {
  currentMonth: string; // "YYYY-MM"
  summaryMap: DailySummaryMap;
  loading: boolean;
  error: string | null;
  fetchSummary: (token: string, options?: { force?: boolean }) => Promise<void>;
  setMonth: (month: string) => void;
}

export const useDailySummaryStore = create<DailySummaryState>((set, get) => ({
  currentMonth: dayjs().format("YYYY-MM"),
  summaryMap: loadFromSession(dayjs().format("YYYY-MM")) ?? {},
  loading: false,
  error: null,

  fetchSummary: async (token: string, options?: { force?: boolean }) => {
    const { currentMonth } = get();

    if (!options?.force) {
      const cached = loadFromSession(currentMonth);
      if (cached && Object.keys(cached).length > 0) {
        set({ summaryMap: cached, error: null });
        return;
      }
    }

    const start = dayjs(currentMonth).startOf("month").format("YYYY-MM-DD");
    const end = dayjs(currentMonth).endOf("month").format("YYYY-MM-DD");

    set({ loading: true, error: null });
    try {
      const data = await getDailySummary(token, start, end);
      saveToSession(currentMonth, data);
      set({ summaryMap: data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "加载失败" });
    } finally {
      set({ loading: false });
    }
  },

  setMonth: (month: string) => {
    const cached = loadFromSession(month);
    set({
      currentMonth: month,
      summaryMap: cached ?? {},
      error: null,
    });
  },
}));
