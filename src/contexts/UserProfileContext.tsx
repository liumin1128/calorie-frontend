"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getFullProfile } from "@/services/userService";
import type { UserFullProfile } from "@/types/user";

interface UserProfileContextType {
  profile: UserFullProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<UserFullProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getFullProfile(token);
      setProfile(data);
    } catch {
      // 获取失败不阻断使用，保留已有认证状态
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 登录后自动加载用户信息
  useEffect(() => {
    if (user && token) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [user, token, refreshProfile]);

  return (
    <UserProfileContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx)
    throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
}
