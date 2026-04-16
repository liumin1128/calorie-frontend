import { create } from "zustand";
import dayjs from "dayjs";
import { getTodayWaterAmount, setWaterAmount } from "@/services/waterService";

export const WATER_CUP_VOLUME_ML = 250;

interface WaterIntakeState {
  date: string;
  amount: number;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  fetchToday: (token: string) => Promise<void>;
  setAmount: (token: string, amount: number) => Promise<void>;
  setAmountByCup: (token: string, cupCount: number) => Promise<void>;
  clearError: () => void;
}

function getTodayKey() {
  return dayjs().format("YYYY-MM-DD");
}

export const useWaterIntakeStore = create<WaterIntakeState>()((set, get) => ({
  date: getTodayKey(),
  amount: 0,
  loading: false,
  submitting: false,
  error: null,

  fetchToday: async (token: string) => {
    const date = getTodayKey();
    set({ loading: true, error: null, date });
    try {
      const amount = await getTodayWaterAmount(token, date);
      set({ amount, date });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "获取今日饮水失败",
      });
    } finally {
      set({ loading: false });
    }
  },

  setAmount: async (token: string, amount: number) => {
    if (get().loading || get().submitting) return;

    const date = getTodayKey();
    const previousAmount = get().amount;
    set({ amount, date, error: null, submitting: true });

    try {
      const response = await setWaterAmount(token, { date, amount });
      set({ amount: response.amount, date: response.date });
    } catch (error) {
      set({
        amount: previousAmount,
        error: error instanceof Error ? error.message : "设置今日饮水失败",
      });
    } finally {
      set({ submitting: false });
    }
  },

  setAmountByCup: async (token: string, cupCount: number) => {
    const normalizedCupCount = Math.max(0, Math.floor(cupCount));
    await get().setAmount(token, normalizedCupCount * WATER_CUP_VOLUME_ML);
  },

  clearError: () => set({ error: null }),
}));
