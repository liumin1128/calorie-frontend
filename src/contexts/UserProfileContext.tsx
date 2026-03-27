"use client";

import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useUserProfileStore } from "@/stores/userProfileStore";
import type { UserFullProfile } from "@/types/user";

interface UserProfileContextType {
  profile: UserFullProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  setProfileFromAuth: (profile: UserFullProfile | null, token?: string) => void;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const profile = useUserProfileStore((s) => s.profile);
  const loading = useUserProfileStore((s) => s.loading);
  const fetchProfile = useUserProfileStore((s) => s.fetchProfile);
  const clearProfile = useUserProfileStore((s) => s.clearProfile);
  const setStoreProfile = useUserProfileStore((s) => s.setProfile);
  const setStoreToken = useUserProfileStore((s) => s.setToken);

  const setProfileFromAuth = useCallback(
    (newProfile: UserFullProfile | null, token?: string) => {
      setStoreProfile(newProfile);
      if (newProfile === null) {
        setStoreToken(null);
        clearProfile();
      } else if (token !== undefined) {
        setStoreToken(token);
      }
    },
    [setStoreProfile, setStoreToken, clearProfile],
  );

  const refreshProfile = useCallback(async () => {
    const token = useUserProfileStore.getState().token;
    if (!token) return;
    await fetchProfile(token);
  }, [fetchProfile]);

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
