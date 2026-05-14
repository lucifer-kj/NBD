"use client";
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useCartStore } from "@/store/cart-store";
import { Customer } from "@/types/shopify";

interface AuthContextType {
  user: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (input: { firstName: string; lastName: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false, error: 'Not initialized' }),
  register: async () => ({ success: false, error: 'Not initialized' }),
  logout: async () => {},
  refreshSession: async () => {},
  loginWithGoogle: async () => ({ success: false, error: 'Not initialized' }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cartId = useCartStore(state => state.cartId);
  const initCart = useCartStore(state => state.initCart);

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Listen for cross-tab logout
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-sync-logout') {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, cartId })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await refreshSession();
        await initCart();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, [cartId, refreshSession, initCart]);

  const register = useCallback(async (input: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, cartId })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await refreshSession();
        await initCart();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, [cartId, refreshSession, initCart]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Trigger cross-tab sync
      localStorage.setItem('auth-sync-logout', Date.now().toString());
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    try {
      const res = await fetch('/api/auth/google/one-tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, cartId })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await refreshSession();
        await initCart();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Google login failed' };
      }
    } catch {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, [cartId, refreshSession, initCart]);

  const value = useMemo(() => ({ 
    user, 
    isAuthenticated: !!user, 
    isLoading, 
    login, 
    register, 
    logout, 
    refreshSession, 
    loginWithGoogle 
  }), [user, isLoading, login, register, logout, refreshSession, loginWithGoogle]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
