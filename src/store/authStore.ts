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
  user: User | null;
  isLoading: boolean;
  login: (password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  checkSession: async () => {
    set({ isLoading: true });
    // onAuthStateChanged fires immediately with the persisted auth state,
    // then continues listening for sign-in / sign-out events.
    return new Promise<void>((resolve) => {
      let resolved = false;
      onAuthStateChanged(auth, (user) => {
        set({ isAuthenticated: !!user, user, isLoading: false });
        if (!resolved) {
          resolved = true;
          resolve();
        }
      });
    });
  },

  login: async (password: string, email: string = 'admin@genos.dev') => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      set({ isAuthenticated: true, user });
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ isAuthenticated: false, user: null });
  },
}));
