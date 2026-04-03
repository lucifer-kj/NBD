"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe, login as loginApi, loginWithGoogle as loginWithGoogleApi } from "@/lib/api-client";

interface User {
  id: string | number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined' || typeof window.localStorage.getItem !== 'function') {
      setHydrated(true);
      return;
    }
    try {
      const token = window.localStorage.getItem("naaz_access_token");
      if (!token) {
        setHydrated(true);
        return;
      }
      getMe()
        .then((me) => {
          setUser({
            id: me.id,
            email: me.email,
            name: `${me.first_name} ${me.last_name}`.trim(),
          });
        })
        .finally(() => setHydrated(true));
    } catch {
      setHydrated(true);
    }
  }, []);

  const applySession = async () => {
    const me = await getMe();
    setUser({
      id: me.id,
      email: me.email,
      name: `${me.first_name} ${me.last_name}`.trim(),
    });
  };

  const login = async (email: string, password: string) => {
    const tokens = await loginApi(email, password);
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined' || typeof window.localStorage.setItem !== 'function') return;
    try {
      window.localStorage.setItem("naaz_access_token", tokens.access);
    } catch {
      // Ignore localStorage errors
    }
    await applySession();
  };

  const loginWithGoogle = async (idToken: string) => {
    const tokens = await loginWithGoogleApi(idToken);
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined' || typeof window.localStorage.setItem !== 'function') return;
    try {
      window.localStorage.setItem("naaz_access_token", tokens.access);
    } catch {
      // Ignore localStorage errors
    }
    await applySession();
  };

  const logout = () => {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined' || typeof window.localStorage.removeItem !== 'function') return;
    try {
      window.localStorage.removeItem("naaz_access_token");
    } catch {
      // Ignore localStorage errors
    }
    setUser(null);
  };

  if (!hydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
