import { create } from "zustand";
import dayjs from "dayjs";
import {
  getCalorieEntries,
  createCalorieEntry,
  updateCalorieEntry,
  deleteCalorieEntry,
} from "@/services/calorieService";
import type { CalorieEntry, CreateCalorieEntryDto } from "@/types/calorie";
import { getLocalDayRange } from "@/utils/date";

interface CalorieState {
  entriesCache: Record<string, CalorieEntry[]>;
  entries: CalorieEntry[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
  fetchEntries: (token: string, options?: { force?: boolean }) => Promise<void>;
  addEntry: (
    token: string,
    data: CreateCalorieEntryDto,
  ) => Promise<CalorieEntry>;
  editEntry: (
    token: string,
    id: string,
    data: CreateCalorieEntryDto,
  ) => Promise<void>;
  removeEntry: (token: string, id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
}

export const useCalorieStore = create<CalorieState>((set, get) => ({
  entriesCache: {},
  entries: [],
  loading: false,
  error: null,
  selectedDate: dayjs().format("YYYY-MM-DD"),

  fetchEntries: async (token: string, options?: { force?: boolean }) => {
    const { selectedDate, entriesCache } = get();

    // 命中缓存且非强制刷新，直接使用缓存
    if (!options?.force && entriesCache[selectedDate]) {
      set({ entries: entriesCache[selectedDate], error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { startDate, endDate } = getLocalDayRange(selectedDate);
      const res = await getCalorieEntries(token, {
        startDate,
        endDate,
        pageSize: 100,
      });
      set((state) => ({
        entries: res.data,
        entriesCache: { ...state.entriesCache, [selectedDate]: res.data },
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "加载失败" });
    } finally {
      set({ loading: false });
    }
  },

  addEntry: async (token: string, data: CreateCalorieEntryDto) => {
    const entry = await createCalorieEntry(token, data);
    await get().fetchEntries(token, { force: true });
    return entry;
  },

  editEntry: async (token: string, id: string, data: CreateCalorieEntryDto) => {
    await updateCalorieEntry(token, id, data);
    await get().fetchEntries(token, { force: true });
  },

  removeEntry: async (token: string, id: string) => {
    const { selectedDate, entries, entriesCache } = get();
    const prevEntries = entries;
    const prevCache = entriesCache;
    set((state) => {
      const updated = state.entries.filter((e) => e._id !== id);
      return {
        entries: updated,
        entriesCache: { ...state.entriesCache, [selectedDate]: updated },
      };
    });
    try {
      await deleteCalorieEntry(token, id);
    } catch (e) {
      set({ entries: prevEntries, entriesCache: prevCache });
      throw e;
    }
  },

  setSelectedDate: (date: string) => {
    const { entriesCache } = get();
    set({
      selectedDate: date,
      // 切换日期时立即展示缓存数据（如有）
      entries: entriesCache[date] ?? [],
    });
  },
}));
