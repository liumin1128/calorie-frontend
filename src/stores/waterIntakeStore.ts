import { create } from "zustand";
import dayjs from "dayjs";
import { getWaterAmountByDate, setWaterAmount } from "@/services/waterService";

export const WATER_CUP_VOLUME_ML = 250;

interface WaterIntakeState {
  date: string;
  amount: number;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  fetchByDate: (token: string, date: string) => Promise<void>;
  setAmount: (token: string, date: string, amount: number) => Promise<void>;
  setAmountByCup: (
    token: string,
    date: string,
    cupCount: number,
  ) => Promise<void>;
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

  fetchByDate: async (token: string, date: string) => {
    set({ loading: true, error: null, date });
    try {
      const amount = await getWaterAmountByDate(token, date);
      if (get().date !== date) return;
      set({ amount, date });
    } catch (error) {
      if (get().date !== date) return;
      set({
        error: error instanceof Error ? error.message : "获取今日饮水失败",
      });
    } finally {
      if (get().date === date) {
        set({ loading: false });
      }
    }
  },

  setAmount: async (token: string, date: string, amount: number) => {
    if (get().loading || get().submitting) return;

    const previousAmount = get().amount;
    set({ amount, date, error: null, submitting: true });

    try {
      const response = await setWaterAmount(token, { date, amount });
      if (get().date !== date) return;
      set({ amount: response.amount, date: response.date });
    } catch (error) {
      if (get().date !== date) return;
      set({
        amount: previousAmount,
        error: error instanceof Error ? error.message : "设置今日饮水失败",
      });
    } finally {
      if (get().date === date) {
        set({ submitting: false });
      }
    }
  },

  setAmountByCup: async (token: string, date: string, cupCount: number) => {
    const normalizedCupCount = Math.max(0, Math.floor(cupCount));
    await get().setAmount(
      token,
      date,
      normalizedCupCount * WATER_CUP_VOLUME_ML,
    );
  },

  clearError: () => set({ error: null }),
}));
