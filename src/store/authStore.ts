import { create } from 'zustand';
import { supabase } from '../lib/supabase';

/**
 * Authentication Store
 * Manages admin authentication via Supabase
 */

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  login: (password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,

  // Initialize session check
  checkSession: async () => {
    try {
      set({ isLoading: true });
      const { data: { session } } = await supabase.auth.getSession();

      set({
        isAuthenticated: !!session,
        user: session?.user || null,
        isLoading: false
      });

      // Set up auth state listener for real-time updates
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          isAuthenticated: !!session,
          user: session?.user || null,
          isLoading: false
        });
      });

    } catch (error) {
      console.error('Session check failed:', error);
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  login: async (password: string, email: string = 'admin@genos.dev') => {
    try {
      // In a real scenario, you'd likely have an email input form.
      // For this portfolio OS style, we might default to a specific admin email
      // or require the user to enter it.
      // For now, let's assume valid credentials are passed or we use a hardcoded admin email for Keketso.

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({ isAuthenticated: true, user: data.user });
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, user: null });
  },
}));
