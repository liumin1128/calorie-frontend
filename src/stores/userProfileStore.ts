import { create } from "zustand";
import { getFullProfile } from "@/services/userService";
import type { UserFullProfile } from "@/types/user";

interface UserProfileState {
  profile: UserFullProfile | null;
  loading: boolean;
  token: string | null;
  setProfile: (profile: UserFullProfile | null) => void;
  setToken: (token: string | null) => void;
  fetchProfile: (token: string) => Promise<void>;
  clearProfile: () => void;
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
  profile: null,
  loading: false,
  token: null,

  setProfile: (profile) => set({ profile }),
  setToken: (token) => set({ token }),

  fetchProfile: async (token: string) => {
    set({ loading: true });
    try {
      const data = await getFullProfile(token);
      set({ profile: data });
    } catch {
      // 获取失败不阻断使用，保留已有状态
    } finally {
      set({ loading: false });
    }
  },

  clearProfile: () => set({ profile: null, token: null }),
}));
