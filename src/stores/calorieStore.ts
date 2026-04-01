import { create } from "zustand";
import dayjs from "dayjs";
import {
  getCalorieEntries,
  createCalorieEntry,
  updateCalorieEntry,
  deleteCalorieEntry,
} from "@/services/calorieService";
import type { CalorieEntry, CreateCalorieEntryDto } from "@/types/calorie";

interface CalorieState {
  entries: CalorieEntry[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
  fetchEntries: (token: string) => Promise<void>;
  addEntry: (token: string, data: CreateCalorieEntryDto) => Promise<void>;
  editEntry: (
    token: string,
    id: string,
    data: CreateCalorieEntryDto,
  ) => Promise<void>;
  removeEntry: (token: string, id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
}

export const useCalorieStore = create<CalorieState>((set, get) => ({
  entries: [],
  loading: false,
  error: null,
  selectedDate: dayjs().format("YYYY-MM-DD"),

  fetchEntries: async (token: string) => {
    const { selectedDate } = get();
    set({ loading: true, error: null });
    try {
      const endDate = dayjs(selectedDate).add(1, "day").format("YYYY-MM-DD");
      const res = await getCalorieEntries(token, {
        startDate: selectedDate,
        endDate,
        pageSize: 100,
      });
      set({ entries: res.data });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "加载失败" });
    } finally {
      set({ loading: false });
    }
  },

  addEntry: async (token: string, data: CreateCalorieEntryDto) => {
    await createCalorieEntry(token, data);
    await get().fetchEntries(token);
  },

  editEntry: async (token: string, id: string, data: CreateCalorieEntryDto) => {
    await updateCalorieEntry(token, id, data);
    await get().fetchEntries(token);
  },

  removeEntry: async (token: string, id: string) => {
    await deleteCalorieEntry(token, id);
    set((state) => ({ entries: state.entries.filter((e) => e._id !== id) }));
  },

  setSelectedDate: (date: string) => set({ selectedDate: date }),
}));
