import { create } from 'zustand';

/**
 * Authentication Store
 * Manages admin authentication state for portfolio protection
 */

interface AuthState {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  checkSession: () => void;
}

// Admin password - In production, this should be environment variable
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'portfolio2024';

// Session key
const SESSION_KEY = 'portfolioOS_auth_session';

/**
 * Check if there's an active session
 */
const hasActiveSession = (): boolean => {
  const session = sessionStorage.getItem(SESSION_KEY);
  if (!session) return false;

  try {
    const { timestamp, authenticated } = JSON.parse(session);
    const now = Date.now();
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours

    // Check if session is still valid
    if (authenticated && (now - timestamp) < sessionDuration) {
      return true;
    }

    // Session expired
    sessionStorage.removeItem(SESSION_KEY);
    return false;
  } catch (e) {
    sessionStorage.removeItem(SESSION_KEY);
    return false;
  }
};

/**
 * Create authentication session
 */
const createSession = (): void => {
  const session = {
    authenticated: true,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

/**
 * Clear authentication session
 */
const clearSession = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: hasActiveSession(),

  login: (password: string) => {
    if (password === ADMIN_PASSWORD) {
      createSession();
      set({ isAuthenticated: true });
      console.log('Admin authentication successful');
      return true;
    }
    console.warn('Authentication failed: Invalid password');
    return false;
  },

  logout: () => {
    clearSession();
    set({ isAuthenticated: false });
    console.log('Admin logged out');
  },

  checkSession: () => {
    const isValid = hasActiveSession();
    set({ isAuthenticated: isValid });
    if (!isValid) {
      console.log('Session expired or invalid');
    }
  },
}));
