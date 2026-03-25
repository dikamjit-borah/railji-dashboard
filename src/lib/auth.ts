import { API_ENDPOINTS } from "./api";
import { apiClient } from "./api-client";

export interface User {
  _id: string;
  username: string;
  userId: string;
  supabaseId: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoggedIn?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: number; // Unix timestamp
}

export async function validateCredentials(email: string, password: string): Promise<User | null> {
  try {
    const result = await apiClient.post(API_ENDPOINTS.signIn, { email, password }, { requireAuth: false });
    
    if (result.success && result.data) {
      const tokenExpiry = Date.now() + (45 * 60 * 1000); // 45 minutes from now
      
      return {
        _id: result.data.user._id,
        username: result.data.user.username,
        userId: result.data.user.userId,
        supabaseId: result.data.user.supabaseId,
        email: result.data.user.email,
        isActive: result.data.user.isActive,
        createdAt: result.data.user.createdAt,
        updatedAt: result.data.user.updatedAt,
        lastLoggedIn: result.data.user.lastLoggedIn,
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        tokenExpiry,
      };
    }

    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export function saveSession(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
}

export function getSession(): User | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_user');
  }
}

export function getAuthHeader(): string | null {
  const user = getSession();
  return user ? `Bearer ${user.accessToken}` : null;
}
export function isTokenExpired(): boolean {
  const user = getSession();
  if (!user || !user.tokenExpiry) return true;
  
  // Check if token expires in the next 5 minutes (buffer time)
  return Date.now() >= (user.tokenExpiry - 5 * 60 * 1000);
}

export function updateUserSession(updates: Partial<User>): void {
  const user = getSession();
  if (user) {
    const updatedUser = { ...user, ...updates };
    saveSession(updatedUser);
  }
}