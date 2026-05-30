import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number; // ms, 0 for persistent
  createdAt: number;
}

interface NotificationState {
  notifications: Notification[];
  toastIds: string[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  dismissToast: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const NOTIFICATION_STORAGE_KEY = 'genos_notifications';
const MAX_NOTIFICATIONS = 30;

const loadNotifications = (): Notification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Notification[];
    return Array.isArray(parsed) ? parsed.slice(-MAX_NOTIFICATIONS) : [];
  } catch {
    return [];
  }
};

const saveNotifications = (notifications: Notification[]) => {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications.slice(-MAX_NOTIFICATIONS)));
  } catch {
    // Local notification history is helpful, not critical.
  }
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: loadNotifications(),
  toastIds: [],

  addNotification: (notification) => {
    const id = generateId();
    const newNotification: Notification = {
      id,
      ...notification,
      createdAt: Date.now(),
      duration: notification.duration ?? 5000, // Default 5 seconds
    };

    set((state) => {
      const notifications = [...state.notifications, newNotification].slice(-MAX_NOTIFICATIONS);
      saveNotifications(notifications);
      return {
        notifications,
        toastIds: [...state.toastIds, id],
      };
    });

    // Toasts can auto-dismiss. Notification Center items stay until manually cleared.
    if ((newNotification.duration ?? 0) > 0) {
      setTimeout(() => {
        set((state) => ({
          toastIds: state.toastIds.filter((toastId) => toastId !== id),
        }));
      }, newNotification.duration);
    }
  },

  dismissToast: (id) =>
    set((state) => ({
      toastIds: state.toastIds.filter((toastId) => toastId !== id),
    })),

  removeNotification: (id) =>
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      saveNotifications(notifications);
      return {
        notifications,
        toastIds: state.toastIds.filter((toastId) => toastId !== id),
      };
    }),

  clearAll: () => {
    saveNotifications([]);
    set({ notifications: [], toastIds: [] });
  },
}));
