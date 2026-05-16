'use client';

import { useState, useEffect } from 'react';
import { getSession, clearSession, isTokenExpired, type User } from '@/lib/auth';
import { setTokenExpiredCallback } from '@/lib/api-client';
import LoginForm from './LoginForm';
import { LayoutWrapper } from './LayoutWrapper';
import TokenExpiredModal from './TokenExpiredModal';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false);

  const handleTokenExpired = () => {
    setShowTokenExpiredModal(true);
    setUser(null);
  };

  useEffect(() => {
    // Set up the callback for API client to trigger modal
    setTokenExpiredCallback(handleTokenExpired);

    const initializeAuth = () => {
      const session = getSession();
      
      if (session) {
        // Check if token is expired
        if (isTokenExpired()) {
          // Token expired, show modal
          handleTokenExpired();
        } else {
          setUser(session);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();

    // Set up periodic token expiration check (every minute)
    const interval = setInterval(() => {
      const currentUser = getSession();
      if (currentUser && isTokenExpired()) {
        // Token expired, show modal and clear session
        handleTokenExpired();
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = () => {
    const session = getSession();
    setUser(session);
    setShowTokenExpiredModal(false); // Hide modal on successful login
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setShowTokenExpiredModal(false);
  };

  const handleSignInAgain = () => {
    setShowTokenExpiredModal(false);
    // User will see the login form since user is null
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="flex items-center gap-2 text-warm-400">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user || showTokenExpiredModal) {
    return (
      <>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
        <TokenExpiredModal 
          isOpen={showTokenExpiredModal} 
          onSignInAgain={handleSignInAgain}
        />
      </>
    );
  }

  return (
    // pass the current user down so the sidebar can display their info
    <LayoutWrapper user={user} onLogout={handleLogout}>
      {children}
    </LayoutWrapper>
  );
}
