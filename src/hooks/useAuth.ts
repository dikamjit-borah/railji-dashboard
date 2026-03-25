'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSession, clearSession, isTokenExpired, type User } from '@/lib/auth';
import { setTokenExpiredCallback } from '@/lib/api-client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false);

  const handleTokenExpired = useCallback(() => {
    setShowTokenExpiredModal(true);
    setUser(null);
  }, []);

  const checkTokenExpiration = useCallback(() => {
    const currentUser = getSession();
    
    if (!currentUser) {
      setUser(null);
      return false;
    }

    if (isTokenExpired()) {
      handleTokenExpired();
      return false;
    }

    setUser(currentUser);
    return true;
  }, [handleTokenExpired]);

  useEffect(() => {
    // Set up the callback for API client to trigger modal
    setTokenExpiredCallback(handleTokenExpired);

    const initAuth = () => {
      checkTokenExpiration();
      setLoading(false);
    };

    initAuth();

    // Set up periodic check (every minute)
    const interval = setInterval(checkTokenExpiration, 60 * 1000);
    return () => clearInterval(interval);
  }, [checkTokenExpiration, handleTokenExpired]);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
    setShowTokenExpiredModal(false);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setShowTokenExpiredModal(false);
  }, []);

  const handleSignInAgain = useCallback(() => {
    setShowTokenExpiredModal(false);
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    showTokenExpiredModal,
    handleSignInAgain,
  };
}