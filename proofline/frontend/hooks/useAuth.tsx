"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/types";
import { authApi, getStoredToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string; confirm_password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROTECTED_ROUTES = ["/dashboard", "/documents", "/assistant", "/settings"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch {
      setUser(null);
      authApi.logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Route protection
  useEffect(() => {
    if (!loading) {
      const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
      if (isProtected && !user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [loading, user, pathname, router]);

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authApi.login(credentials);
      setUser(res.user);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload: { name: string; email: string; password: string; confirm_password: string }) => {
    setLoading(true);
    try {
      const res = await authApi.signup(payload);
      setUser(res.user);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
