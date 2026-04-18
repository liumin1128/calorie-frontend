"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { getFullProfile } from "@/services/userService";

interface User {
  id: string;
  email: string;
  nickname: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    nickname?: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "calorie_token";
const USER_KEY = "calorie_user";
const AUTH_COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days = AUTH_COOKIE_DAYS) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { setProfileFromAuth } = useUserProfile();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化：从 localStorage 恢复登录状态，并重新获取完整 profile
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.id && parsed?.email) {
          setToken(savedToken);
          setUser(parsed);
          getFullProfile(savedToken)
            .then((profile) => setProfileFromAuth(profile, savedToken))
            .catch(() => {});
        } else {
          localStorage.removeItem(USER_KEY);
        }
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveAuth = (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setCookie(TOKEN_KEY, token);
    setToken(token);
    setUser(user);
  };

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login(email, password);
      saveAuth(res.access_token, res.user);
      setProfileFromAuth(res.user, res.access_token);
    },
    [setProfileFromAuth],
  );

  const register = useCallback(
    async (email: string, password: string, nickname?: string) => {
      const res = await api.register(email, password, nickname);
      saveAuth(res.access_token, res.user);
      setProfileFromAuth(res.user, res.access_token);
    },
    [setProfileFromAuth],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    deleteCookie(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setProfileFromAuth(null);
    router.push("/login");
  }, [router, setProfileFromAuth]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
