export interface User {
  username: string;
  userType: 'admin';
}

export function validateCredentials(username: string, password: string): User | null {
  const envUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
  const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  if (username === envUsername && password === envPassword) {
    return { username, userType: 'admin' };
  }

  return null;
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
