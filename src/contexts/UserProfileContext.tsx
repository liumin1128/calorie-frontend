"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getFullProfile } from "@/services/userService";
import type { UserFullProfile } from "@/types/user";

interface UserProfileContextType {
  profile: UserFullProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  setProfileFromAuth: (profile: UserFullProfile | null, token?: string) => void;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserFullProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setProfileFromAuth = useCallback(
    (newProfile: UserFullProfile | null, token?: string) => {
      setProfile(newProfile);
      if (newProfile === null) {
        setAuthToken(null);
      } else if (token !== undefined) {
        setAuthToken(token);
      }
    },
    [],
  );

  const refreshProfile = useCallback(async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const data = await getFullProfile(authToken);
      setProfile(data);
    } catch {
      // 获取失败不阻断使用，保留已有认证状态
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  return (
    <UserProfileContext.Provider
      value={{ profile, loading, refreshProfile, setProfileFromAuth }}
    >
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
