import { create } from 'zustand';
import { auth } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  isLoading: boolean;
  login: (password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@genos.dev';

export const isAdminUser = (user: User | null): boolean =>
  !!user && user.email === ADMIN_EMAIL;

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  isLoading: true,

  checkSession: async () => {
    set({ isLoading: true });
    return new Promise<void>((resolve) => {
      let resolved = false;
      onAuthStateChanged(auth, (user) => {
        set({ isAuthenticated: !!user, isAdmin: isAdminUser(user), user, isLoading: false });
        if (!resolved) {
          resolved = true;
          resolve();
        }
      });
    });
  },

  login: async (password: string, email: string = ADMIN_EMAIL) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      set({ isAuthenticated: true, isAdmin: isAdminUser(user), user });
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ isAuthenticated: false, isAdmin: false, user: null });
  },
});
