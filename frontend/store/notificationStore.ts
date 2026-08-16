import { create } from 'zustand';

interface NotificationItem {
  id: string;
  companyId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  route?: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  is_read?: boolean;
  createdAt: string;
}

interface NotificationState {
  toasts: Array<{ id: string; message: string }>;
  notifications: NotificationItem[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  isMarkingAllRead: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Partial<NotificationItem>) => void;
  showToast: (message: string) => void;
  dismissToast: (id: string) => void;
}

const getStoreToken = () => {
  if (typeof window === 'undefined') return null;
  const hasAuthStorage = localStorage.getItem('auth-storage');
  let token = localStorage.getItem('token');
  if (!token && hasAuthStorage) {
    try {
      const auth = JSON.parse(hasAuthStorage);
      token = auth?.state?.token;
    } catch (e) {}
  }
  return token;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  toasts: [],
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  isLoading: false,
  isMarkingAllRead: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const token = getStoreToken();
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const res = await fetch('/api/backend/notifications?limit=20', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        const rawItems = data.items || data.notifications || data || [];
        const items = Array.isArray(rawItems) ? rawItems : [];
        const unread = typeof data.unreadCount === 'number' ? data.unreadCount : items.filter((n: any) => !n.isRead && !n.is_read).length;

        set({
          notifications: items.map((n: any) => ({
            ...n,
            isRead: Boolean(n.isRead ?? n.is_read),
            is_read: Boolean(n.isRead ?? n.is_read),
          })),
          unreadCount: unread,
          totalCount: items.length,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.warn('[NotificationStore] Fetch failed:', err);
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const token = getStoreToken();
      if (!token) return;

      const res = await fetch('/api/backend/notifications/unread-count', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (typeof data.unreadCount === 'number') {
          set({ unreadCount: data.unreadCount });
        }
      }
    } catch (err) {
      console.warn('[NotificationStore] Unread count fetch failed:', err);
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic UI update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));

    try {
      const token = getStoreToken();
      if (!token) return;

      await fetch(`/api/backend/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.warn('[NotificationStore] Mark read failed:', err);
      // Re-sync with backend
      get().fetchNotifications();
    }
  },

  markAllAsRead: async () => {
    set({ isMarkingAllRead: true });
    // Optimistic UI update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true, is_read: true })),
      unreadCount: 0,
    }));

    try {
      const token = getStoreToken();
      if (token) {
        await fetch('/api/backend/notifications/read-all', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.warn('[NotificationStore] Mark all read failed:', err);
      get().fetchNotifications();
    } finally {
      set({ isMarkingAllRead: false });
    }
  },

  addNotification: (notification: Partial<NotificationItem>) =>
    set((state) => {
      const isRead = Boolean(notification.isRead ?? notification.is_read);
      const newItem: NotificationItem = {
        id: notification.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        companyId: notification.companyId || '',
        userId: notification.userId || '',
        type: notification.type || 'GENERAL',
        title: notification.title || 'Notification',
        message: notification.message || '',
        route: notification.route,
        entityType: notification.entityType,
        entityId: notification.entityId,
        isRead,
        is_read: isRead,
        createdAt: notification.createdAt || new Date().toISOString(),
      };

      return {
        notifications: [newItem, ...state.notifications],
        unreadCount: state.unreadCount + (isRead ? 0 : 1),
        totalCount: state.totalCount + 1,
      };
    }),

  showToast: (message: string) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          message,
        },
      ],
    })),

  dismissToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
