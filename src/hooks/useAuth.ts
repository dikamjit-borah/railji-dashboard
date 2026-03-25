'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSession, clearSession, isTokenExpired, refreshToken, type User } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkAndRefreshToken = useCallback(async () => {
    const currentUser = getSession();
    
    if (!currentUser) {
      setUser(null);
      return false;
    }

    if (isTokenExpired()) {
      if (isRefreshing) return false; // Prevent multiple refresh attempts
      
      setIsRefreshing(true);
      try {
        const refreshedUser = await refreshToken();
        if (refreshedUser) {
          setUser(refreshedUser);
          return true;
        } else {
          clearSession();
          setUser(null);
          return false;
        }
      } finally {
        setIsRefreshing(false);
      }
    }

    setUser(currentUser);
    return true;
  }, [isRefreshing]);

  useEffect(() => {
    const initAuth = async () => {
      await checkAndRefreshToken();
      setLoading(false);
    };

    initAuth();

    // Set up periodic check
    const interval = setInterval(checkAndRefreshToken, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAndRefreshToken]);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    isRefreshing,
    login,
    logout,
    checkAndRefreshToken,
    isAuthenticated: !!user,
  };
}