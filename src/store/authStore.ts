import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

export type AuthRole = 'guest' | 'superuser' | null;

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  role: AuthRole;
  user: User | null;
  isLoading: boolean;
  login: (password: string, email?: string) => Promise<{ success: boolean; error?: string; role?: AuthRole }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@os.com';

const normalizeEmail = (email?: string | null) => (email || '').trim().toLowerCase();

export const isAdminUser = (user: User | null): boolean =>
  !!user && normalizeEmail(user.email) === normalizeEmail(ADMIN_EMAIL);

export const getAuthRole = (user: User | null): AuthRole => {
  if (!user) return null;
  return isAdminUser(user) ? 'superuser' : 'guest';
};

const ensureOsUserProfile = async (user: User, role: Exclude<AuthRole, null>) => {
  await setDoc(
    doc(db, 'os-users', user.uid),
    {
      uid: user.uid,
      email: normalizeEmail(user.email),
      role,
      source: 'generativeos',
      app: 'generativeos',
      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isAdmin: false,
  isGuest: false,
  role: null,
  user: null,
  isLoading: true,

  checkSession: async () => {
    set({ isLoading: true });
    return new Promise<void>((resolve) => {
      let resolved = false;
      onAuthStateChanged(auth, (user) => {
        const role = getAuthRole(user);
        if (user && role) {
          ensureOsUserProfile(user, role).catch((error) => {
            console.error('OS user profile sync failed:', error.message);
          });
        }
        set({
          isAuthenticated: !!user,
          isAdmin: role === 'superuser',
          isGuest: role === 'guest',
          role,
          user,
          isLoading: false,
        });
        if (!resolved) {
          resolved = true;
          resolve();
        }
      });
    });
  },

  login: async (password: string, email: string = ADMIN_EMAIL) => {
    const normalizedEmail = normalizeEmail(email);
    try {
      const { user } = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const role = getAuthRole(user);
      if (role) {
        await ensureOsUserProfile(user, role);
      }
      set({ isAuthenticated: true, isAdmin: role === 'superuser', isGuest: role === 'guest', role, user });
      return { success: true, role };
    } catch (error: any) {
      if (normalizedEmail !== normalizeEmail(ADMIN_EMAIL)) {
        try {
          const { user } = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
          const role = getAuthRole(user);
          if (role) {
            await ensureOsUserProfile(user, role);
          }
          set({ isAuthenticated: true, isAdmin: false, isGuest: true, role, user });
          return { success: true, role };
        } catch (createError: any) {
          console.error('Guest sign-in failed:', createError.message);
          return {
            success: false,
            error: createError.code === 'auth/email-already-in-use'
              ? 'Guest account already exists. Use the password for that email.'
              : createError.message,
          };
        }
      }
      console.error('Superuser login failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ isAuthenticated: false, isAdmin: false, isGuest: false, role: null, user: null });
  },
}));
